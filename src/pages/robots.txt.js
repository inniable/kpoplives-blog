export async function GET(context) {
  const site = context.site ?? new URL('https://kpoplives-blog.jane2036.workers.dev');
  const sitemapUrl = new URL('/sitemap-index.xml', site).toString();

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Explicitly welcome AI search & citation crawlers (GEO)',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
