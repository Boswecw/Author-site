// src/lib/server/posts.ts - Add the missing export
import type { PostDoc } from '../types/index.js';
import { getDb } from './db.js';

export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  try {
    const db = await getDb();
    const coll = db.collection<PostDoc>('posts');
    return await coll.findOne({ slug, status: 'published' });
  } catch (error) {
    console.error('Failed to get post:', error);
    return null;
  }
}

export async function getAllPosts(): Promise<PostDoc[]> {
  try {
    const db = await getDb();
    const coll = db.collection<PostDoc>('posts');
    return await coll.find({ status: 'published' }).sort({ publishDate: -1 }).toArray();
  } catch (error) {
    console.error('Failed to get posts:', error);
    return [];
  }
}

// Add the missing function
export async function getPublishedPosts(): Promise<PostDoc[]> {
  return getAllPosts(); // Same as getAllPosts
}