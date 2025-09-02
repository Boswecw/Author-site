// src/lib/server/books.ts
import { getDb } from '$lib/server/db';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

export type BookDoc = {
  id: string;                 // string id you use in the app
  title: string;
  description?: string | null;
  cover?: string | null;      // URL (can be firebase/appspot)
  genre?: 'faith' | 'epic' | string | null;
  status?: 'featured' | 'published' | 'upcoming' | string | null;
  publishDate?: Date | string | null;
  isbn?: string | null;
  format?: string | null;     // hardcover, ebook, etc.
};

const fields = {
  id: 1,
  title: 1,
  description: 1,
  cover: 1,
  genre: 1,
  status: 1,
  publishDate: 1,
  isbn: 1,
  format: 1
} as const;

export async function getFeaturedBook(): Promise<BookDoc | null> {
  try {
    const db = await getDb();
    // if you prefer a different criterion, adjust here
    const doc = await db.collection<BookDoc>('books').findOne(
      { status: 'featured' },
      { projection: { _id: 0, ...fields } }
    );
    if (doc) doc.cover = normalizeFirebaseUrl(doc.cover);
    return doc ?? null;
  } catch (e) {
    console.error('[getFeaturedBook] failed:', e);
    return null;
  }
}

export async function getBookById(id: string): Promise<BookDoc | null> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<BookDoc>('books')
      .findOne({ id }, { projection: { _id: 0, ...fields } });
    if (doc) doc.cover = normalizeFirebaseUrl(doc.cover);
    return doc ?? null;
  } catch (e) {
    console.error('[getBookById] failed:', e);
    return null;
  }
}
