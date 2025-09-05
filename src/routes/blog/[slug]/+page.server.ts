// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';

// ✅ Do not prerender this route (prevents DB access during Netlify build)
export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
  // decode just in case the slug contains URL-encoded chars
  const slug = (() => {
    try {
      return decodeURIComponent(params.slug);
    } catch {
      return params.slug;
    }
  })();

  const db = await getDb();
  const col = db.collection('posts');

  // Query only published posts with this slug
  const doc = await col.findOne(
    { slug, status: 'published' },
    {
      projection: {
        _id: 1,
        slug: 1,
        title: 1,
        excerpt: 1,
        contentMarkdown: 1,
        heroImage: 1, // pass-through; client resolves to URL/fallback
        publishDate: 1,
        publishedAt: 1,
        tags: 1,
        genre: 1,
        status: 1
      }
    }
  );

  if (!doc) throw error(404, 'Post not found');

  const { _id, contentMarkdown, publishDate, publishedAt, ...rest } = doc as any;

  return {
    post: {
      id: _id ? String(_id) : undefined,
      ...rest,
      heroImage: rest.heroImage ?? null,
      publishDate: publishDate ?? publishedAt ?? undefined,
      contentHtml: await mdToHtml(contentMarkdown ?? '')
    }
  };
};
