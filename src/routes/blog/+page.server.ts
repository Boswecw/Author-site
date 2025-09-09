// src/routes/blog/+page.server.ts - UPDATED to use central Firebase utilities
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';
import { buildImageUrl } from '$lib/utils/firebase'; // ✅ Use central utility for post images

export const prerender = false;

/** ✅ SIMPLIFIED: Build post image URL using central utility */
function buildPostImageUrl(heroImage: string | null | undefined): string | null {
  if (!heroImage) return null;
  
  // If it's already a complete URL, return as-is
  if (heroImage.startsWith('http')) {
    return heroImage;
  }
  
  // ✅ Use central utility with posts/ folder for blog post images
  return buildImageUrl(heroImage, 'posts');
}

interface PostDoc {
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null; // Can be filename OR full URL
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: 'published' | 'draft';
}

export const load: PageServerLoad = async ({ url }) => {
  try {
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = 10;

    const db = await getDb();
    const col = db.collection<PostDoc>('posts');

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
          _id: 0,
          slug: 1,
          title: 1,
          excerpt: 1,
          contentMarkdown: 1,
          heroImage: 1, // Can be filename or full URL
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
        // ✅ SIMPLIFIED: Use central utility for post images (posts/ folder)
        const heroImageUrl = buildPostImageUrl(p.heroImage);
        
        // Debug logging for heroImage processing
        if (p.heroImage) {
          console.log(`[blog] Post ${p.slug} heroImage processing:`, {
            original: p.heroImage.substring(0, 60) + '...',
            processed: heroImageUrl?.substring(0, 80) + '...'
          });
        }

        return {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? null,
          heroImage: heroImageUrl, // ✅ Uses posts/ folder via central utility
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
    
    // Return empty state rather than crashing
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