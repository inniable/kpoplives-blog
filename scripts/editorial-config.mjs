/**
 * KPOP LIVES — Multi-Language Editorial Personas & K-Pop Glossary
 *
 * Customize this file anytime to add new K-Pop terminology or tweak the
 * editorial voice of each language edition.
 */

export const KPOP_GLOSSARY = [
  // Production & Music Criticism
  { en: 'title track', ko: '타이틀곡', jp: 'タイトル曲', es: 'canción principal (o title track)' },
  { en: 'B-side / b-side track', ko: '수록곡', jp: '収録曲', es: 'cara B / canción del álbum' },
  { en: 'pre-release single', ko: '선공개곡', jp: '先行公開曲', es: 'sencillo de prelanzamiento' },
  { en: 'anti-drop', ko: '안티 드롭(Anti-drop)', jp: 'アンチドロップ', es: 'anti-drop' },
  { en: 'dance break', ko: '댄스 브레이크', jp: 'ダンスブレイク', es: 'dance break' },
  { en: 'killing part', ko: '킬링 파트', jp: 'キリングパート', es: 'killing part (momento clave)' },
  { en: 'point choreography', ko: '포인트 안무', jp: 'ポイントダンス', es: 'coreografía insignia' },
  { en: 'song camp', ko: '송캠프', jp: 'ソングキャンプ', es: 'song camp' },
  { en: 'top-liner', ko: '톱라이너', jp: 'トップライナー', es: 'top-liner (compositor de melodías)' },
  { en: 'easy-listening', ko: '이지리스닝', jp: 'イージーリスニング', es: 'easy-listening' },
  { en: 'UK garage', ko: 'UK 개러지', jp: 'UKガラージ', es: 'UK garage' },
  { en: 'wall-of-sound', ko: '웅장한 사운드 / 월 오브 사운드', jp: '重厚な音像', es: 'muro de sonido' },
  { en: 'A&R team', ko: 'A&R 팀', jp: 'A&Rチーム', es: 'equipo de A&R' },

  // K-Pop Industry & Generations
  { en: '5th-Gen / fifth generation', ko: '5세대', jp: '第5世代', es: 'quinta generación (5.ª gen)' },
  { en: 'comeback', ko: '컴백', jp: 'カムバック', es: 'comeback' },
  { en: 'rookie group', ko: '신인 그룹', jp: '新人グループ', es: 'grupo rookie (debutante)' },
  { en: 'major agency / label', ko: '주요 기획사 / 레이블', jp: '大手事務所／レーベル', es: 'gran agencia / sello discográfico' },
  { en: 'showcase', ko: '쇼케이스', jp: 'ショーケース', es: 'showcase' },
  { en: 'world tour', ko: '월드 투어', jp: 'ワールドツアー', es: 'gira mundial' },
  { en: 'stadium residency / multi-night stadium', ko: '스타디움 다회차 공연', jp: 'スタジアム複数公演', es: 'múltiples noches en estadios' },
  { en: 'headliner', ko: '헤드라이너', jp: 'ヘッドライナー', es: 'cabeza de cartel (headliner)' },
  { en: 'physical album', ko: '실물 음반', jp: 'フィジカル盤', es: 'álbum físico' },
  { en: 'vinyl / LP', ko: '바이닐(LP)', jp: 'レコード（LP）', es: 'vinilo (LP)' },
  { en: 'NFC keyring album', ko: 'NFC 키링 앨범', jp: 'NFCキーリング型アルバム', es: 'álbum llavero NFC' },
  { en: 'merch / MD', ko: 'MD(굿즈)', jp: 'グッズ', es: 'mercancía (merch)' },

  // Fandom & Culture
  { en: 'fandom', ko: '팬덤', jp: 'ファンダム', es: 'fandom' },
  { en: 'lightstick', ko: '응원봉', jp: 'ペンライト', es: 'lightstick' },
  { en: 'photocard', ko: '포토카드(포카)', jp: 'トレカ（フォトカード）', es: 'photocard' },
  { en: 'bias', ko: '최애', jp: '推し', es: 'bias (integrante favorito)' },
  { en: 'maknae', ko: '막내', jp: 'マンネ（末っ子）', es: 'maknae' },
  { en: 'daesang', ko: '대상', jp: '大賞（デサン）', es: 'Daesang (Gran Premio)' },
  { en: 'chart-in', ko: '차트인', jp: 'チャートイン', es: 'entrada en listas' },
  { en: 'all-kill', ko: '올킬', jp: 'オールキル', es: 'all-kill' },
  { en: 'encore stage', ko: '앙코르 무대', jp: 'アンコールステージ', es: 'encore' },
  { en: 'fanmeeting / fanmeet', ko: '팬미팅', jp: 'ファンミーティング', es: 'fanmeeting' },
];

