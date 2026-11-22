import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faqSchema = z.object({
  q: z.string(),
  a: z.string(),
});

const sourceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

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
    category: z.enum(['news', 'column', 'culture']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('KPOP LIVES Editorial'),
    authorRole: z.string().default('K-Pop Music Critic & Culture Editor'),
    readTime: z.string().default('4 min read'),
    readTimeKo: z.string().default('4분 소요'),
    readTimeJp: z.string().default('読了目安 4分'),
    readTimeEs: z.string().default('4 min de lectura'),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().default('/images/cover-5th-gen.webp'),
    coverAlt: z.string().optional(),
    coverCredit: z.string().optional(),
    featured: z.boolean().default(false),
    summaryEn: z.string().optional(),
    summaryKo: z.string(),
    summaryJp: z.string().optional(),
    summaryEs: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional(),
    keyTakeawaysKo: z.array(z.string()).optional(),
    keyTakeawaysJp: z.array(z.string()).optional(),
    keyTakeawaysEs: z.array(z.string()).optional(),
    youtubeId: z.string().optional(),
    youtubeTitle: z.string().optional(),
    faqs: z.array(faqSchema).optional(),
    faqsKo: z.array(faqSchema).optional(),
    faqsJp: z.array(faqSchema).optional(),
    faqsEs: z.array(faqSchema).optional(),
    sources: z.array(sourceSchema).optional(),
  }),
});

export const collections = { posts };
