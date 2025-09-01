import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const modules = import.meta.glob('/src/lib/posts/*.md', { eager: true }) as any;
  const posts = Object.entries(modules).map(([path, mod]: any) => {
    const slug = path.split('/').pop().replace('.md', '');
    return { slug, ...mod.metadata };
  }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const site = 'https://your-domain.com';
  const items = posts.map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${site}/blog/${p.slug}</link>
      <pubDate>${new Date(p.publishDate).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
      <guid>${site}/blog/${p.slug}</guid>
    </item>`
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
    <title>Charles W. Boswell — Blog</title>
    <link>${site}</link>
    <description>Writing insights and updates</description>
    ${items}
  </channel></rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
