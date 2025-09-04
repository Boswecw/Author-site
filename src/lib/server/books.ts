// src/lib/server/books.ts
import { getDb } from './db';
import type { Book, BookDoc } from '$lib/types';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

// Export the type so it can be imported elsewhere
export type { BookDoc } from '$lib/types';

function ensureCover(url?: string | null): string | null {
  return normalizeFirebaseUrl(url) ?? null;
}

function sanitizeBook(book: any): Book {
  return {
    id: book.id,
    title: book.title,
    description: book.description ?? null,
    cover: ensureCover(book.cover),
    genre: book.genre ?? 'faith',
    status: book.status ?? 'writing',
    publishDate: book.publishDate instanceof Date 
      ? book.publishDate.toISOString() 
      : (book.publishDate ?? null),
    isbn: book.isbn ?? null,
    format: book.format ?? 'EPUB',
    pages: typeof book.pages === 'number' ? book.pages : null,
    buyLinks: book.buyLinks ?? null
  };
}

export async function getFeaturedBook(): Promise<Book | null> {
  const db = await getDb();
  const doc = await db
    .collection<BookDoc>('books')
    .findOne(
      { $or: [{ featured: true }, { status: 'featured' }] },
      { 
        projection: { 
          _id: 0, id: 1, title: 1, description: 1, cover: 1, 
          genre: 1, status: 1, publishDate: 1, isbn: 1, format: 1, 
          pages: 1, buyLinks: 1 
        } 
      }
    );
  return doc ? sanitizeBook(doc) : null;
}

export async function getUpcomingBooks(limit = 6): Promise<Book[]> {
  const db = await getDb();
  const docs = await db
    .collection<BookDoc>('books')
    .find(
      { status: { $in: ['writing', 'coming-soon', 'draft'] } },
      { 
        projection: { 
          _id: 0, id: 1, title: 1, description: 1, cover: 1, 
          genre: 1, status: 1, publishDate: 1 
        } 
      }
    )
    .sort({ publishDate: 1, title: 1 })
    .limit(limit)
    .toArray();

  return docs.map(sanitizeBook).filter(book => book.cover);
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDb();
  const docs = await db
    .collection<BookDoc>('books')
    .find({}, { 
      projection: { 
        _id: 0, id: 1, title: 1, description: 1, cover: 1, 
        genre: 1, status: 1, publishDate: 1, buyLinks: 1 
      } 
    })
    .sort({ status: 1, publishDate: 1, title: 1 })
    .toArray();

  return docs.map(sanitizeBook);
}