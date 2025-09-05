// src/routes/blog/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';

// ✅ Prevent prerender so Netlify doesn’t hit Mongo during build
export const prerender = false;

export const load: PageServerLoad = async ({ url }) => {
  const pageParam = url.searchParams.get('page') ?? '1';
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const pageSize = 10;

  const db = await getDb();
  const col = db.collection('posts');

  const match = { status: 'published' as const };

  const [collList, totalDocs, totalPublished] = await Promise.all([
    db.listCollections().toArray(),
    col.estimatedDocumentCount(),
    col.countDocuments(match)
  ]);

  console.log('[blog] using db:', db.databaseName);
  console.log('[blog] collections:', collList.map((c) => c.name));
  console.log('[blog] posts total:', totalDocs, 'published:', totalPublished);

  const docs = await col
    .find(match, {
      projection: {
        _id: 0, // ✅ keep _id out (serializable)
        slug: 1,
        title: 1,
        excerpt: 1,
        contentMarkdown: 1,
        heroImage: 1, // pass through; client resolves URL/fallback
        publishDate: 1,
        publishedAt: 1,
        tags: 1,
        genre: 1
      }
    })
    .sort({ publishDate: -1, publishedAt: -1, _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  const posts = await Promise.all(
    docs.map(async (p: any) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      heroImage: p.heroImage ?? null,
      publishDate: p.publishDate ?? p.publishedAt ?? undefined,
      tags: Array.isArray(p.tags) ? p.tags : [],
      genre: p.genre ?? undefined,
      contentHtml: await mdToHtml(p.contentMarkdown ?? '')
    }))
  );

  console.log('[blog] fetched slugs:', posts.map((p) => p.slug));

  return {
    posts,
    total: totalPublished,
    page,
    pageSize,
    tag: 'All',
    tags: []
  };
};
