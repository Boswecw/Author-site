// src/lib/server/posts.ts
import type { Document } from 'mongodb';
import { getDb } from '$lib/server/db';

export type PostDoc = {
  _id?: any;
  slug: string;
  title: string;
  excerpt?: string;
  contentMarkdown: string;
  heroImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
  genre?: 'faith' | 'epic';
  series?: string;
  author?: { name: string };
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
  featured?: boolean;
  canonicalUrl?: string;
  readTime?: string;
};

export type PublishedPost = Omit<PostDoc, '_id'> & {
  id?: string;
  publishDate: string | null;
};

export async function getPublishedPosts(
  page = 1,
  pageSize = 10,
  tag?: string
): Promise<{ items: PublishedPost[]; total: number; page: number; pageSize: number }> {
  const db = await getDb();
  const filter: Document = { status: 'published' };
  if (tag && tag !== 'All') filter.tags = tag; // matches array membership

  const coll = db.collection<PostDoc>('posts');

  const cursor = coll
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  const [itemsRaw, total] = await Promise.all([
    cursor.toArray(),
    coll.countDocuments(filter)
  ]);

  const items: PublishedPost[] = itemsRaw.map((p) => ({
    ...p,
    id: p._id ? String(p._id) : undefined,
    publishDate: p.publishedAt ?? null
  }));

  return { items, total, page, pageSize };
}

export async function getPostBySlug(slug: string): Promise<PublishedPost | null> {
  const db = await getDb();
  const doc = await db.collection<PostDoc>('posts').findOne({ slug });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id ? String(doc._id) : undefined,
    publishDate: doc.publishedAt ?? null
  };
}

export async function getAllTags(): Promise<string[]> {
  const db = await getDb();
  const agg = await db
    .collection<PostDoc>('posts')
    .aggregate<{ tags: string[] }>([
      { $match: { status: 'published', tags: { $type: 'array', $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: null, tags: { $addToSet: '$tags' } } },
      { $project: { _id: 0, tags: 1 } }
    ])
    .toArray();

  const tags = agg[0]?.tags ?? [];
  return tags.filter(Boolean).sort();
}
