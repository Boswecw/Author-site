// src/lib/server/posts.ts
import type { ObjectId } from 'mongodb';

export interface PostDoc {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  heroImage?: string | null;
  publishDate?: Date | string | null;
  publishedAt?: Date | string | null;
  tags?: string[] | null;
  status: 'published' | 'draft';
  genre?: 'faith' | 'epic' | string | null;
}

/**
 * CRITICAL FIX: Safe database imports with error handling
 */
async function getSafeDb() {
  try {
    const { getDb } = await import('./db');
    return await getDb();
  } catch (error) {
    console.error('[getSafeDb] Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  if (!slug || typeof slug !== 'string') {
    console.warn('[getPostBySlug] Invalid slug:', slug);
    return null;
  }

  try {
    const db = await getSafeDb();
    
    const post = await db
      .collection<PostDoc>('posts')
      .findOne(
        { slug, status: 'published' },
        {
          projection: {
            _id: 0,
            slug: 1,
            title: 1,
            excerpt: 1,
            contentMarkdown: 1,
            heroImage: 1,
            publishDate: 1,
            publishedAt: 1,
            tags: 1,
            status: 1,
            genre: 1
          }
        }
      );

    if (!post) {
      console.warn('[getPostBySlug] Post not found:', slug);
      return null;
    }

    return post;
  } catch (error) {
    console.error('[getPostBySlug] Database error:', error);
    return null;
  }
}

/**
 * Get all published blog posts with pagination
 */
export async function getPosts(page = 1, pageSize = 10): Promise<{
  posts: PostDoc[];
  total: number;
  hasMore: boolean;
}> {
  try {
    const db = await getSafeDb();
    const collection = db.collection<PostDoc>('posts');

    // Query for published posts only
    const query = { status: 'published' as const };

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated posts
    const posts = await collection
      .find(query, {
        projection: {
          _id: 0,
          slug: 1,
          title: 1,
          excerpt: 1,
          heroImage: 1,
          publishDate: 1,
          publishedAt: 1,
          tags: 1,
          genre: 1
        }
      })
      .sort({ publishDate: -1, publishedAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      posts,
      total,
      hasMore: posts.length === pageSize && (page * pageSize) < total
    };
  } catch (error) {
    console.error('[getPosts] Database error:', error);
    return {
      posts: [],
      total: 0,
      hasMore: false
    };
  }
}