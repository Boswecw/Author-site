// src/lib/server/books.ts
import { getDb } from '$lib/server/db';

export type BookDoc = {
  id: string;
  title: string;
  cover: string;
  description: string;
  status: 'upcoming' | 'published';
  publishDate: string; // ISO
  isbn?: string;
  format: 'EPUB' | 'Paperback' | 'Hardcover';
  genre: 'faith' | 'epic';
  buyLinks: Record<string, string>;
  featured?: boolean;
};

export async function getBookById(id: string) {
  const db = await getDb();
  return db.collection<BookDoc>('books').findOne({ id });
}

export async function getFeaturedBook() {
  const db = await getDb();

  // optional: site_settings takes priority if present
  const settings = await db.collection<{ _id: 'main'; featured_book_id?: string }>('site_settings')
    .findOne({ _id: 'main' });
  if (settings?.featured_book_id) {
    const pick = await db.collection<BookDoc>('books').findOne({ id: settings.featured_book_id });
    if (pick) return pick;
  }

  // else: featured flag, else nearest upcoming, else latest published, else any
  const featured = await db.collection<BookDoc>('books').findOne({ featured: true });
  if (featured) return featured;

  const upcoming = await db.collection<BookDoc>('books')
    .find({ status: 'upcoming' })
    .sort({ publishDate: 1 })
    .limit(1)
    .toArray();
  if (upcoming[0]) return upcoming[0];

  const published = await db.collection<BookDoc>('books')
    .find({ status: 'published' })
    .sort({ publishDate: -1 })
    .limit(1)
    .toArray();
  if (published[0]) return published[0];

  return await db.collection<BookDoc>('books').findOne({});
}
