// src/lib/server/books.ts - Complete fix
import { getDb } from '$lib/server/db';
import type { Book, BookDoc, BookStatus } from '$lib/types'; // ✅ FIXED: Import BookStatus

// Re-export for convenience
export type { BookDoc } from '$lib/types';

/* ----------------------- helpers: sanitize & utils ----------------------- */

function ensureCover(url?: string | null): string | null {
  return url ?? null;
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
    buyLinks: doc.buyLinks ?? {},
    featured: Boolean(doc.featured) // ✅ FIXED: Add featured property
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
  buyLinks: 1,
  featured: 1 // ✅ FIXED: Add featured to projection
} as const;

/* --------------------- helpers: cursor-or-array bridge ------------------- */

function isCursor(x: any): x is { sort: Function; limit: Function; toArray: Function } {
  return !!x && typeof x.toArray === 'function';
}

function applyProjection<T extends Record<string, any>>(doc: T, projection?: Record<string, 0 | 1>): T {
  if (!projection) return doc;
  const includeKeys = Object.entries(projection).filter(([, v]) => v === 1).map(([k]) => k);
  // If only inclusions are present (typical in our code)
  if (includeKeys.length) {
    const out: Record<string, any> = {};
    for (const k of includeKeys) {
      if (k in doc) out[k] = doc[k];
    }
    return out as T;
  }
  // Otherwise, crude exclude logic
  const out = { ...doc };
  for (const [k, v] of Object.entries(projection)) {
    if (v === 0) delete (out as any)[k];
  }
  return out as T;
}

function sortArray<T extends Record<string, any>>(arr: T[], spec?: Record<string, 1 | -1>): T[] {
  if (!spec) return arr;
  const entries = Object.entries(spec);
  if (!entries.length) return arr;
  const [field, dir] = entries[0];
  const copy = [...arr];
  copy.sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (dir as number);
  });
  return copy;
}

function filterArrayByQuery<T extends Record<string, any>>(arr: T[], query?: Record<string, any>): T[] {
  if (!query || Object.keys(query).length === 0) return arr;
  
  return arr.filter(doc => {
    return Object.entries(query).every(([key, val]) => {
      if (val && typeof val === 'object') {
        if ('$in' in val) return val.$in.includes(doc[key]);
        if ('$ne' in val) return doc[key] !== val.$ne;
        if ('$exists' in val) return (key in doc) === val.$exists;
        return false;
      }
      return doc[key] === val;
    });
  });
}

async function safeFind<T extends Record<string, any>>(
  source: any,
  query?: Record<string, any>,
  options?: { projection?: Record<string, 0 | 1>; sort?: Record<string, 1 | -1>; limit?: number }
): Promise<T[]> {
  if (isCursor(source)) {
    // Real MongoDB cursor
    let cursor = source;
    if (options?.sort) cursor = cursor.sort(options.sort);
    if (options?.limit) cursor = cursor.limit(options.limit);
    return await cursor.toArray();
  } else {
    // Mock array
    let result = filterArrayByQuery(source, query);
    if (options?.projection) {
      result = result.map(doc => applyProjection(doc, options.projection));
    }
    if (options?.sort) {
      result = sortArray(result, options.sort);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return result;
  }
}

/* ----------------------------- Public API ----------------------------- */

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const docs = await safeFind<BookDoc>(
    col.find({}, { projection: baseProjection }),
    {},
    { sort: { publishDate: -1 } }
  );
  return docs.map(sanitizeBook);
}

export async function getPublishedBooks(): Promise<Book[]> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const docs = await safeFind<BookDoc>(
    col.find({ status: 'published' }, { projection: baseProjection }),
    {},
    { sort: { publishDate: -1 } }
  );
  return docs.map(sanitizeBook);
}

export async function getFeaturedBook(): Promise<Book | null> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const docs = await safeFind<BookDoc>(
    col.find({ featured: true }, { projection: baseProjection }),
    {},
    { limit: 1 }
  );
  return docs.length ? sanitizeBook(docs[0]) : null;
}

export async function getUpcomingBooks(): Promise<Book[]> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const statuses: BookStatus[] = ['writing', 'coming-soon', 'draft']; // ✅ FIXED: Now BookStatus is imported
  const docs = await safeFind<BookDoc>(
    col.find({ status: { $in: statuses } }, { projection: baseProjection }),
    {},
    { sort: { publishDate: 1 } }
  );
  return docs.map(sanitizeBook);
}

export async function getBookById(id: string): Promise<Book | null> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const doc = await col.findOne({ id }, { projection: baseProjection });
  return doc ? sanitizeBook(doc) : null;
}