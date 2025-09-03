// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

// CRITICAL FIX: Safe post fetching with error handling
export const load: PageServerLoad = async ({ params }) => {
  try {
    // CRITICAL FIX: Import inside function to prevent build-time issues
    const { getPostBySlug } = await import('$lib/server/posts');
    const { mdToHtml } = await import('$lib/server/markdown');
    
    const post = await getPostBySlug(params.slug);
    
    if (!post || post.status !== 'published') {
      throw error(404, 'Post not found');
    }

    return {
      post: {
        ...post,
        heroImage: normalizeFirebaseUrl(post.heroImage) ?? undefined,
        contentHtml: await mdToHtml(post.contentMarkdown ?? '')
      }
    };
  } catch (err) {
    console.error('[blog/slug] Error loading post:', params.slug, err);
    
    // If it's already a SvelteKit error, re-throw
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // For other errors, throw 500
    throw error(500, 'Failed to load blog post');
  }
};