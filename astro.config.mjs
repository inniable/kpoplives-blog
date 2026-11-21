import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkBilingual } from './src/plugins/remark-bilingual.mjs';

export default defineConfig({
  site: 'https://kpoplives-blog.jane2036.workers.dev',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          ko: 'ko',
          jp: 'ja',
          es: 'es',
        },
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkBilingual],
    shikiConfig: {
      theme: 'tokyo-night',
    },
  },
});
