// src/routes/api/blog/[slug]/+server.ts
// Blog API endpoint for getting a single blog post by slug or ID
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/types';

const API_KEY = process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

export const GET: RequestHandler = async ({ params, request, url }) => {
  console.log('[blog-get-api] 📄 Getting blog post...');
  
  try {
    // API key authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      console.log('[blog-get-api] ❌ Unauthorized request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    
    if (!slug) {
      return json({
        success: false,
        error: 'Missing slug parameter'
      }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');
    
    console.log(`[blog-get-api] Looking for post with slug/ID: ${slug}`);
    
    // Check if slug is actually an ObjectId (for admin API calls)
    let query: any;
    if (ObjectId.isValid(slug) && slug.length === 24) {
      // Search by ID
      query = { _id: new ObjectId(slug) };
    } else {
      // Search by slug
      query = { slug };
    }
    
    // Check for status filter (for admin vs public API calls)
    const status = url.searchParams.get('status');
    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    } else if (!status) {
      // Default to published only for public calls (no status specified)
      // Admin calls should specify status=draft or status=published explicitly
      query.status = 'published';
    }
    
    const post = await collection.findOne(query);
    
    if (!post) {
      console.log(`[blog-get-api] Post not found: ${slug}`);
      return json({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }
    
    console.log(`[blog-get-api] ✅ Found post: "${post.title}" (slug: ${post.slug})`);
    
    // Format response - only include fields that exist in ExtendedPostDoc
    const formattedPost = {
      ...post,
      _id: post._id?.toString(),
      publishDate: post.publishDate?.toString(),
      publishedAt: post.publishedAt?.toString(),
      lastSyncedAt: post.lastSyncedAt?.toString()
      // ✅ FIXED: Removed createdAt and updatedAt references since they don't exist in ExtendedPostDoc
    };
    
    const response = {
      success: true,
      data: {
        post: formattedPost
      }
    };

    return json(response);

  } catch (error) {
    console.error('[blog-get-api] 💥 Error getting blog post:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};