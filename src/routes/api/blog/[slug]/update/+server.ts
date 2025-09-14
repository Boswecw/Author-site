// src/routes/api/blog/update/+server.ts
// Blog API endpoint for updating blog posts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/server/blog-google-docs';

const API_KEY = process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

interface UpdateBlogPayload {
  id: string;
  title?: string;
  contentMarkdown?: string;
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
  console.log('[blog-update-api] 📝 Updating blog post...');
  
  try {
    // API key authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      console.log('[blog-update-api] ❌ Unauthorized request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: UpdateBlogPayload = await request.json();
    
    // Validate required fields
    if (!payload.id) {
      console.log('[blog-update-api] ❌ Missing post ID');
      return json({ 
        success: false,
        error: 'Missing required field: id' 
      }, { status: 400 });
    }

    if (!ObjectId.isValid(payload.id)) {
      return json({
        success: false,
        error: 'Invalid post ID format'
      }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');
    
    // Get existing post
    const existingPost = await collection.findOne({ _id: new ObjectId(payload.id) });
    
    if (!existingPost) {
      return json({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }

    console.log(`[blog-update-api] Updating blog post: "${existingPost.title}"`);
    
    const now = new Date();
    const updateData: Partial<ExtendedPostDoc> = {
      updatedAt: now
    };
    
    // Handle title change (which affects slug)
    if (payload.title && payload.title !== existingPost.title) {
      const newSlug = createSlug(payload.title);
      
      // Check if new slug conflicts with another post
      const slugConflict = await collection.findOne({ 
        slug: newSlug, 
        _id: { $ne: new ObjectId(payload.id) } 
      });
      
      if (slugConflict) {
        return json({
          success: false,
          error: `A post with slug "${newSlug}" already exists`
        }, { status: 409 });
      }
      
      updateData.title = payload.title;
      updateData.slug = newSlug;
    }
    
    // Handle other fields
    if (payload.contentMarkdown !== undefined) {
      updateData.contentMarkdown = payload.contentMarkdown;
    }
    
    if (payload.excerpt !== undefined) {
      updateData.excerpt = payload.excerpt;
    } else if (payload.contentMarkdown && !payload.excerpt) {
      // Auto-generate excerpt if content changed but no explicit excerpt
      updateData.excerpt = payload.contentMarkdown.substring(0, 160).replace(/[#*\[\]]/g, '').trim() + '...';
    }
    
    if (payload.heroImage !== undefined) {
      updateData.heroImage = payload.heroImage || null;
    }
    
    if (payload.tags !== undefined) {
      updateData.tags = payload.tags;
    }
    
    if (payload.genre !== undefined) {
      updateData.genre = payload.genre || null;
    }
    
    if (payload.publishDate !== undefined) {
      updateData.publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
    }
    
    // Handle status change
    if (payload.status !== undefined) {
      updateData.status = payload.status;
      
      // Set publishedAt when publishing, clear it when setting to draft
      if (payload.status === 'published') {
        updateData.publishedAt = now;
      } else {
        updateData.publishedAt = null;
      }
    }
    
    // Update the post
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(payload.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Failed to update post');
    }
    
    console.log(`[blog-update-api] ✅ Updated blog post: ${result.title} (slug: ${result.slug})`);
    
    // Build response
    const baseUrl = process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
    const postUrl = `${baseUrl}/blog/${result.slug}`;
    
    const response = {
      success: true,
      id: result._id.toString(),
      slug: result.slug,
      url: postUrl,
      message: `Blog post "${result.title}" updated successfully!`,
      status: result.status,
      publishedAt: result.publishedAt?.toString(),
      updatedAt: result.updatedAt?.toString()
    };

    return json(response);

  } catch (error) {
    console.error('[blog-update-api] 💥 Error updating blog post:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};