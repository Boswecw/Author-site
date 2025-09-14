// src/routes/api/blog/[slug]/update/+server.ts
// Blog API endpoint for updating blog posts

import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/server/blog-google-docs';

const API_KEY =
  process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

interface UpdateBlogPayload {
  id: string;
  title?: string;
  contentMarkdown?: string;
  excerpt?: string;
  heroImage?: string | null;
  tags?: string[];
  genre?: string | null;
  status?: 'draft' | 'published';
  publishDate?: string | null; // ISO string or null to clear
}

function createSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('[blog-update-api] 📝 Updating blog post...');

  try {
    // API key auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      console.log('[blog-update-api] ❌ Unauthorized request');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: UpdateBlogPayload = await request.json();

    // Validate
    if (!payload.id) {
      return json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(payload.id)) {
      return json(
        { success: false, error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');

    const _id = new ObjectId(payload.id);
    const existing = await collection.findOne({ _id });
    if (!existing) {
      return json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    console.log(`[blog-update-api] Updating: "${existing.title}"`);

    const now = new Date();

    // Build a flexible update object without fighting TS if your ExtendedPostDoc
    // doesn’t yet declare these fields (createdAt/updatedAt/etc).
    const set: Record<string, unknown> = { updatedAt: now };

    // Title/slug
    if (payload.title && payload.title !== existing.title) {
      const newSlug = createSlug(payload.title);
      const conflict = await collection.findOne({ slug: newSlug, _id: { $ne: _id } });
      if (conflict) {
        return json(
          { success: false, error: `A post with slug "${newSlug}" already exists` },
          { status: 409 }
        );
      }
      set.title = payload.title;
      set.slug = newSlug;
    }

    // Content + derived excerpt (if not provided)
    if (payload.contentMarkdown !== undefined) {
      set.contentMarkdown = payload.contentMarkdown;
      if (!payload.excerpt && typeof payload.contentMarkdown === 'string') {
        set.excerpt =
          payload.contentMarkdown.substring(0, 160).replace(/[#*\[\]]/g, '').trim() +
          '...';
      }
    }

    // Explicit excerpt overrides auto
    if (payload.excerpt !== undefined) set.excerpt = payload.excerpt;

    // Media + meta
    if (payload.heroImage !== undefined) set.heroImage = payload.heroImage;
    if (payload.tags !== undefined) set.tags = payload.tags;
    if (payload.genre !== undefined) set.genre = payload.genre;

    // Dates
    if (payload.publishDate !== undefined) {
      set.publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
    }

    // Status (+ publishedAt management)
    if (payload.status !== undefined) {
      set.status = payload.status;
      set.publishedAt = payload.status === 'published' ? now : null;
    }

    // Do the update and get the new doc back
    const updateRes = await collection.findOneAndUpdate(
      { _id },
      { $set: set },
      { returnDocument: 'after' }
    );

    const updated = updateRes.value;
    if (!updated) {
      throw new Error('Failed to update post');
    }

    console.log(
      `[blog-update-api] ✅ Updated: ${updated.title} (slug: ${updated.slug})`
    );

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
      updatedAt: (updated as any).updatedAt?.toString()
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
