// src/routes/blog/+page.server.ts
import { getPublishedPosts, getAllTags } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
  console.log('[blog] Loading blog page...');
  
  // Get search parameters for filtering and pagination
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const tag = url.searchParams.get('tag') || '';
  const search = url.searchParams.get('search') || '';
  const pageSize = 10;

  try {
    // Fetch posts and tags in parallel
    const [postsResult, tags] = await Promise.all([
      getPublishedPosts(page, pageSize),
      getAllTags()
    ]);

    // Filter posts by tag and search if specified
    let filteredPosts = postsResult.items;
    let total = postsResult.total;

    if (tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags && post.tags.includes(tag)
      );
      total = filteredPosts.length;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchLower)) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(searchLower)))
      );
      total = filteredPosts.length;
    }

    // Calculate pagination
    const totalPages = Math.ceil(total / pageSize);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    console.log(`[blog] Loaded ${filteredPosts.length} posts (page ${page}/${totalPages})`);

    // Set cache headers for better performance
    setHeaders({
      'cache-control': 'public, max-age=300' // 5 minutes
    });

    return {
      posts: filteredPosts,
      tags,
      pagination: {
        current: page,
        total: totalPages,
        hasMore,
        hasPrevious,
        totalPosts: total
      },
      filters: {
        tag: tag || null,
        search: search || null
      }
    };

  } catch (error) {
    console.error('[blog] Error loading blog posts:', error);
    
    // Return fallback data instead of throwing
    return {
      posts: [],
      tags: [],
      pagination: {
        current: 1,
        total: 0,
        hasMore: false,
        hasPrevious: false,
        totalPosts: 0
      },
      filters: {
        tag: null,
        search: null
      },
      error: 'Failed to load blog posts. Please try again later.'
    };
  }
};