import { defineConfig } from 'astro/config';
import { remarkBilingual } from './src/plugins/remark-bilingual.mjs';

export default defineConfig({
  site: 'https://kpoplives.example.com',
  markdown: {
    remarkPlugins: [remarkBilingual],
    shikiConfig: {
      theme: 'tokyo-night',
    },
  },
});
