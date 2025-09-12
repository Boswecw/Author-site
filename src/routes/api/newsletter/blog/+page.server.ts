// src/routes/blog/+page.server.ts - UPDATED to load images like Books/Home using central Firebase utils
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';
import { buildImageUrl, buildBookCoverUrl } from '$lib/utils/firebase'; // ✅ central utils

export const prerender = false;

/** ✅ Robust hero resolver:
 *  - Full URLs pass through
 *  - If a folder is included (e.g. "posts/hero.webp" or "books/cover.png"), use as-is via buildImageUrl
 *  - Otherwise default to BOOK covers (books/) to match how home/books resolve
 *  - Append ".png" if no extension provided
 */
function resolveHero(ref?: string | null): string | null {
  if (!ref) return null;
  const raw = ref.trim();
  if (!raw) return null;

  // already absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  const hasFolder = raw.includes('/');
  const hasExt = /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(raw);
  const file = hasExt ? raw : `${raw}.png`;

  // explicit path like "posts/foo.webp" or "books/bar.png"
  if (hasFolder) return buildImageUrl(file);

  // default to books/ (matches working homepage/books behavior)
  return buildBookCoverUrl(file);
}

interface PostDoc {
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

/** Count documents in a way that works with both real Mongo and mock DBs */
async function safeCount(col: any, filter: Record<string, unknown>): Promise<number> {
  try {
    if (typeof col.countDocuments === 'function') {
      return await col.countDocuments(filter);
    }
  } catch {}
  try {
    const ids = await col.find(filter, { projection: { _id: 1 } }).toArray();
    return ids.length;
  } catch {
    return 0;
  }
}

export const load: PageServerLoad = async ({ url }) => {
  try {
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = 10;

    const db = await getDb();
    const col = db.collection<PostDoc>('posts');
    const match = { status: 'published' as const };

    // Optional debugging
    try {
      const listCollections = (db as any).listCollections;
      if (typeof listCollections === 'function') {
        const collList = await listCollections.call(db).toArray();
        console.log('[blog] using db:', (db as any).databaseName);
        console.log('[blog] collections:', collList.map((c: any) => c.name));
      }
    } catch {}

    const [totalPublished] = await Promise.all([safeCount(col as any, match)]);

    const docs = await col
      .find(match, {
        projection: {
          _id: 0,
          slug: 1,
          title: 1,
          excerpt: 1,
          contentMarkdown: 1,
          heroImage: 1,
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

    console.log(`[blog] Found ${docs.length} posts for page ${page}`);

    const posts = await Promise.all(
      docs.map(async (p) => {
        const heroImageUrl = resolveHero(p.heroImage);

        if (p.heroImage) {
          const orig = p.heroImage.length > 60 ? p.heroImage.slice(0, 60) + '…' : p.heroImage;
          const proc =
            heroImageUrl && heroImageUrl.length > 100
              ? heroImageUrl.slice(0, 100) + '…'
              : heroImageUrl ?? null;
          console.log(`[blog] Post ${p.slug} heroImage ->`, { original: orig, processed: proc });
        }

        return {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? null,
          heroImage: heroImageUrl, // ✅ now resolves like Books/Home
          publishDate: p.publishDate ?? p.publishedAt ?? null,
          tags: Array.isArray(p.tags) ? p.tags : [],
          genre: p.genre ?? null,
          contentHtml: await mdToHtml(p.contentMarkdown ?? '')
        };
      })
    );

    console.log('[blog] Processed posts:', posts.map((p) => p.slug));

    return {
      posts,
      total: totalPublished,
      page,
      pageSize,
      tag: 'All',
      tags: [] as string[]
    };
  } catch (error) {
    console.error('[blog] Error loading posts:', error);
    return {
      posts: [],
      total: 0,
      page: 1,
      pageSize: 10,
      tag: 'All',
      tags: [] as string[]
    };
  }
};
