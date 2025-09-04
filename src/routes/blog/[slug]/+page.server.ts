// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { normalizeFirebaseUrl } from '$lib/services/imageLoading';

export const load: PageServerLoad = async ({ params }) => {
  try {
    // CRITICAL FIX: Dynamic imports to prevent build issues
    const [{ getPostBySlug }, { mdToHtml }] = await Promise.all([
      import('$lib/server/posts'),
      import('$lib/server/markdown')
    ]);
    
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
    console.error('[blog/slug] Load error:', params.slug, err);
    
    // Re-throw SvelteKit errors
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to load blog post');
  }
};