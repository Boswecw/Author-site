// src/lib/server/posts.ts
import { ObjectId } from 'mongodb';
import { getDb } from './db.js';
import { buildPostImageUrl } from '$lib/utils/firebase';

export type PostDoc = {
  _id: ObjectId;
  slug: string;
  title: string;
  excerpt?: string;
  contentMarkdown?: string;
  heroImage?: string;
  publishDate?: string;
  publishedAt?: string;
  tags?: string[];
  genre?: string;
  status?: 'draft' | 'published';
};

const COLLECTION = 'posts';

const projection = {
  _id: 1,
  slug: 1,
  title: 1,
  excerpt: 1,
  contentMarkdown: 1,
  heroImage: 1,
  publishDate: 1,
  publishedAt: 1,
  tags: 1,
  genre: 1,
  status: 1
} as const;

function serialize(post: PostDoc) {
  const { _id, heroImage, ...rest } = post;
  return {
    id: _id.toString(),
    ...rest,
    heroImage: heroImage ? buildPostImageUrl(heroImage) : heroImage
  };
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  const coll = db.collection<PostDoc>(COLLECTION);

  const doc = await coll.findOne({ slug, status: 'published' }, { projection });
  return doc ? serialize(doc) : null;
}

export async function getPublishedPosts(page = 1, pageSize = 10) {
  const db = await getDb();
  const coll = db.collection<PostDoc>(COLLECTION);

  const match = { status: 'published' as const };
  const total = await coll.countDocuments(match);

  const docs = await coll
    .find(match, { projection })
    .sort({ publishDate: -1, publishedAt: -1, _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return {
    total,
    items: docs.map(serialize)
  };
}

export async function getAllTags() {
  const db = await getDb();
  const coll = db.collection<PostDoc>(COLLECTION);

  const tags = await coll.distinct('tags', { status: 'published' });
  return (tags as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b));
}
