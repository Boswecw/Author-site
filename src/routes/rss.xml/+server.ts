// src/routes/rss.xml/+server.ts - Use relative import
import type { RequestHandler } from './$types';
import type { PostDoc } from '../../lib/types/index.js';

export const GET: RequestHandler = async () => {
  // Simple RSS response for now
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Charles W. Boswell - Author</title>
    <description>Faith-based and Epic Fantasy Stories</description>
    <link>https://charlesboswell.com</link>
    <item>
      <title>Blog coming soon</title>
      <description>Check back for updates</description>
    </item>
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};