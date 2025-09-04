// src/lib/server/rss.xml/+server.ts - FIXED VERSION
import type { RequestHandler } from '@sveltejs/kit';
import { getPublishedPosts } from '$lib/server/posts';
import type { PostDoc } from '$lib/types';

export const GET: RequestHandler = async () => {
  const posts = await getPublishedPosts();
  const SITE = 'https://charlesboswell.com'; // Update with your actual domain

  const items = posts
    .map((p: PostDoc) => {
      const link = `${SITE}/blog/${encodeURIComponent(p.slug)}`;
      return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <description><![CDATA[${p.excerpt || ''}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${p.createdAt ? new Date(p.createdAt).toUTCString() : ''}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Charles Boswell - Author Blog</title>
    <description>Fantasy and faith-based fiction from Navy veteran and firefighter Charles Boswell</description>
    <link>${SITE}</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`.trim();

  return new Response(xml, {
    headers: {
      'Cache-Control': 'max-age=0, s-maxage=3600',
      'Content-Type': 'application/xml'
    }
  });
};