import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    titleKo: z.string(),
    titleJp: z.string().optional(),
    titleEs: z.string().optional(),
    description: z.string(),
    descriptionKo: z.string(),
    descriptionJp: z.string().optional(),
    descriptionEs: z.string().optional(),
    category: z.enum(['news', 'column']),
    pubDate: z.coerce.date(),
    author: z.string().default('KPOP LIVES Editorial'),
    readTime: z.string().default('4 min read'),
    readTimeKo: z.string().default('4분 소요'),
    readTimeJp: z.string().default('読了目安 4分'),
    readTimeEs: z.string().default('4 min de lectura'),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().default('/images/cover-5th-gen.jpg'),
    featured: z.boolean().default(false),
    summaryKo: z.string(),
    summaryJp: z.string().optional(),
    summaryEs: z.string().optional(),
  }),
});

export const collections = { posts };
