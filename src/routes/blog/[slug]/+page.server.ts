import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { mdToHtml } from '$lib/server/markdown';
import { buildPostImageUrl } from '$lib/utils/firebase';

interface PostDoc {
  _id?: any;
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
      heroImage: 1, // Can be filename or full URL
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

    // ✅ Use central utility for post images (posts/ folder)
    const heroImageUrl = doc.heroImage ? buildPostImageUrl(doc.heroImage) : null;

    // Debug logging for heroImage processing
    if (doc.heroImage) {
      console.log(`[blog/slug] Post ${params.slug} heroImage processing:`, {
        original: doc.heroImage.substring(0, 60) + '...',
        processed: heroImageUrl?.substring(0, 80) + '...'
      });
    }

    const post = {
      slug: doc.slug,
      title: doc.title,
      excerpt: doc.excerpt ?? null,
      heroImage: heroImageUrl, // ✅ Uses posts/ folder via central utility
      publishDate: doc.publishDate ?? doc.publishedAt ?? null,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      genre: doc.genre ?? null,
      contentHtml: await mdToHtml(doc.contentMarkdown ?? '')
    };

    return { post };
  } catch (err) {
    console.error('[blog/slug] Load error:', params.slug, err);
    
    // Re-throw SvelteKit errors (like 404)
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Convert other errors to 500
    throw error(500, 'Failed to load post');
  }
};