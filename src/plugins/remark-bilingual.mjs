const MARKER_RE = /^<!--\s*(ko|jp|ja|es)\s*-->$/i;
const YOUTUBE_RE = /^::youtube\[([A-Za-z0-9_-]{11})(?:\s+([^\]]+))?\]$/;

function transformInlineEmbeds(nodes) {
  return nodes.map((node) => {
    if (
      node.type === 'paragraph' &&
      node.children?.length === 1 &&
      node.children[0].type === 'text'
    ) {
      const m = node.children[0].value.trim().match(YOUTUBE_RE);
      if (m) {
        const videoId = m[1];
        const title = (m[2] || 'Official K-Pop Video').replace(/"/g, '&quot;');
        return {
          type: 'html',
          value: `<div class="lite-yt" data-yt-id="${videoId}" data-yt-title="${title}" role="button" tabindex="0" aria-label="Play YouTube video: ${title}"><img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="${title}" loading="lazy" decoding="async" width="480" height="360" /><span class="lite-yt-play" aria-hidden="true">▶</span><span class="lite-yt-badge">YouTube</span></div>`,
        };
      }
    }
    return node;
  });
}

export function remarkBilingual() {
  return (tree) => {
    const children = tree.children;
    const sections = { en: [] };
    let currentLang = 'en';

    for (const node of children) {
      if (node.type === 'html') {
        const match = node.value.trim().match(MARKER_RE);
        if (match) {
          const raw = match[1].toLowerCase();
          currentLang = raw === 'ja' ? 'jp' : raw;
          if (!sections[currentLang]) {
            sections[currentLang] = [];
          }
          continue;
        }
      }
      sections[currentLang].push(node);
    }

    const newChildren = [];
    for (const [lang, nodes] of Object.entries(sections)) {
      if (nodes.length === 0) continue;
      newChildren.push({ type: 'html', value: `<!--kpop-lang-start:${lang}-->` });
      newChildren.push(...transformInlineEmbeds(nodes));
      newChildren.push({ type: 'html', value: `<!--kpop-lang-end:${lang}-->` });
    }

    tree.children = newChildren;
  };
}
