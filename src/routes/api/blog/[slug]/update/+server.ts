// src/routes/api/blog/[slug]/update/+server.ts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId, type ModifyResult, type WithId } from 'mongodb';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/server/blog-google-docs';

const API_KEY =
  process.env.BLOG_API_KEY || process.env.CONTENT_API_KEY || 'your-blog-api-key';

interface UpdateBlogPayload {
  id?: string;
  slug?: string;
  title?: string;
  contentMarkdown?: string;
  excerpt?: string | null;
  heroImage?: string | null;
  tags?: string[];
  genre?: string | null;
  status?: 'draft' | 'published';
  publishDate?: string | null;
}

function createSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const POST: RequestHandler = async ({ request, params }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes(API_KEY)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: UpdateBlogPayload = await request.json();
    const paramSlug = params.slug;

    // Build filter: id OR slug (body or route)
    let filter: Record<string, any> | null = null;
    if (payload.id && ObjectId.isValid(payload.id)) {
      filter = { _id: new ObjectId(payload.id) };
    } else if (payload.slug) {
      filter = { slug: payload.slug };
    } else if (paramSlug) {
      filter = { slug: paramSlug };
    }
    if (!filter) {
      return json(
        { success: false, error: 'Missing identifier: provide id or slug' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection<ExtendedPostDoc>('posts');

    const existing = await col.findOne(filter);
    if (!existing) {
      return json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    const now = new Date();

    const updateData: Partial<ExtendedPostDoc> & {
      updatedAt?: Date;
      publishedAt?: Date | null;
      slug?: string;
      excerpt?: string | null;
    } = { updatedAt: now };

    // Title → slug (check conflicts)
    if (payload.title && payload.title !== existing.title) {
      const newSlug = createSlug(payload.title);
      const conflict = await col.findOne({
        slug: newSlug,
        _id: { $ne: (existing as any)._id }
      });
      if (conflict) {
        return json(
          { success: false, error: `A post with slug "${newSlug}" already exists` },
          { status: 409 }
        );
      }
      updateData.title = payload.title;
      updateData.slug = newSlug;
    }

    if (payload.contentMarkdown !== undefined) {
      updateData.contentMarkdown = payload.contentMarkdown;
      if (!payload.excerpt && payload.contentMarkdown) {
        updateData.excerpt =
          payload.contentMarkdown.substring(0, 160).replace(/[#*\[\]]/g, '').trim() +
          '...';
      }
    }
    if (payload.excerpt !== undefined) updateData.excerpt = payload.excerpt ?? null;
    if (payload.heroImage !== undefined) updateData.heroImage = payload.heroImage ?? null;
    if (payload.tags !== undefined) updateData.tags = payload.tags ?? [];
    if (payload.genre !== undefined) updateData.genre = payload.genre ?? null;
    if (payload.publishDate !== undefined) {
      updateData.publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
    }

    if (payload.status !== undefined) {
      updateData.status = payload.status;
      updateData.publishedAt = payload.status === 'published' ? now : null;
    }

    const res: ModifyResult<ExtendedPostDoc> = await col.findOneAndUpdate(
      { _id: (existing as any)._id },
      { $set: updateData },
      { returnDocument: 'after' as const }
    );

    const updated: WithId<ExtendedPostDoc> | null = res.value ?? null;
    if (!updated) {
      return json({ success: false, error: 'Failed to update post' }, { status: 500 });
    }

    const baseUrl =
      process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';

    return json({
      success: true,
      id: (updated as any)._id?.toString?.(),
      slug: updated.slug,
      url: `${baseUrl}/blog/${updated.slug}`,
      message: `Blog post "${updated.title}" updated successfully!`,
      status: updated.status,
      publishedAt: updated.publishedAt?.toString(),
      updatedAt: (updated as any).updatedAt?.toString()
    });
  } catch (err) {
    console.error('[blog-update-api] Error:', err);
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
