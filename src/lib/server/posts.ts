// src/lib/server/posts.ts - UPDATED TO FIX MISSING EXPORTS
import { getDb } from '$lib/server/db';
import type { PostDoc } from '$lib/types';

// re-export for consumers
export type { PostDoc };

// ✅ ADD MISSING getPublishedPosts FUNCTION
export async function getPublishedPosts(limit = 50): Promise<PostDoc[]> {
  try {
    const db = await getDb();
    const posts = await db
      .collection<PostDoc>('posts')
      .find(
        { status: 'published' },
        { 
          projection: { 
            _id: 0, 
            slug: 1, 
            title: 1, 
            excerpt: 1, 
            publishDate: 1, 
            publishedAt: 1,
            contentMarkdown: 1,
            heroImage: 1,
            tags: 1,
            status: 1
          } 
        }
      )
      .sort({ publishDate: -1, publishedAt: -1 })
      .limit(limit)
      .toArray();

    return posts.map(post => ({
      _id: post._id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      contentMarkdown: post.contentMarkdown || '',
      heroImage: post.heroImage,
      publishDate: post.publishDate,
      publishedAt: post.publishedAt,
      tags: post.tags || [],
      status: post.status,
      genre: post.genre
    } as PostDoc));
  } catch (error) {
    console.error('[getPublishedPosts] Database error:', error);
    return [];
  }
}

// (Optional) helpful for blog pages:
export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  try {
    const db = await getDb();
    const post = await db.collection<PostDoc>('posts').findOne({ slug });
    
    if (!post) return null;
    
    return {
      _id: post._id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      contentMarkdown: post.contentMarkdown,
      contentHtml: post.contentHtml,
      heroImage: post.heroImage,
      publishDate: post.publishDate,
      publishedAt: post.publishedAt,
      tags: post.tags,
      status: post.status,
      genre: post.genre
    } as PostDoc;
  } catch (error) {
    console.error('[getPostBySlug] Database error:', error);
    return null;
  }
}