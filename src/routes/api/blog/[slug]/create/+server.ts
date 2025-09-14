// src/routes/api/blog/create/+server.ts
// Blog API endpoint for manual blog post creation
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/server/blog-google-docs';

const API_KEY = process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

interface CreateBlogPayload {
  title: string;
  contentMarkdown: string;
  excerpt?: string;
  heroImage?: string;
  tags?: string[];
  genre?: string;
  status?: 'draft' | 'published';
  publishDate?: string;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('[blog-create-api] 📝 Creating new blog post...');
  
  try {
    // API key authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      console.log('[blog-create-api] ❌ Unauthorized request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: CreateBlogPayload = await request.json();
    
    console.log(`[blog-create-api] Processing blog post: "${payload.title}"`);
    
    // Validate required fields
    if (!payload.title || !payload.contentMarkdown) {
      console.log('[blog-create-api] ❌ Missing required fields');
      return json({ 
        success: false,
        error: 'Missing required fields: title and contentMarkdown' 
      }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');
    
    const slug = createSlug(payload.title);
    const now = new Date();
    
    // Check if slug already exists
    const existingPost = await collection.findOne({ slug });
    if (existingPost) {
      return json({
        success: false,
        error: `A post with slug "${slug}" already exists`
      }, { status: 409 });
    }
    
    // Extract excerpt from content if not provided
    const excerpt = payload.excerpt || 
      payload.contentMarkdown.substring(0, 160).replace(/[#*\[\]]/g, '').trim() + '...';
    
    // Create post document
    const postDoc: Omit<ExtendedPostDoc, '_id'> = {
      slug,
      title: payload.title,
      excerpt,
      contentMarkdown: payload.contentMarkdown,
      heroImage: payload.heroImage || null,
      publishDate: payload.publishDate ? new Date(payload.publishDate) : now,
      publishedAt: payload.status === 'published' ? now : null,
      tags: payload.tags || [],
      genre: payload.genre || null,
      status: payload.status || 'draft',
      
      // Manual creation fields
      source: 'admin',
      createdAt: now,
      updatedAt: now
    };
    
    // Insert the new post
    const result = await collection.insertOne(postDoc);
    
    if (!result.insertedId) {
      throw new Error('Failed to create post');
    }
    
    const createdPost = { ...postDoc, _id: result.insertedId };
    
    console.log(`[blog-create-api] ✅ Created blog post: ${createdPost.title} (slug: ${createdPost.slug})`);
    
    // Build response
    const baseUrl = process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
    const postUrl = `${baseUrl}/blog/${createdPost.slug}`;
    
    const response = {
      success: true,
      id: createdPost._id.toString(),
      slug: createdPost.slug,
      url: postUrl,
      message: `Blog post "${createdPost.title}" created successfully!`,
      status: createdPost.status,
      source: 'admin',
      publishedAt: createdPost.publishedAt?.toString(),
      createdAt: createdPost.createdAt?.toString()
    };

    return json(response);

  } catch (error) {
    console.error('[blog-create-api] 💥 Error creating blog post:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};