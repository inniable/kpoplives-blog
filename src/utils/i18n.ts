import type { CollectionEntry } from 'astro:content';

export type Lang = 'en' | 'ko' | 'jp' | 'es';

export const LANGS: Lang[] = ['en', 'ko', 'jp', 'es'];

export const LANG_STATIC_PATHS = [
  { params: { lang: undefined }, props: { lang: 'en' as Lang } },
  { params: { lang: 'ko' }, props: { lang: 'ko' as Lang } },
  { params: { lang: 'jp' }, props: { lang: 'jp' as Lang } },
  { params: { lang: 'es' }, props: { lang: 'es' as Lang } },
];

export const HTML_LANG: Record<Lang, string> = {
  en: 'en',
  ko: 'ko',
  jp: 'ja',
  es: 'es',
};

export const HREFLANG_MAP: Record<Lang, string> = {
  en: 'en',
  ko: 'ko',
  jp: 'ja',
  es: 'es',
};

export const OG_LOCALE: Record<Lang, string> = {
  en: 'en_US',
  ko: 'ko_KR',
  jp: 'ja_JP',
  es: 'es_ES',
};

export function getLangPrefix(lang: Lang): string {
  return lang === 'en' ? '' : `/${lang}`;
}

export function localizePath(lang: Lang, routePath: string): string {
  const clean = routePath.startsWith('/') ? routePath : `/${routePath}`;
  if (lang === 'en') return clean;
  if (clean === '/') return `/${lang}/`;
  return `/${lang}${clean}`;
}

export function stripLangPrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/(ko|jp|es)(\/|$)/, '/');
  return stripped || '/';
}

export function getAlternateUrls(pathname: string, site: URL | string) {
  const baseRoute = stripLangPrefix(pathname);
  return LANGS.map((l) => ({
    lang: l,
    hreflang: HREFLANG_MAP[l],
    href: new URL(localizePath(l, baseRoute), site).toString(),
  }));
}

export function formatDate(date: Date, lang: Lang, short = false): string {
  const localeMap: Record<Lang, string> = {
    en: 'en-US',
    ko: 'ko-KR',
    jp: 'ja-JP',
    es: 'es-ES',
  };
  return date.toLocaleDateString(localeMap[lang], {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
  });
}

export function getPostLocalized(post: CollectionEntry<'posts'>, lang: Lang) {
  const d = post.data;
  const title =
    lang === 'ko'
      ? d.titleKo
      : lang === 'jp'
        ? d.titleJp || d.title
        : lang === 'es'
          ? d.titleEs || d.title
          : d.title;

  const description =
    lang === 'ko'
      ? d.descriptionKo
      : lang === 'jp'
        ? d.descriptionJp || d.description
        : lang === 'es'
          ? d.descriptionEs || d.description
          : d.description;

  const readTime =
    lang === 'ko'
      ? d.readTimeKo
      : lang === 'jp'
        ? d.readTimeJp
        : lang === 'es'
          ? d.readTimeEs
          : d.readTime;

  const summary =
    lang === 'ko'
      ? d.summaryKo
      : lang === 'jp'
        ? d.summaryJp
        : lang === 'es'
          ? d.summaryEs
          : d.summaryEn || d.description;

  const keyTakeaways =
    lang === 'ko'
      ? d.keyTakeawaysKo
      : lang === 'jp'
        ? d.keyTakeawaysJp
        : lang === 'es'
          ? d.keyTakeawaysEs
          : d.keyTakeaways;

  return { title, description, readTime, summary, keyTakeaways };
}

export function extractLangHtml(
  renderedHtml: string | undefined,
  lang: Lang
): { html: string; isFallbackEn: boolean } {
  if (!renderedHtml) return { html: '', isFallbackEn: false };

  const extract = (code: Lang) => {
    const re = new RegExp(
      `<!--kpop-lang-start:${code}-->([\\s\\S]*?)<!--kpop-lang-end:${code}-->`,
      'i'
    );
    const m = renderedHtml.match(re);
    return m ? m[1].trim() : '';
  };

  const target = extract(lang);
  if (target) return { html: target, isFallbackEn: false };

  const enFallback = extract('en');
  if (enFallback) return { html: enFallback, isFallbackEn: lang !== 'en' };

  return { html: renderedHtml, isFallbackEn: false };
}

export const UI: Record<
  Lang,
  {
    siteTagline: string;
    nav: { home: string; news: string; columns: string; about: string };
    footer: {
      desc: string;
      privacy: string;
      terms: string;
      contact: string;
      guide: string;
    };
    home: {
      onAir: string;
      eyebrow: string;
      headlinePre: string;
      headlineAccent: string;
      featured: string;
      readStory: string;
      latestEyebrow: string;
      latestTitle: string;
      all: string;
      news: string;
      columns: string;
      read: string;
    };
    badges: { news: string; column: string; columnFull: string };
    article: {
      backNews: string;
      backColumns: string;
      summaryPill: string;
      summaryLabel: string;
      takeawaysTitle: string;
      fallbackNote: string;
      watchVideo: string;
      faqTitle: string;
      keepReading: string;
      moreTitle: string;
      updated: string;
    };
    archive: {
      newsEyebrow: string;
      newsTitle: string;
      newsDesc: string;
      columnsEyebrow: string;
      columnsTitle: string;
      columnsDesc: string;
    };
  }
