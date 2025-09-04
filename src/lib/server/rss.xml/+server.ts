// src/routes/rss.xml/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { getPublishedPosts } from '$lib/server/posts';

const SITE = process.env.PUBLIC_SITE_URL ?? 'https://boswellwebdevelopment.com'; // change if needed
const AUTHOR = 'Charles W. Boswell';

export const GET: RequestHandler = async () => {
  const posts = await getPublishedPosts(100);

  const items = posts
    .map((p) => {
      const link = `${SITE}/blog/${encodeURIComponent(p.slug)}`;
      const pub = p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString();
      const desc = p.excerpt ?? '';
      return `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pub}</pubDate>
    <description><![CDATA[${desc}]]></description>
  </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Charles W. Boswell — Blog</title>
  <link>${SITE}</link>
  <description>Latest posts from Charles W. Boswell</description>
  <language>en-us</language>
  <managingEditor>${AUTHOR}</managingEditor>${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
