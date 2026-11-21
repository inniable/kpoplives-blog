const SUPPORTED_LANGS = ['en', 'ko', 'jp', 'es'];
const MARKER_RE = /^<!--\s*(ko|jp|ja|es)\s*-->$/i;

export function remarkBilingual() {
  return (tree) => {
    const children = tree.children;
    const sections = { en: [] };
    let currentLang = 'en';
    let foundMarker = false;

    for (const node of children) {
      if (node.type === 'html') {
        const match = node.value.trim().match(MARKER_RE);
        if (match) {
          foundMarker = true;
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

    if (!foundMarker) {
      return;
    }

    const presentLangs = Object.keys(sections).filter((l) => sections[l].length > 0);
    const missingLangs = SUPPORTED_LANGS.filter((l) => !presentLangs.includes(l));

    const newChildren = [];
    for (const lang of presentLangs) {
      const langsAttr = lang === 'en' ? ['en', ...missingLangs].join(' ') : lang;
      newChildren.push({
        type: 'html',
        value: `<div class="bilingual-section" data-langs="${langsAttr}">`,
      });
      newChildren.push(...sections[lang]);
      newChildren.push({ type: 'html', value: '</div>' });
    }

    tree.children = newChildren;
  };
}
