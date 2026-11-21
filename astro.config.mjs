import { defineConfig } from 'astro/config';
import { remarkBilingual } from './src/plugins/remark-bilingual.mjs';

export default defineConfig({
  site: 'https://kpoplives-blog.jane2036.workers.dev',
  markdown: {
    remarkPlugins: [remarkBilingual],
    shikiConfig: {
      theme: 'tokyo-night',
    },
  },
});
