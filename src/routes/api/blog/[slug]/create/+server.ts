// src/routes/api/blog/create/+server.ts
// Blog API endpoint for manual blog post creation
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';
import type { ExtendedPostDoc } from '$lib/types';

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
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('[blog-create-api] 📝 Creating new blog post...');
  try {
    // API key authentication
    const authHeader = request.headers.get('authorization') ?? request.headers.get('x-api-key');
    if (!authHeader || !authHeader.includes(API_KEY)) {
      console.log('[blog-create-api] ❌ Unauthorized request');
      return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload: CreateBlogPayload = await request.json();

    console.log(`[blog-create-api] Processing blog post: "${payload.title}"`);

    if (!payload.title || !payload.contentMarkdown) {
      console.log('[blog-create-api] ❌ Missing required fields');
      return json(
        {
          success: false,
          error: 'Missing required fields: title and contentMarkdown'
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<ExtendedPostDoc>('posts');

    const slug = createSlug(payload.title);
    const now = new Date();

    // Ensure unique slug
    const existingPost = await collection.findOne({ slug });
    if (existingPost) {
      return json(
        {
          success: false,
          error: `A post with slug "${slug}" already exists`
        },
        { status: 409 }
      );
    }

    // Derive excerpt if omitted
    const excerpt =
      payload.excerpt ??
      (payload.contentMarkdown.substring(0, 160).replace(/[#*\[\]]/g, '').trim() + '...');

    // Create post document
    const postDoc: Omit<ExtendedPostDoc, '_id'> = {
      slug,
      title: payload.title,
      excerpt,
      contentMarkdown: payload.contentMarkdown,
      heroImage: payload.heroImage ?? null,
      publishDate: payload.publishDate ? new Date(payload.publishDate) : now,
      publishedAt: payload.status === 'published' ? now : null,
      tags: payload.tags ?? [],
      genre: payload.genre ?? null,
      status: payload.status ?? 'draft',
      source: 'admin',
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(postDoc);
    if (!result.insertedId) throw new Error('Failed to create post');

    const createdPost = { ...postDoc, _id: result.insertedId };

    console.log(
      `[blog-create-api] ✅ Created blog post: ${createdPost.title} (slug: ${createdPost.slug})`
    );

    const baseUrl = process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
    const postUrl = `${baseUrl}/blog/${createdPost.slug}`;

    return json({
      success: true,
      id: createdPost._id.toString(),
      slug: createdPost.slug,
      url: postUrl,
      message: `Blog post "${createdPost.title}" created successfully!`,
      status: createdPost.status,
      source: 'admin',
      publishedAt: createdPost.publishedAt?.toString(),
      createdAt: createdPost.createdAt?.toString()
    });
  } catch (error) {
    console.error('[blog-create-api] 💥 Error creating blog post:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
};
