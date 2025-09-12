// src/lib/server/books.ts
import { getDb } from '$lib/server/db';
import type { Book, BookDoc, BookStatus } from '$lib/types';

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

function filterArrayByQuery<T extends Record<string, any>>(arr: T[], query?: any): T[] {
  if (!query || Object.keys(query).length === 0) return arr;

  let out = arr;

  // handle very small subset we actually use in this file
  // { status: { $in: [...] } }
  if (query.status?.$in && Array.isArray(query.status.$in)) {
    const set = new Set(query.status.$in);
    out = out.filter((d) => set.has(d.status));
  }

  // { id: 'xyz' }
  if (query.id && typeof query.id === 'string') {
    out = out.filter((d) => d.id === query.id);
  }

  // { $or: [{ featured: true }, { status: 'featured' }] }
  if (query.$or && Array.isArray(query.$or)) {
    out = out.filter((d) =>
      query.$or.some((cond: any) => {
        // featured: true
        if (typeof cond?.featured === 'boolean') return !!d.featured === cond.featured;
        // status: 'featured'
        if (typeof cond?.status === 'string') return d.status === cond.status;
        return false;
      })
    );
  }

  // publishDate filters aren’t used directly here (we sort by it), but add minimal support if needed:
  if (query.publishDate?.$gte) {
    const gte = new Date(query.publishDate.$gte).getTime();
    out = out.filter((d) => new Date(d.publishDate ?? 0).getTime() >= gte);
  }

  return out;
}

async function safeFind<T extends Record<string, any>>(
  collection: any,
  query?: any,
  options?: { projection?: Record<string, 0 | 1> },
  sortSpec?: Record<string, 1 | -1>,
  limit?: number
): Promise<T[]> {
  const res = collection.find(query ?? {}, options ?? {});

  // Case 1: Real Mongo cursor (or cursor-like with full methods)
  if (res && typeof res.toArray === 'function') {
    let cursor: any = res;

    const hasSort = typeof cursor.sort === 'function';
    const hasLimit = typeof cursor.limit === 'function';

    if (sortSpec && hasSort) cursor = cursor.sort(sortSpec);
    if (Number.isFinite(limit) && hasLimit) cursor = cursor.limit(limit as number);

    try {
      // Try the fast path first (DB-side ops)
      const out = (await cursor.toArray()) as T[];
      if (hasSort && hasLimit) return out; // already sorted/limited by DB

      // Fallback if cursor lacked sort/limit
      let arr = out;
      arr = sortArray(arr, sortSpec);
      if (Number.isFinite(limit)) arr = arr.slice(0, limit as number);
      if (options?.projection) arr = arr.map((d) => applyProjection(d, options.projection));
      return arr;
    } catch {
      // Extra safety: if something odd happens, fall back to array pipeline
      let arr = (await res.toArray()) as T[];
      arr = filterArrayByQuery(arr, query);
      if (options?.projection) arr = arr.map((d) => applyProjection(d, options.projection));
      arr = sortArray(arr, sortSpec);
      if (Number.isFinite(limit)) arr = arr.slice(0, limit as number);
      return arr;
    }
  }

  // Case 2: Pure array mock
  let arr: T[] = Array.isArray(res) ? (res as T[]) : [];
  arr = filterArrayByQuery(arr, query);
  if (options?.projection) arr = arr.map((d) => applyProjection(d, options.projection));
  arr = sortArray(arr, sortSpec);
  if (Number.isFinite(limit)) arr = arr.slice(0, limit as number);
  return arr;
}


async function safeFindOne<T extends Record<string, any>>(
  collection: any,
  query?: any,
  options?: { projection?: Record<string, 0 | 1> }
): Promise<T | null> {
  if (typeof collection.findOne === 'function') {
    // real driver (or mock that supports findOne)
    const doc = await collection.findOne(query ?? {}, options ?? {});
    return doc ?? null;
  }
  // mock path: use safeFind and pick first
  const arr = await safeFind<T>(collection, query, options, undefined, 1);
  return arr[0] ?? null;
}

/* ------------------------------- queries -------------------------------- */

export async function getBookById(id: string): Promise<Book | null> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const doc = await safeFindOne<BookDoc>(col, { id }, { projection: baseProjection });
  return doc ? sanitizeBook(doc) : null;
}

export async function getFeaturedBook(): Promise<Book | null> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const doc = await safeFindOne<BookDoc>(
    col,
    { $or: [{ featured: true }, { status: 'featured' }] },
    { projection: baseProjection }
  );
  return doc ? sanitizeBook(doc) : null;
}

export async function getUpcomingBooks(limit = 6): Promise<Book[]> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const statuses: BookStatus[] = ['writing', 'coming-soon', 'draft'];
  const docs = await safeFind<BookDoc>(
    col,
    { status: { $in: statuses } },
    {
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
    },
    { publishDate: 1, title: 1 },
    limit
  );
  return docs.map(sanitizeBook).filter((b) => b.cover);
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDb();
  const col = db.collection<BookDoc>('books');
  const docs = await safeFind<BookDoc>(
    col,
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
    },
    { status: 1, publishDate: 1, title: 1 }
  );
  return docs.map(sanitizeBook);
}
