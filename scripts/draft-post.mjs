#!/usr/bin/env node
/**
 * KPOP LIVES — Live Google Search Research & GEO Article Draft Generator
 *
 * Usage:
 *   npm run draft -- --briefing
 *   npm run draft -- "5th-gen K-Pop girl groups Billboard chart trends"
 *   npm run draft -- "BTS 2026 world tour announcement" --type news
 *   npm run draft -- "NewJeans & ILLIT sound comparison" --type column --translate
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = process.env.GEMINI_TRANSLATE_MODEL || 'gemini-4-hydrogen';
const POSTS_DIR = path.resolve(process.cwd(), 'src/content/posts');

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
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseArgs(argv) {
  const opts = {
    topic: '',
    briefing: false,
    type: 'column',
    translate: false,
    youtubeId: '',
    cover: '',
    help: false,
  };

  const freeArgs = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--briefing' || arg === '-b') opts.briefing = true;
    else if (arg === '--translate' || arg === '-t') opts.translate = true;
    else if (arg === '--type' && argv[i + 1]) {
      const val = argv[++i].toLowerCase();
      if (val === 'news' || val === 'column') opts.type = val;
    } else if (arg === '--youtube' && argv[i + 1]) {
      opts.youtubeId = argv[++i].trim();
    } else if (arg === '--cover' && argv[i + 1]) {
      opts.cover = argv[++i].trim();
    } else if (!arg.startsWith('-')) {
      freeArgs.push(arg);
    }
  }
  opts.topic = freeArgs.join(' ').trim();
  return opts;
}

function printHelp() {
  console.log(`
KPOP LIVES — 실시간 Google 검색 기반 K-POP 리서치 & 초안 생성기

사용법:
  npm run draft -- --briefing
      → 최근 72시간 내 가장 뜨거운 K-POP 최신 뉴스 5건과 칼럼 추천 주제를 한국어로 브리핑

  npm run draft -- "<주제>" [옵션]
      → 실시간 Google 검색으로 팩트를 수집한 뒤 SEO/GEO 규격 영문 초안(.md) 자동 생성

옵션:
  --type news|column   기사 유형 선택 (기본값: column)
  --youtube <11자리ID> 공식 YouTube MV/티저 ID 자동 삽입 (선택)
  --cover <이미지경로>  커버 이미지 지정 (기본값: 카테고리별 자동 선택)
  --translate, -t      초안 생성 직후 4개 국어(KR/JP/ES) 자동 번역까지 연달아 실행
  --help, -h           도움말 출력
`);
}

function yamlStr(str) {
  return `"${String(str ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ').trim()}"`;
}

function sanitizeSlug(raw) {
  return String(raw || 'kpop-story')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string', description: 'URL-friendly lowercase English slug with hyphens, 3-7 words' },
    title: { type: 'string', description: 'Compelling Pitchfork/Billboard-grade English headline' },
    titleKo: { type: 'string', description: 'Natural Korean headline' },
    description: { type: 'string', description: 'Concise 1-sentence English SEO meta description (under 155 chars)' },
    descriptionKo: { type: 'string', description: 'Concise 1-sentence Korean summary' },
    readTime: { type: 'string', description: 'Estimated English read time, e.g. "5 min read"' },
    readTimeKo: { type: 'string', description: 'Estimated Korean read time, e.g. "5분 소요"' },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '3 to 4 concise English tags (e.g. ["Comeback", "Billboard", "5th-Gen"])',
    },
    summaryEn: { type: 'string', description: '2-3 sentence English TL;DR executive summary for GEO' },
    summaryKo: { type: 'string', description: '2-3 sentence Korean executive summary' },
    keyTakeaways: {
      type: 'array',
      items: { type: 'string' },
      description: '3 crisp factual bullet takeaways in English for AI search citation (GEO)',
    },
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          a: { type: 'string' },
        },
        required: ['q', 'a'],
      },
      description: '2 to 3 clear reader Q&As in English for FAQPage JSON-LD',
    },
    body: {
      type: 'string',
      description:
        'Full original English Markdown article (500-850 words for column, 300-450 words for news). Use ## headings, > blockquote, bullet lists or markdown table where helpful. Never copy text verbatim from external outlets.',
    },
  },
  required: [
    'slug',
    'title',
    'titleKo',
    'description',
    'descriptionKo',
    'readTime',
    'readTimeKo',
    'tags',
    'summaryEn',
    'summaryKo',
    'keyTakeaways',
    'faqs',
    'body',
  ],
};

async function runBriefing(ai) {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`🔎 [${today}] 실시간 Google 검색으로 최신 K-POP 이슈를 수집 중입니다...\n`);

  const response = await ai.interactions.create({
    model: DEFAULT_MODEL,
    tools: [{ type: 'google_search' }],
    system_instruction:
      'You are the managing editor of KPOP LIVES, an English/multilingual K-Pop news & cultural criticism blog. Always verify facts via Google Search and present your editorial briefing in clear Korean.',
    input: `Search Google for the latest K-Pop news, comebacks, Billboard/Spotify chart milestones, world tour announcements, and industry trends from the past 72 hours (around ${today}).

Return a concise, high-signal Korean editorial briefing with:
1. 오늘의 핵심 K-POP 이슈 TOP 5 (각 이슈마다: 핵심 팩트 2줄 + 추천 기사 유형 [news/column] + KPOP LIVES만의 차별화된 칼럼 시각 1줄)
2. 바로 초안을 만들 수 있는 복사-붙여넣기 명령어 예시 3개 (형식: npm run draft -- "주제" --type column)`,
  });

  console.log(response.output_text);
}

async function runDraft(ai, opts) {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`🔎 1단계: "${opts.topic}" 주제로 실시간 Google 검색 리서치 중...`);

  const research = await ai.interactions.create({
    model: DEFAULT_MODEL,
    tools: [{ type: 'google_search' }],
    system_instruction:
      'You are a senior K-Pop investigative researcher. Use Google Search to verify accurate, up-to-date facts, dates, official agency announcements, chart positions, and song/album credits. List only verified facts and note any uncertainties.',
    input: `Research the latest verified facts as of ${today} for this K-Pop ${opts.type} topic: "${opts.topic}".

Provide:
1. Verified timeline, dates, numbers, chart rankings, and official statements.
2. Cultural / musical production context relevant to global K-Pop fans.
3. Key sources / official channels referenced.`,
  });

  const researchNotes = research.output_text || '';
  console.log('✅ 리서치 완료! 2단계: SEO/GEO 규격 영문 기사 초안 작성 중...');

  const draftRes = await ai.interactions.create({
    model: DEFAULT_MODEL,
    system_instruction: [
      'You are a senior English-language K-Pop music critic and features editor writing for KPOP LIVES (editorial polish similar to Pitchfork, Billboard, and NME).',
      'Write 100% original journalism synthesized from the verified research notes below — NEVER copy sentences from external articles.',
      'Optimize for SEO & GEO (Generative Engine Optimization): clear headline, strong TL;DR summary, 3 crisp Key Takeaways, structured subheadings (##), and 2-3 high-intent FAQs.',
      'Do not fabricate quotes or unverified statistics. Stick strictly to verified facts.',
    ].join('\n'),
    input: `Write an original English K-Pop ${opts.type} article based on these verified research notes.

[TOPIC]
${opts.topic}

[ARTICLE TYPE]
${opts.type}

[VERIFIED RESEARCH NOTES]
${researchNotes}`,
    response_format: DRAFT_SCHEMA,
  });

  const data = JSON.parse(draftRes.output_text);
  const slug = sanitizeSlug(data.slug);
  const outPath = path.join(POSTS_DIR, `${slug}.md`);

  const coverImage =
    opts.cover ||
    (opts.type === 'news' ? '/images/cover-world-tour.webp' : '/images/cover-5th-gen.webp');

  const yamlLines = [
    '---',
    `title: ${yamlStr(data.title)}`,
    `titleKo: ${yamlStr(data.titleKo)}`,
    `description: ${yamlStr(data.description)}`,
    `descriptionKo: ${yamlStr(data.descriptionKo)}`,
    `category: ${yamlStr(opts.type)}`,
    `pubDate: ${today}`,
    `author: "KPOP LIVES Editorial"`,
    `readTime: ${yamlStr(data.readTime)}`,
    `readTimeKo: ${yamlStr(data.readTimeKo)}`,
    `tags: [${data.tags.map((t) => yamlStr(t)).join(', ')}]`,
    `coverImage: ${yamlStr(coverImage)}`,
    `featured: false`,
    `summaryEn: ${yamlStr(data.summaryEn)}`,
    `summaryKo: ${yamlStr(data.summaryKo)}`,
  ];

  if (opts.youtubeId) {
    yamlLines.push(`youtubeId: ${yamlStr(opts.youtubeId)}`);
    yamlLines.push(`youtubeTitle: ${yamlStr(data.title)}`);
  }

  if (data.keyTakeaways?.length) {
    yamlLines.push('keyTakeaways:');
    for (const item of data.keyTakeaways) {
      yamlLines.push(`  - ${yamlStr(item)}`);
    }
  }

  if (data.faqs?.length) {
    yamlLines.push('faqs:');
    for (const faq of data.faqs) {
      yamlLines.push(`  - q: ${yamlStr(faq.q)}`);
      yamlLines.push(`    a: ${yamlStr(faq.a)}`);
    }
  }

  yamlLines.push('---', '', data.body.trim(), '');

  fs.writeFileSync(outPath, yamlLines.join('\n'), 'utf8');
  const relPath = path.relative(process.cwd(), outPath);
  console.log(`\n🎉 영문 초안 저장 완료: ${relPath}`);
  console.log(`   제목: ${data.title}`);
  console.log(`   한국어 제목: ${data.titleKo}`);

  if (opts.translate) {
    console.log('\n🌐 --translate 옵션이 켜져 있어 4개 국어 자동 번역을 이어서 실행합니다...\n');
    const child = spawnSync(
      process.execPath,
      [path.resolve(process.cwd(), 'scripts/translate-post.mjs'), relPath],
      { stdio: 'inherit' }
    );
    if (child.status !== 0) {
      process.exit(child.status ?? 1);
    }
  } else {
    console.log('\n👉 다음 단계:');
    console.log(`   1) ${relPath} 내용을 가볍게 검토하세요.`);
    console.log(`   2) 4개 국어 자동 번역: npm run translate -- ${relPath}`);
    console.log(`   3) 배포: git add . && git commit -m "Publish ${slug}" && git push`);
  }
}

async function main() {
  loadDotEnv();
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || (!opts.briefing && !opts.topic)) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY가 .env 파일에 설정되어 있지 않습니다.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  if (opts.briefing) {
    await runBriefing(ai);
  } else {
    await runDraft(ai, opts);
  }
}

main().catch((err) => {
  console.error('❌ 리서치/초안 생성 중 오류가 발생했습니다:', err);
  process.exit(1);
});
