// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';

export const load: PageServerLoad = async ({ params }) => {
  const db = await getDb();
  const col = db.collection('posts');

  const doc = await col.findOne(
    { slug: params.slug },
    {
      projection: {
        _id: 1,
        slug: 1,
        title: 1,
        excerpt: 1,
        contentMarkdown: 1,
        heroImage: 1,          // ← we’ll pass this through unchanged
        publishDate: 1,
        publishedAt: 1,
        tags: 1,
        genre: 1,
        status: 1
      }
    }
  );

  if (!doc || doc.status !== 'published') throw error(404, 'Post not found');

  const { _id, ...rest } = doc as any;

  return {
    post: {
      id: _id ? String(_id) : undefined,
      ...rest,
      // ⚠️ pass-through to match list page behavior
      heroImage: rest.heroImage ?? null,
      publishDate: rest.publishDate ?? rest.publishedAt ?? undefined,
      contentHtml: await mdToHtml(rest.contentMarkdown ?? '')
    }
  };
};
