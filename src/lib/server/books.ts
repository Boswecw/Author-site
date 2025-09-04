// server-only helpers
import { getDb } from './db';
import type { Book } from '$lib/types';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

function ensureCover(u?: string | null, title?: string): string | null {
  // normalizeFirebaseUrl already cleans quotes/encoding and keeps valid firebase download links
  const n = normalizeFirebaseUrl(u ?? null);
  return n ?? null;
}

function sanitize(book: any): Book {
  // Ensure the shape + a cleaned cover
  return {
    id: book.id,
    title: book.title,
    description: book.description ?? null,
    cover: ensureCover(book.cover, book.title),
    genre: book.genre ?? 'faith',
    status: book.status ?? 'upcoming',
    publishDate: book.publishDate ?? null,
    isbn: book.isbn ?? null,
    format: book.format ?? 'EPUB',
    pages: typeof book.pages === 'number' ? book.pages : null,
    buyLinks: book.buyLinks ?? {}
  } as Book;
}

export async function getFeaturedBook(): Promise<Book | null> {
  const db = await getDb();
  const doc = await db
    .collection('books')
    .findOne(
      { $or: [{ featured: true }, { status: 'featured' }] },
      { projection: { _id: 0, id: 1, title: 1, description: 1, cover: 1, genre: 1, status: 1, publishDate: 1, isbn: 1, format: 1, pages: 1, buyLinks: 1 } }
    );
  return doc ? sanitize(doc) : null;
}

export async function getUpcomingBooks(limit = 6): Promise<Book[]> {
  const db = await getDb();
  const cur = db
    .collection('books')
    .find(
      { status: { $in: ['upcoming', 'writing', 'coming-soon'] } },
      { projection: { _id: 0, id: 1, title: 1, description: 1, cover: 1, genre: 1, status: 1, publishDate: 1 } }
    )
    .sort({ publishDate: 1, title: 1 }) // soonest first
    .limit(limit);

  const items = await cur.toArray();
  return items.map(sanitize).filter((b) => !!b.cover); // ensure cover present
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDb();
  const cur = db
    .collection('books')
    .find({}, { projection: { _id: 0, id: 1, title: 1, description: 1, cover: 1, genre: 1, status: 1, publishDate: 1, buyLinks: 1 } })
    .sort({ status: 1, publishDate: 1, title: 1 });

  const items = await cur.toArray();
  return items.map(sanitize);
}
