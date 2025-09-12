// src/routes/api/blog/google-docs/+server.ts - New endpoint for Google Docs blog posts

import { json } from '@sveltejs/kit';
import { saveGoogleDocsPost, checkGoogleDocSync } from '$lib/server/blog-google-docs';
import type { RequestHandler } from './$types';

const API_KEY = process.env.CONTENT_API_KEY || 'your-secret-api-key';

interface GoogleDocsBlogPayload {
  googleDocId: string;
  title: string;
  htmlContent: string;
  metadata: {
    excerpt?: string;
    tags?: string[];
    status?: 'draft' | 'published';
    heroImage?: string;
    genre?: string;
    publishDate?: string;
  };
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('[blog-api] 📝 Receiving blog post from Google Docs...');
  
  try {
    // API key authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      console.log('[blog-api] ❌ Unauthorized request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: GoogleDocsBlogPayload = await request.json();
    
    console.log(`[blog-api] Processing blog post: "${payload.title}"`);
    
    // Validate required fields
    if (!payload.googleDocId || !payload.title || !payload.htmlContent) {
      console.log('[blog-api] ❌ Missing required fields');
      return json({ 
        success: false,
        error: 'Missing required fields: googleDocId, title, htmlContent' 
      }, { status: 400 });
    }

    // Save to your existing posts collection (as Markdown)
    const savedPost = await saveGoogleDocsPost({
      googleDocId: payload.googleDocId,
      title: payload.title,
      htmlContent: payload.htmlContent,
      metadata: payload.metadata || {}
    });

    console.log(`[blog-api] ✅ Saved blog post: ${savedPost.title} (slug: ${savedPost.slug})`);
    
    // Build response
    const baseUrl = process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
    const postUrl = `${baseUrl}/blog/${savedPost.slug}`;
    
    const response = {
      success: true,
      id: savedPost._id?.toString(),
      slug: savedPost.slug,
      url: postUrl,
      message: `Blog post "${savedPost.title}" saved successfully!`,
      status: savedPost.status,
      source: 'google-docs'
    };

    return json(response);

  } catch (error) {
    console.error('[blog-api] 💥 Error processing blog post:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};

// GET endpoint to check if Google Doc has been synced
export const GET: RequestHandler = async ({ url, request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleDocId = url.searchParams.get('googleDocId');
    
    if (!googleDocId) {
      return json({ 
        error: 'Missing required parameter: googleDocId' 
      }, { status: 400 });
    }

    // Check if this Google Doc has been synced before
    const syncStatus = await checkGoogleDocSync(googleDocId);
    
    if (syncStatus.exists && syncStatus.post) {
      return json({
        exists: true,
        post: {
          id: syncStatus.post._id,
          title: syncStatus.post.title,
          slug: syncStatus.post.slug,
          status: syncStatus.post.status,
          publishDate: syncStatus.post.publishDate,
          lastSynced: syncStatus.lastSynced
        },
        url: `/blog/${syncStatus.post.slug}`
      });
    } else {
      return json({ exists: false });
    }

  } catch (error) {
    console.error('[blog-api] Error checking sync status:', error);
    return json({ 
      error: 'Failed to check sync status' 
    }, { status: 500 });
  }
};