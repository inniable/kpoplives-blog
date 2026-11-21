#!/usr/bin/env node
/**
 * KPOP LIVES — 4-Language Native Editorial Auto-Translator
 *
 * Usage:
 *   npm run translate -- src/content/posts/my-article.md
 *   npm run translate -- src/content/posts/my-article.md --langs ko,jp,es
 *   npm run translate -- --all
 *   npm run translate -- src/content/posts/my-article.md --force --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { LANGUAGE_PERSONAS, formatGlossaryForPrompt } from './editorial-config.mjs';

const DEFAULT_MODEL = process.env.GEMINI_TRANSLATE_MODEL || 'gemini-4-hydrogen';
const POSTS_DIR = path.resolve(process.cwd(), 'src/content/posts');
const MARKER_RE = /^<!--\s*(ko|jp|ja|es)\s*-->$/im;

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function parseArgs(argv) {
  const opts = {
    files: [],
    all: false,
    langs: ['ko', 'jp', 'es'],
    force: false,
    polish: true,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--all') opts.all = true;
    else if (arg === '--force' || arg === '-f') opts.force = true;
    else if (arg === '--no-polish') opts.polish = false;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--langs' && argv[i + 1]) {
      opts.langs = argv[++i]
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .map((s) => (s === 'ja' ? 'jp' : s))
        .filter((s) => ['ko', 'jp', 'es'].includes(s));
    } else if (!arg.startsWith('-')) {
      opts.files.push(arg);
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
KPOP LIVES — 4개 국어 현지 매거진 자동 번역기 (EN → KR / JP / ES)

사용법:
  npm run translate -- <마크다운 파일 경로> [옵션]
  npm run translate -- --all [옵션]

옵션:
  --langs ko,jp,es   번역할 대상 언어 지정 (기본값: ko,jp,es)
  --force, -f        이미 번역이 있는 언어도 새로 다시 번역
  --no-polish        2단계 원어민 윤문(감수) 단계를 생략하고 빠르게 번역
  --dry-run          파일을 수정하지 않고 번역 결과만 미리보기
  --help, -h         도움말 출력

환경 변수 (.env 파일 또는 셸):
  GEMINI_API_KEY          Google AI Studio API 키 (필수)
  GEMINI_TRANSLATE_MODEL  사용할 모델 (기본값: gemini-4-hydrogen)
`);
}

function parsePostFile(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    throw new Error('유효한 YAML frontmatter(---)를 찾을 수 없습니다.');
  }

  const rawFrontmatter = fmMatch[1];
  const rawBody = fmMatch[2];

  // Parse simple YAML key-value pairs while preserving original lines
  const fmLines = rawFrontmatter.split(/\r?\n/);
  const fmMap = {};
  for (const line of fmLines) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).replace(/\\"/g, '"');
      }
      fmMap[m[1]] = val;
    }
  }

  // Split body by <!-- ko -->, <!-- jp -->, <!-- es -->
  const lines = rawBody.split(/\r?\n/);
  const sections = { en: [] };
  let current = 'en';

  for (const line of lines) {
    const m = line.trim().match(MARKER_RE);
    if (m) {
      const code = m[1].toLowerCase() === 'ja' ? 'jp' : m[1].toLowerCase();
      current = code;
      if (!sections[current]) sections[current] = [];
      continue;
    }
    sections[current].push(line);
  }

  const cleanSections = {};
  for (const [k, v] of Object.entries(sections)) {
    const joined = v.join('\n').trim();
    if (joined) cleanSections[k] = joined;
  }

  return { fmLines, fmMap, sections: cleanSections };
}

function yamlEscape(str) {
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ').trim()}"`;
}

function upsertFrontmatterKey(fmLines, key, value, insertAfterKey) {
  const formatted = `${key}: ${yamlEscape(value)}`;
  const existingIdx = fmLines.findIndex((line) => line.startsWith(`${key}:`));
  if (existingIdx !== -1) {
    fmLines[existingIdx] = formatted;
    return;
  }
  if (insertAfterKey) {
    const afterIdx = fmLines.findIndex((line) => line.startsWith(`${insertAfterKey}:`));
    if (afterIdx !== -1) {
      fmLines.splice(afterIdx + 1, 0, formatted);
      return;
    }
  }
  fmLines.push(formatted);
}

const TRANSLATION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Localized magazine headline in the target language' },
    description: { type: 'string', description: 'Concise 1-sentence card excerpt in the target language' },
    summary: { type: 'string', description: '2-3 sentence executive summary for the top summary box in the target language' },
    readTime: { type: 'string', description: 'Localized reading time label (e.g. "5분 소요", "読了目安 5分", "5 min de lectura")' },
    body: { type: 'string', description: 'Full localized article body in clean Markdown' },
  },
  required: ['title', 'description', 'summary', 'readTime', 'body'],
};

async function translateToLanguage(ai, source, targetCode, { polish }) {
  const cfg = LANGUAGE_PERSONAS[targetCode];
  const glossary = formatGlossaryForPrompt(targetCode);

  const systemInstruction = [
    cfg.persona,
    '',
    '## Editorial Style Rules',
    ...cfg.styleGuide.map((rule) => `- ${rule}`),
    '',
    '## K-Pop Domain Glossary (Follow strictly when these concepts appear)',
    glossary,
    '',
    '## Critical Rules',
    '- Never translate artist/group names or official song/album titles.',
    '- Keep Markdown syntax clean (## headings, > blockquotes, - bullet lists, **bold**).',
    '- Return valid JSON matching the requested schema only.',
  ].join('\n');

  const pass1Prompt = `Translate and localize the following K-Pop ${source.category} article from English into ${cfg.name}.
Make it read as if it were originally written by a top native music magazine editor in ${cfg.name}.

[SOURCE METADATA]
- Title: ${source.title}
- Description: ${source.description}
- Read Time: ${source.readTime} (Target format example: "${cfg.readTimeExample}")

[SOURCE MARKDOWN BODY]
${source.body}`;

  const pass1 = await ai.interactions.create({
    model: DEFAULT_MODEL,
    system_instruction: systemInstruction,
    input: pass1Prompt,
    response_format: TRANSLATION_RESPONSE_SCHEMA,
  });

  const draft = JSON.parse(pass1.output_text);

  if (!polish) {
    return draft;
  }

  // Pass 2: Native Editorial Copy-Editing & Polish
  const polishInstruction = [
    `You are the chief copy-editor of a top ${cfg.name} music & pop-culture magazine.`,
    `Your job is to polish a translated K-Pop article so that a native ${cfg.name} speaker cannot tell it was translated from English.`,
    ...cfg.styleGuide.map((rule) => `- ${rule}`),
    '- Fix any stiff literal phrasing, awkward rhythm, or inconsistent K-Pop terms.',
    '- Keep all facts, quotes, and Markdown structure intact.',
  ].join('\n');

  const pass2Prompt = `Review and polish this ${cfg.name} translation against the English original. Elevate the headline, flow, and cultural nuance to native magazine publication quality.

[ENGLISH ORIGINAL]
Title: ${source.title}
Description: ${source.description}
Body:
${source.body}

[${cfg.name.toUpperCase()} DRAFT TO POLISH]
${JSON.stringify(draft, null, 2)}`;

  const pass2 = await ai.interactions.create({
    model: DEFAULT_MODEL,
    system_instruction: polishInstruction,
    input: pass2Prompt,
    response_format: TRANSLATION_RESPONSE_SCHEMA,
  });

  return JSON.parse(pass2.output_text);
}

async function processFile(ai, filePath, opts) {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    return;
  }

  console.log(`\n📄 처리 중: ${path.relative(process.cwd(), absPath)}`);
  const content = fs.readFileSync(absPath, 'utf8');
  const parsed = parsePostFile(content);

  if (!parsed.sections.en) {
    console.error('⚠️  영문 본문이 비어 있어 건너뜁니다.');
    return;
  }

  const source = {
    title: parsed.fmMap.title || '',
    description: parsed.fmMap.description || '',
    category: parsed.fmMap.category || 'column',
    readTime: parsed.fmMap.readTime || '4 min read',
    body: parsed.sections.en,
  };

  let modified = false;

  for (const lang of opts.langs) {
    const cfg = LANGUAGE_PERSONAS[lang];
    const alreadyExists = Boolean(parsed.sections[lang] && parsed.fmMap[cfg.frontmatterKeys.title]);

    if (alreadyExists && !opts.force) {
      console.log(`  ⏭️  [${lang.toUpperCase()}] 이미 번역이 존재합니다 (--force 옵션으로 덮어쓰기 가능).`);
      continue;
    }

    console.log(
      `  🌐 [${lang.toUpperCase()}] ${cfg.name} 번역 중... (${opts.polish ? '2단계 현지 에디터 윤문 포함' : '1단계 빠른 번역'})`
    );

    const result = await translateToLanguage(ai, source, lang, { polish: opts.polish });

    upsertFrontmatterKey(parsed.fmLines, cfg.frontmatterKeys.title, result.title, 'title');
    upsertFrontmatterKey(parsed.fmLines, cfg.frontmatterKeys.description, result.description, 'description');
    upsertFrontmatterKey(parsed.fmLines, cfg.frontmatterKeys.readTime, result.readTime, 'readTime');
    upsertFrontmatterKey(parsed.fmLines, cfg.frontmatterKeys.summary, result.summary, 'summaryKo');

    parsed.sections[lang] = result.body.trim();
    modified = true;

    console.log(`  ✅ [${lang.toUpperCase()}] 완료: "${result.title}"`);
  }

  if (!modified) {
    console.log('  ✨ 변경 사항이 없습니다.');
    return;
  }

  // Reconstruct file: frontmatter + EN + KO + JP + ES
  const bodyParts = [parsed.sections.en];
  for (const code of ['ko', 'jp', 'es']) {
    if (parsed.sections[code]) {
      bodyParts.push(`${LANGUAGE_PERSONAS[code].marker}\n\n${parsed.sections[code]}`);
    }
  }

  const output = `---\n${parsed.fmLines.join('\n')}\n---\n\n${bodyParts.join('\n\n')}\n`;

  if (opts.dryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---\n');
    console.log(output.slice(0, 1200) + (output.length > 1200 ? '\n...(생략)...' : ''));
    console.log('\n--- [END PREVIEW] ---');
  } else {
    fs.writeFileSync(absPath, output, 'utf8');
    console.log(`  💾 저장 완료: ${path.relative(process.cwd(), absPath)}`);
  }
}

async function main() {
  loadDotEnv();
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.all && opts.files.length === 0)) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY가 설정되어 있지 않습니다.');
    console.error('   프로젝트 루트에 .env 파일을 만들고 GEMINI_API_KEY=발급받은키 를 입력해 주세요.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  let targets = opts.files;
  if (opts.all) {
    targets = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => path.join('src/content/posts', f));
  }

  console.log(`🚀 KPOP LIVES 다국어 에디토리얼 번역 시작 (모델: ${DEFAULT_MODEL})`);
  for (const file of targets) {
    await processFile(ai, file, opts);
  }
  console.log('\n🎉 모든 번역 작업이 완료되었습니다!');
}

main().catch((err) => {
  console.error('❌ 번역 중 오류가 발생했습니다:', err);
  process.exit(1);
});