> = {
  en: {
    siteTagline: 'Global K-Pop News, Deep-Dive English Columns & Culture — in EN, KR, JP, and ES.',
    nav: { home: 'Home', news: 'News', columns: 'Columns', about: 'About' },
    footer: {
      desc: 'Independent K-Pop newsroom & cultural criticism. Dedicated SEO editions in English, Korean, Japanese, and Spanish.',
      privacy: 'Privacy Policy',
      terms: 'Copyright & Terms',
      contact: 'Contact',
      guide: 'Editorial Guide',
    },
    home: {
      onAir: 'ON AIR',
      eyebrow: 'GLOBAL K-POP NEWSROOM & ENGLISH COLUMNS',
      headlinePre: 'Where K-Pop Sound Meets ',
      headlineAccent: 'Sharp Criticism.',
      featured: 'Featured',
      readStory: 'Read Story →',
      latestEyebrow: 'LATEST DISPATCHES',
      latestTitle: 'Fresh From Seoul & Beyond',
      all: 'All',
      news: 'News',
      columns: 'Columns',
      read: 'Read →',
    },
    badges: { news: 'News', column: 'Column', columnFull: 'English Column' },
    article: {
      backNews: '← Back to News',
      backColumns: '← Back to Columns',
      summaryPill: 'TL;DR',
      summaryLabel: 'Key Summary',
      takeawaysTitle: 'Key Takeaways',
      fallbackNote: '',
      watchVideo: 'Official Video Spotlight',
      faqTitle: 'Frequently Asked Questions',
      keepReading: 'KEEP READING',
      moreTitle: 'More on KPOP LIVES',
      updated: 'Updated',
    },
    archive: {
      newsEyebrow: 'News Desk',
      newsTitle: 'Breaking News & Comebacks',
      newsDesc: 'Fast, curated updates on world tours, album drops, chart milestones, and industry shifts.',
      columnsEyebrow: 'English Columns',
      columnsTitle: 'Deep-Dive Essays & Criticism',
      columnsDesc: 'Long-form commentary exploring K-Pop production trends, fandom culture, and global pop aesthetics.',
    },
  },
  ko: {
    siteTagline: '글로벌 K-POP 뉴스 & 영문 문화 비평 칼럼 — 한국어·영어·일본어·스페인어 지원.',
    nav: { home: '홈', news: '뉴스', columns: '영문 칼럼', about: '소개 & 작성법' },
    footer: {
      desc: '글로벌 팬들을 위한 독립 K-POP 뉴스룸 & 문화 비평 매거진. 영어·한국어·일본어·스페인어 전용 에디션을 제공합니다.',
      privacy: '개인정보처리방침',
      terms: '저작권 및 이용약관',
      contact: '문의하기',
      guide: '작성 가이드',
    },
    home: {
      onAir: '최신 이슈',
      eyebrow: '글로벌 K-POP 뉴스룸 & 영문 칼럼',
      headlinePre: 'K-POP의 오늘을 기록하는 ',
      headlineAccent: '트렌디 영문 칼럼.',
      featured: '추천 아티클',
      readStory: '기사 읽기 →',
      latestEyebrow: '최신 뉴스 & 칼럼',
      latestTitle: '지금 주목해야 할 이야기',
      all: '전체',
      news: '뉴스',
      columns: '영문 칼럼',
      read: '읽기 →',
    },
    badges: { news: '뉴스', column: '영문 칼럼', columnFull: '영문 칼럼' },
    article: {
      backNews: '← 뉴스 목록으로',
      backColumns: '← 영문 칼럼 목록으로',
      summaryPill: 'KR SUMMARY',
      summaryLabel: '핵심 요약',
      takeawaysTitle: '핵심 포인트 (3줄 요약)',
      fallbackNote: '* 이 기사의 본문은 영문 원문으로 제공됩니다. 위 한국어 요약을 참고하며 읽어보세요.',
      watchVideo: '공식 영상 보기',
      faqTitle: '자주 묻는 질문 (FAQ)',
      keepReading: '함께 읽으면 좋은 글',
      moreTitle: '다른 최신 소식 & 칼럼',
      updated: '수정일',
    },
    archive: {
      newsEyebrow: 'K-POP 뉴스',
      newsTitle: '최신 K-POP 소식 & 컴백 뉴스',
      newsDesc: '월드 투어, 새 앨범 발매, 글로벌 차트 기록 등 꼭 알아야 할 K-POP 소식을 빠르게 전합니다.',
      columnsEyebrow: '영문 칼럼',
      columnsTitle: '심층 영문 칼럼 & 음악 비평',
      columnsDesc: 'K-POP 사운드 트렌드, 팬덤 문화, 글로벌 음악 산업을 깊이 있게 분석하는 칼럼 아카이브입니다.',
    },
  },
  jp: {
    siteTagline: 'グローバルK-POPニュース＆英語カルチャーコラム — 英語・韓国語・日本語・スペイン語対応。',
    nav: { home: 'ホーム', news: 'ニュース', columns: 'コラム', about: '概要・投稿' },
    footer: {
      desc: 'グローバルファンのための独立系K-POPニュース＆音楽批評メディア。英語・韓国語・日本語・スペイン語の専用版を提供しています。',
      privacy: 'プライバシーポリシー',
      terms: '著作権・利用規約',
      contact: 'お問い合わせ',
      guide: '編集ガイド',
    },
    home: {
      onAir: '最新トピック',
      eyebrow: 'グローバルK-POPニュース＆英語コラム',
      headlinePre: 'K-POPの最前線を切り取る ',
      headlineAccent: 'カルチャーコラム。',
      featured: '注目記事',
      readStory: '記事を読む →',
      latestEyebrow: '最新ニュース＆コラム',
      latestTitle: 'ソウルから世界へ、注目のストーリー',
      all: 'すべて',
      news: 'ニュース',
      columns: 'コラム',
      read: '読む →',
    },
    badges: { news: 'ニュース', column: 'コラム', columnFull: '英語コラム' },
    article: {
      backNews: '← ニュース一覧へ戻る',
      backColumns: '← コラム一覧へ戻る',
      summaryPill: 'JP SUMMARY',
      summaryLabel: '記事の要約',
      takeawaysTitle: 'この記事のポイント',
      fallbackNote: '* 本文は英語オリジナルで提供されています。上記の日本語要約とあわせてお読みください。',
      watchVideo: '公式映像を見る',
      faqTitle: 'よくある質問（FAQ）',
      keepReading: '関連記事',
      moreTitle: 'KPOP LIVES の他の記事',
      updated: '更新日',
    },
    archive: {
      newsEyebrow: 'K-POPニュース',
      newsTitle: '最新K-POPニュース＆カムバック情報',
      newsDesc: 'ワールドツアー、新譜リリース、グローバルチャート記録など注目のK-POPニュースをいち早くお届けします。',
      columnsEyebrow: '英語コラム',
      columnsTitle: '深掘りコラム＆音楽批評',
      columnsDesc: 'K-POPのサウンドトレンド、ファンダム文化、グローバル音楽シーンを深く読み解くコラム集です。',
    },
  },
  es: {
    siteTagline: 'Noticias globales de K-Pop y columnas culturales — en inglés, coreano, japonés y español.',
    nav: { home: 'Inicio', news: 'Noticias', columns: 'Columnas', about: 'Acerca de' },
    footer: {
      desc: 'Medio independiente de noticias y crítica cultural de K-Pop con ediciones dedicadas en inglés, coreano, japonés y español.',
      privacy: 'Privacidad',
      terms: 'Derechos y Términos',
      contact: 'Contacto',
      guide: 'Guía editorial',
    },
    home: {
      onAir: 'EN VIVO',
      eyebrow: 'NOTICIAS GLOBALES DE K-POP Y COLUMNAS',
      headlinePre: 'Donde el sonido K-Pop se une a la ',
      headlineAccent: 'crítica cultural.',
      featured: 'Destacado',
      readStory: 'Leer artículo →',
      latestEyebrow: 'ÚLTIMAS PUBLICACIONES',
      latestTitle: 'Lo más reciente desde Seúl',
      all: 'Todo',
      news: 'Noticias',
      columns: 'Columnas',
      read: 'Leer →',
    },
    badges: { news: 'Noticias', column: 'Columna', columnFull: 'Columna' },
    article: {
      backNews: '← Volver a Noticias',
      backColumns: '← Volver a Columnas',
      summaryPill: 'ES SUMMARY',
      summaryLabel: 'Resumen',
      takeawaysTitle: 'Puntos clave',
      fallbackNote: '* El cuerpo completo está disponible en inglés original. Usa este resumen como guía.',
      watchVideo: 'Video oficial destacado',
      faqTitle: 'Preguntas frecuentes (FAQ)',
      keepReading: 'SEGUIR LEYENDO',
      moreTitle: 'Más en KPOP LIVES',
      updated: 'Actualizado',
    },
    archive: {
      newsEyebrow: 'Noticias K-Pop',
      newsTitle: 'Últimas Noticias y Comebacks',
      newsDesc: 'Actualizaciones rápidas sobre giras mundiales, lanzamientos, récords en listas y tendencias de la industria.',
      columnsEyebrow: 'Columnas',
      columnsTitle: 'Ensayos y Crítica Cultural',
      columnsDesc: 'Ensayos en profundidad sobre producción musical, cultura fandom y estética global del K-Pop.',
    },
  },
};
