// src/routes/api/blog/[slug]/update/+server.ts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/types';

const API_KEY =
  process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

interface UpdateBlogPayload {
  id: string;
  title?: string;
  slug?: string;
  contentMarkdown?: string;
  excerpt?: string;
  heroImage?: string | null;
  tags?: string[];
  genre?: string | null;
  status?: 'draft' | 'published';
  publishDate?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('[blog-update-api] ✏️ Updating blog post...');

  try {
    // API key authentication
    const authHeader =
      request.headers.get('authorization') ?? request.headers.get('x-api-key');
    if (!authHeader || !authHeader.includes(API_KEY)) {
      console.log('[blog-update-api] ❌ Unauthorized request');
      return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload: UpdateBlogPayload = await request.json();

    if (!payload.id) {
      return json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');

    const updateData: Record<string, unknown> = {};
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.contentMarkdown !== undefined)
      updateData.contentMarkdown = payload.contentMarkdown;
    if (payload.excerpt !== undefined) updateData.excerpt = payload.excerpt;
    if (payload.heroImage !== undefined) updateData.heroImage = payload.heroImage;
    if (payload.tags !== undefined) updateData.tags = payload.tags;
    if (payload.genre !== undefined) updateData.genre = payload.genre;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.publishDate !== undefined) {
      updateData.publishDate = payload.publishDate
        ? new Date(payload.publishDate)
        : null;
    }
    updateData.updatedAt = new Date();

    const { value: updated } = await collection.findOneAndUpdate(
      { _id: new ObjectId(payload.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return json(
        { success: false, error: 'Post not found or not updated' },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
    const postUrl = `${baseUrl}/blog/${updated.slug}`;

    return json({
      success: true,
      id: updated._id.toString(),
      slug: updated.slug,
      url: postUrl,
      message: `Blog post "${updated.title}" updated successfully!`,
      status: updated.status,
      publishedAt: updated.publishedAt?.toString(),
      updatedAt: updated.updatedAt?.toString()
    });
  } catch (error) {
    console.error('[blog-update-api] 💥 Error updating blog post:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
};
