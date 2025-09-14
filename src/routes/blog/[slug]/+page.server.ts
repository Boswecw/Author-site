// src/routes/blog/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const { slug } = params;
  
  console.log(`[blog] Loading post: ${slug}`);
  
  try {
    const post = await getPostBySlug(slug);
    
    if (!post) {
      console.log(`[blog] Post not found: ${slug}`);
      throw error(404, {
        message: 'Blog post not found',
      });
    }
    
    console.log(`[blog] ✅ Loaded post: ${post.title}`);
    
    // Set cache headers for better performance
    setHeaders({
      'cache-control': 'public, max-age=300' // 5 minutes
    });
    
    return {
      post
    };
    
  } catch (err) {
    console.error(`[blog] Error loading post ${slug}:`, err);
    
    // Re-throw SvelteKit errors (like 404s)
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Handle other errors
    throw error(500, {
      message: 'Failed to load blog post'
    });
  }
};