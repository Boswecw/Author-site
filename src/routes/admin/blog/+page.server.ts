// src/routes/admin/blog/+page.server.ts - FIXED
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

// Use the correct types
interface ExtendedPostDoc {
  _id?: any;
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null;
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  genre?: string | null;
  status: 'published' | 'draft';
  source?: 'google-docs' | 'manual' | 'admin';
  googleDocId?: string;
  lastSyncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const load: PageServerLoad = async ({ url, setHeaders }) => {
  console.log('[admin-blog] Loading blog management page...');
  
  try {
    const db = await getDb();
    
    // CRITICAL: Ensure we're using the 'posts' collection, not 'books'
    const postsCollection = db.collection<ExtendedPostDoc>('posts');
    
    console.log('[admin-blog] Connected to posts collection');
    
    // Get filter parameters
    const status = url.searchParams.get('status') || '';
    const source = url.searchParams.get('source') || '';
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort') || 'newest';
    
    console.log('[admin-blog] Filters:', { status, source, search, sortBy });
    
    // Build query
    const query: any = {};
    
    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }
    
    if (source && ['google-docs', 'manual', 'admin'].includes(source)) {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    console.log('[admin-blog] MongoDB query:', JSON.stringify(query, null, 2));
    
    // Build sort options
    let sortOptions: any = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions = { publishDate: 1, createdAt: 1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      case 'status':
        sortOptions = { status: 1, publishDate: -1 };
        break;
      default: // newest
        sortOptions = { publishDate: -1, lastSyncedAt: -1, createdAt: -1 };
    }
    
    // Fetch posts with filters and sorting
    const posts = await postsCollection
      .find(query)
      .sort(sortOptions)
      .limit(100) // Reasonable limit for admin interface
      .toArray();
    
    console.log(`[admin-blog] Found ${posts.length} posts`);
    
    // Debug: Log the first post to verify structure
    if (posts.length > 0) {
      console.log('[admin-blog] First post sample:', {
        _id: posts[0]._id,
        slug: posts[0].slug,
        title: posts[0].title,
        status: posts[0].status,
        hasHeroImage: !!posts[0].heroImage
      });
    }
    
    // Get summary statistics
    const stats = await Promise.all([
      postsCollection.countDocuments({ status: 'published' }),
      postsCollection.countDocuments({ status: 'draft' }),
      postsCollection.countDocuments({ source: 'google-docs' }),
      postsCollection.countDocuments({ 
        source: 'google-docs',
        lastSyncedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
    ]);
    
    const [publishedCount, draftCount, googleDocsCount, recentSyncCount] = stats;
    
    // Get available tags for filtering
    let allTags: string[] = [];
    try {
      const distinctTags = await postsCollection.distinct('tags');
      allTags = distinctTags.filter(Boolean).sort();
    } catch (error) {
      console.log('[admin-blog] Could not get distinct tags:', error);
      allTags = [];
    }
    
    console.log(`[admin-blog] ✅ Loaded ${posts.length} posts, ${allTags.length} tags`);
    
    // Set cache headers (short cache for admin)
    setHeaders({
      'cache-control': 'private, max-age=60' // 1 minute cache
    });
    
    const result = {
      posts: posts.map(post => ({
        ...post,
        _id: post._id?.toString(),
        publishDate: post.publishDate?.toString(),
        publishedAt: post.publishedAt?.toString(),
        lastSyncedAt: post.lastSyncedAt?.toString(),
        createdAt: post.createdAt?.toString(),
        updatedAt: post.updatedAt?.toString()
      })),
      stats: {
        total: posts.length,
        published: publishedCount,
        draft: draftCount,
        googleDocs: googleDocsCount,
        recentSync: recentSyncCount
      },
      tags: allTags,
      filters: {
        status,
        source,
        search,
        sortBy
      }
    };
    
    console.log('[admin-blog] Returning result structure:', {
      postsCount: result.posts.length,
      statsTotal: result.stats.total,
      tagsCount: result.tags.length,
      filtersApplied: Object.keys(result.filters).filter(k => result.filters[k as keyof typeof result.filters])
    });
    
    return result;
    
  } catch (error) {
    console.error('[admin-blog] Error loading blog posts:', error);
    
    return {
      posts: [],
      stats: {
        total: 0,
        published: 0,
        draft: 0,
        googleDocs: 0,
        recentSync: 0
      },
      tags: [],
      filters: {
        status: '',
        source: '',
        search: '',
        sortBy: 'newest'
      },
      error: 'Failed to load blog posts. Please try again.'
    };
  }
};