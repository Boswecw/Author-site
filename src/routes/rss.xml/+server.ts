import type { RequestHandler } from '@sveltejs/kit';
import { getPublishedPosts } from '$lib/server/posts';

export const GET: RequestHandler = async () => {
  const items = await getPublishedPosts(20);
  const site = 'https://your-domain.com';

  const itemsXml = items
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${site}/blog/${p.slug}</link>
      <pubDate>${new Date(p.publishDate ?? '').toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
      <guid>${site}/blog/${p.slug}</guid>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
    <title>Charles W. Boswell — Blog</title>
    <link>${site}</link>
    <description>Writing insights and updates</description>
    ${itemsXml}
  </channel></rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
