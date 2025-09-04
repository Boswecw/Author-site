// src/lib/server/posts.ts
import { getDb } from '$lib/server/db';

export type PostDoc = {
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  tags?: string[];
  published: boolean;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

// ✅ export this — RSS depends on it
export async function getPublishedPosts(limit = 50): Promise<Array<
  Pick<PostDoc, 'slug' | 'title' | 'excerpt' | 'publishedAt' | 'updatedAt'>
>> {
  const db = await getDb();
  const posts = await db
    .collection<PostDoc>('posts')
    .find(
      { published: true },
      { projection: { _id: 0, slug: 1, title: 1, excerpt: 1, publishedAt: 1, updatedAt: 1 } }
    )
    .sort({ publishedAt: -1, updatedAt: -1 })
    .limit(limit)
    .toArray();

  return posts;
}

// (Optional) helpful for blog pages:
export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  const db = await getDb();
  return db.collection<PostDoc>('posts').findOne({ slug });
}