export const LANGUAGE_PERSONAS = {
  ko: {
    name: 'Korean',
    code: 'ko',
    marker: '<!-- ko -->',
    frontmatterKeys: {
      title: 'titleKo',
      description: 'descriptionKo',
      summary: 'summaryKo',
      readTime: 'readTimeKo',
    },
    readTimeExample: '5분 소요',
    persona: `You are a senior Korean music critic and features editor writing for a premier Korean pop-culture magazine (similar in editorial polish to Rolling Stone Korea, IZM, and W Korea).`,
    styleGuide: [
      'Use polished, engaging polite magazine prose (합니다/해요체, primarily 합쇼체 ~합니다/~입니다 with occasional natural conversational transitions).',
      'Eliminate English-to-Korean translationese (번역투): avoid overuse of "~하는 것", "~에 의해", unnecessary passive voice, and literal subject-object ordering.',
      'Rewrite metaphors and idioms into natural, vivid Korean cultural criticism.',
      'Keep artist names, group names, official song/album titles, and widely used English K-Pop terms accurate and natural.',
      'Preserve all Markdown formatting (headings ##/###, blockquotes >, bullet lists -, bold **text**).',
    ],
  },

  jp: {
    name: 'Japanese',
    code: 'jp',
    marker: '<!-- jp -->',
    frontmatterKeys: {
      title: 'titleJp',
      description: 'descriptionJp',
      summary: 'summaryJp',
      readTime: 'readTimeJp',
    },
    readTimeExample: '読了目安 5分',
    persona: `You are a senior Japanese music journalist and K-Pop culture editor writing for a leading Japanese music webzine (similar in editorial voice to Rolling Stone Japan, Real Sound, and Natalie Music).`,
    styleGuide: [
      'Write in refined, natural Japanese editorial prose (です・ます調) that reads like an original feature written by a native Tokyo-based music editor.',
      'Eliminate English translationese (翻訳調): restructure long English clauses into crisp, rhythmic Japanese sentences.',
      'Use proper Japanese editorial punctuation: 「」 for quotes/emphasis, —— for dashes, and natural full-width colons/punctuation where appropriate.',
      'Use authentic Japanese K-Pop fandom and music-press vocabulary (e.g., カムバック, ペンライト, フィジカル盤, 第5世代, 推し, 収録曲).',
      'Keep artist names, group names, and official English song/album titles intact.',
      'Preserve all Markdown formatting (headings ##/###, blockquotes >, bullet lists -, bold **text**).',
    ],
  },

  es: {
    name: 'Spanish',
    code: 'es',
    marker: '<!-- es -->',
    frontmatterKeys: {
      title: 'titleEs',
      description: 'descriptionEs',
      summary: 'summaryEs',
      readTime: 'readTimeEs',
    },
    readTimeExample: '5 min de lectura',
    persona: `You are a senior Spanish-language music journalist and pop-culture critic writing for an international K-Pop & music magazine (similar in voice to Billboard Español, Rolling Stone en Español, and Jenesaispop).`,
    styleGuide: [
      'Write in fluent, idiomatic Neutral Spanish (Español neutro) that feels completely natural to readers across both Latin America (Mexico, Argentina, Chile, Colombia, Peru) and Spain.',
      'Avoid overly regional slang (no voseo, no Spain-only vosotros) while maintaining an evocative, stylish magazine tone.',
      'Use clean Spanish editorial typography: « » for pull-quotes/editorial quotes and natural Spanish sentence cadence (avoid stiff literal calques from English).',
      'Keep globally adopted K-Pop terms natural (comeback, lightstick, fandom, dance break, anti-drop, song camp) without clunky over-translation.',
      'Keep artist names, group names, and official song/album titles intact.',
      'Preserve all Markdown formatting (headings ##/###, blockquotes >, bullet lists -, bold **text**).',
    ],
  },

  en: {
    name: 'English',
    code: 'en',
    marker: null,
    frontmatterKeys: {
      title: 'title',
      description: 'description',
      summary: null,
      readTime: 'readTime',
    },
    readTimeExample: '5 min read',
    persona: `You are a senior English-language music critic and features editor writing for an influential global pop magazine (similar to Pitchfork, NME, and Billboard).`,
    styleGuide: [
      'Write sharp, evocative, rhythmically engaging English music journalism.',
      'Preserve all Markdown formatting (headings ##/###, blockquotes >, bullet lists -, bold **text**).',
    ],
  },
};

export function formatGlossaryForPrompt(targetCode) {
  return KPOP_GLOSSARY.map(
    (entry) => `- "${entry.en}" → ${entry[targetCode] || entry.en}`
  ).join('\n');
}
