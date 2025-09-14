// src/routes/api/blog/list/+server.ts
// Blog API endpoint for listing blog posts with filtering and pagination
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/server/blog-google-docs';

const API_KEY = process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

export const GET: RequestHandler = async ({ url, request }) => {
  console.log('[blog-list-api] 📄 Listing blog posts...');
  
  try {
    // API key authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      console.log('[blog-list-api] ❌ Unauthorized request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');
    
    // Parse query parameters
    const status = url.searchParams.get('status'); // 'draft', 'published', or null for all
    const source = url.searchParams.get('source'); // 'google-docs', 'admin', 'manual', or null for all
    const search = url.searchParams.get('search'); // search term for title/excerpt/tags
    const tag = url.searchParams.get('tag'); // specific tag filter
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 100); // Max 100 per page
    const sortBy = url.searchParams.get('sort') || 'newest'; // 'newest', 'oldest', 'title', 'status'
    const includeContent = url.searchParams.get('includeContent') === 'true'; // Whether to include full content
    
    console.log(`[blog-list-api] Query params - status: ${status}, source: ${source}, search: ${search}, page: ${page}, limit: ${limit}`);
    
    // Build query
    const query: any = {};
    
    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }
    
    if (source && ['google-docs', 'admin', 'manual'].includes(source)) {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Build sort options
    let sortOptions: any = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions = { publishDate: 1, createdAt: 1, _id: 1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      case 'status':
        sortOptions = { status: 1, publishDate: -1 };
        break;
      default: // newest
        sortOptions = { publishDate: -1, lastSyncedAt: -1, createdAt: -1, _id: -1 };
    }
    
    // Build projection (what fields to include)
    const projection: any = {
      _id: 1,
      slug: 1,
      title: 1,
      excerpt: 1,
      heroImage: 1,
      publishDate: 1,
      publishedAt: 1,
      tags: 1,
      genre: 1,
      status: 1,
      source: 1,
      googleDocId: 1,
      lastSyncedAt: 1,
      createdAt: 1,
      updatedAt: 1
    };
    
    // Optionally include full content
    if (includeContent) {
      projection.contentMarkdown = 1;
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [posts, totalCount] = await Promise.all([
      collection
        .find(query, { projection })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;
    
    console.log(`[blog-list-api] ✅ Found ${posts.length}/${totalCount} posts (page ${page}/${totalPages})`);
    
    // Format response
    const formattedPosts = posts.map(post => ({
      ...post,
      _id: post._id?.toString(),
      publishDate: post.publishDate?.toString(),
      publishedAt: post.publishedAt?.toString(),
      lastSyncedAt: post.lastSyncedAt?.toString(),
      createdAt: post.createdAt?.toString(),
      updatedAt: post.updatedAt?.toString()
    }));
    
    const response = {
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasMore,
          hasPrevious
        },
        filters: {
          status,
          source,
          search,
          tag,
          sortBy
        }
      }
    };

    return json(response);

  } catch (error) {
    console.error('[blog-list-api] 💥 Error listing blog posts:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};