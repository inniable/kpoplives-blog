import { getCollection } from 'astro:content';

export async function GET(context) {
  const site = context.site ?? new URL('https://kpoplives-blog.jane2036.workers.dev');
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const lines = [
    '# KPOP LIVES',
    '',
    '> Independent K-Pop newsroom and cultural criticism magazine covering 5th-gen K-Pop production trends, global world tours, song camps, and fandom culture in English, Korean, Japanese, and Spanish.',
    '',
    '## Editions',
    `- English (Primary): ${new URL('/', site).toString()}`,
    `- Korean: ${new URL('/ko/', site).toString()}`,
    `- Japanese: ${new URL('/jp/', site).toString()}`,
    `- Spanish: ${new URL('/es/', site).toString()}`,
    '',
    '## Latest Articles',
    ...posts.map((post) => {
      const url = new URL(`/posts/${post.id}/`, site).toString();
      return `- [${post.data.title}](${url}) (${post.data.category}, ${post.data.pubDate.toISOString().slice(0, 10)}): ${post.data.description}`;
    }),
    '',
    '## Policies & Feeds',
    `- RSS Feed: ${new URL('/rss.xml', site).toString()}`,
    `- Sitemap: ${new URL('/sitemap-index.xml', site).toString()}`,
    `- Privacy Policy: ${new URL('/privacy/', site).toString()}`,
    `- Copyright & DMCA Policy: ${new URL('/terms/', site).toString()}`,
    `- Contact: ${new URL('/contact/', site).toString()}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
