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
    const postsCollection = db.collection<ExtendedPostDoc>('posts');
    
    // Get filter parameters
    const status = url.searchParams.get('status') || '';
    const source = url.searchParams.get('source') || '';
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort') || 'newest';
    
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
    const allTags = await postsCollection.distinct('tags');
    const tags = allTags.filter(Boolean).sort();
    
    console.log(`[admin-blog] ✅ Loaded ${posts.length} posts`);
    
    // Set cache headers (short cache for admin)
    setHeaders({
      'cache-control': 'private, max-age=60' // 1 minute cache
    });
    
    return {
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
      tags,
      filters: {
        status,
        source,
        search,
        sortBy
      }
    };
    
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