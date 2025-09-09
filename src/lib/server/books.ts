// src/lib/server/books.ts
import { getDb } from '$lib/server/db';
import { buildBookCoverUrl } from '$lib/utils/firebase';
import type { Book, BookDoc, BookStatus } from '$lib/types';

// Re-export for convenience
export type { BookDoc } from '$lib/types';

function ensureCover(url?: string | null): string | null {
  return url ? buildBookCoverUrl(url) : null;
}

function toIsoOrNull(d: unknown): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  if (typeof d === 'string') return d;
  return null;
}

function sanitizeBook(doc: any): Book {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description ?? null,
    cover: ensureCover(doc.cover),
    genre: doc.genre ?? 'faith',
    status: doc.status ?? 'writing',
    publishDate: toIsoOrNull(doc.publishDate),
    isbn: doc.isbn ?? null,
    format: doc.format ?? 'EPUB',
    pages: typeof doc.pages === 'number' ? doc.pages : null,
    buyLinks: doc.buyLinks ?? null
  };
}

const baseProjection = {
  _id: 0,
  id: 1,
  title: 1,
  description: 1,
  cover: 1,
  genre: 1,
  status: 1,
  publishDate: 1,
  isbn: 1,
  format: 1,
  pages: 1,
  buyLinks: 1
} as const;

/** ✅ Used by routes/books/[id]/+page.server.ts */
export async function getBookById(id: string): Promise<Book | null> {
  const db = await getDb();
  const doc = await db
    .collection<BookDoc>('books')
    .findOne({ id }, { projection: baseProjection });
  return doc ? sanitizeBook(doc) : null;
}

export async function getFeaturedBook(): Promise<Book | null> {
  const db = await getDb();
  const doc = await db
    .collection<BookDoc>('books')
    .findOne(
      { $or: [{ featured: true }, { status: 'featured' }] },
      { projection: baseProjection }
    );
  return doc ? sanitizeBook(doc) : null;
}

export async function getUpcomingBooks(limit = 6): Promise<Book[]> {
  const db = await getDb();
  const statuses: BookStatus[] = ['writing', 'coming-soon', 'draft']; // typed array
  const docs = await db
    .collection<BookDoc>('books')
    .find(
      { status: { $in: statuses } },
      {
        // include-only projection (no exclusions with includes)
        projection: {
          _id: 0,
          id: 1,
          title: 1,
          description: 1,
          cover: 1,
          genre: 1,
          status: 1,
          publishDate: 1
        }
      }
    )
    .sort({ publishDate: 1, title: 1 })
    .limit(limit)
    .toArray();

  return docs.map(sanitizeBook).filter((b) => b.cover);
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDb();
  const docs = await db
    .collection<BookDoc>('books')
    .find(
      {},
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
          buyLinks: 1
        }
      }
    )
    .sort({ status: 1, publishDate: 1, title: 1 })
    .toArray();

  return docs.map(sanitizeBook);
}
