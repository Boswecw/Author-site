// src/lib/server/books.ts
import { getDb } from '$lib/server/db';

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

export async function getFeaturedBook(): Promise<BookDoc | null> {
  try {
    const db = await getDb();
    // if you prefer a different criterion, adjust here
    const doc = await db.collection<BookDoc>('books').findOne(
      { status: 'featured' },
      {
        projection: {
          _id: 0,
          id: 1,
          title: 1,
          description: 1,
          cover: 1,
          genre: 1,
          status: 1,
          publishDate: 1,
          isbn: 1,
          format: 1
        }
      }
    );
    return doc ?? null;
  } catch (e) {
    console.error('[getFeaturedBook] failed:', e);
    return null;
  }
}
