// src/routes/blog/[slug]/+page.server.ts - UPDATED to use central Firebase utilities
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';
import { buildImageUrl, buildBookCoverUrl } from '$lib/utils/firebase'; // ✅ Central utilities

/** ✅ Robust hero resolver aligned with Books/Home:
 *  - Full URLs pass through unchanged
 *  - If a folder is present (e.g. "posts/hero.webp" or "books/cover.png"), use as-is via buildImageUrl
 *  - If no folder is present, treat as a BOOK cover filename and resolve via buildBookCoverUrl (books/)
 *  - Append ".png" when no extension is provided
 */
function resolveHero(ref?: string | null): string | null {
  if (!ref) return null;
  const raw = ref.trim();
  if (!raw) return null;

  // Already absolute URL
  if (/^https?:\/\//i.test(raw)) return raw;

  const hasFolder = raw.includes('/');
  const hasExt = /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(raw);
  const file = hasExt ? raw : `${raw}.png`;

  // Explicit key path (e.g., "posts/foo.webp" or "books/bar.png")
  if (hasFolder) return buildImageUrl(file);

  // Default: treat as book cover filename (matches working Books/Home behavior)
  return buildBookCoverUrl(file);
}

interface PostDoc {
  _id?: any;
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null; // filename | "folder/file.ext" | full URL
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: 'published' | 'draft';
}

export const load: PageServerLoad = async ({ params }) => {
  try {
    console.log(`[blog/slug] Loading post: ${params.slug}`);

    const db = await getDb();
    const col = db.collection<PostDoc>('posts');

    const projection = {
      _id: 0,
      slug: 1,
      title: 1,
      excerpt: 1,
      contentMarkdown: 1,
      heroImage: 1, // Can be filename, "folder/file.ext", or full URL
      publishDate: 1,
      publishedAt: 1,
      tags: 1,
      genre: 1,
      status: 1
    } as const;

    const doc = await col.findOne({ slug: params.slug }, { projection });

    if (!doc) {
      console.log(`[blog/slug] Post not found: ${params.slug}`);
      throw error(404, `Post "${params.slug}" not found`);
    }

    if (doc.status !== 'published') {
      console.log(`[blog/slug] Post not published: ${params.slug} (status: ${doc.status})`);
      throw error(404, 'Post not found');
    }

    console.log(`[blog/slug] Found published post: ${doc.title}`);

    // ✅ Resolve hero image to match Books/Home URL strategy
    const heroImageUrl = resolveHero(doc.heroImage);

    // Debug logging for heroImage processing
    if (doc.heroImage) {
      const orig = doc.heroImage.length > 80 ? doc.heroImage.slice(0, 80) + '…' : doc.heroImage;
      const proc =
        heroImageUrl && heroImageUrl.length > 120 ? heroImageUrl.slice(0, 120) + '…' : heroImageUrl;
      console.log(`[blog/slug] Post ${params.slug} heroImage ->`, { original: orig, processed: proc });
    }

    const post = {
      slug: doc.slug,
      title: doc.title,
      excerpt: doc.excerpt ?? null,
      heroImage: heroImageUrl, // ✅ Now resolves like Books/Home
      publishDate: doc.publishDate ?? doc.publishedAt ?? null,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      genre: doc.genre ?? null,
      contentHtml: await mdToHtml(doc.contentMarkdown ?? '')
    };

    return { post };
  } catch (err) {
    console.error('[blog/slug] Load error:', params.slug, err);

    // Re-throw SvelteKit errors (like 404)
    if (err && typeof err === 'object' && 'status' in (err as any)) {
      throw err as any;
    }

    // Convert other errors to 500
    throw error(500, 'Failed to load post');
  }
};
