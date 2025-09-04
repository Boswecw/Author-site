// src/lib/server/posts.ts
import { getDb } from '$lib/server/db';
import type { PostDoc } from '$lib/types';

// re-export for consumers
export type { PostDoc };

// ✅ export this — RSS depends on it
export async function getPublishedPosts(limit = 50): Promise<Array<
  Pick<PostDoc, 'slug' | 'title' | 'excerpt' | 'publishDate' | 'publishedAt'>
>> {
  const db = await getDb();
  const posts = await db
    .collection<PostDoc>('posts')
    .find(
      { status: 'published' },
      { projection: { _id: 0, slug: 1, title: 1, excerpt: 1, publishDate: 1, publishedAt: 1 } }
    )
    .sort({ publishDate: -1, publishedAt: -1 })
    .limit(limit)
    .toArray();

  return posts;
}

// (Optional) helpful for blog pages:
export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  const db = await getDb();
  return db.collection<PostDoc>('posts').findOne({ slug });
}
