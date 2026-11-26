import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkBilingual } from './src/plugins/remark-bilingual.mjs';

const SITE_URL = process.env.SITE_URL || 'https://kpoplives.net';

export default defineConfig({
  site: SITE_URL,
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
