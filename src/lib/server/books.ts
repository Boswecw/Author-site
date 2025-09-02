// src/lib/server/books.ts
import { getDb } from '$lib/server/db';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

export type BookDoc = {
  id: string;                 // app-wide ID, e.g. "faith-firestorm-epub"
  title: string;
  description?: string | null;
  cover?: string | null;      // Firebase Storage URL
  genre?: 'faith' | 'epic' | string | null;
  status?: 'featured' | 'published' | 'upcoming' | string | null;
  publishDate?: Date | string | null;
  isbn?: string | null;
  format?: string | null;     // EPUB, hardcover, etc.
  buyLinks?: {
    amazon?: string;
    barnes?: string;
    other?: string;
  };
  pages?: number;
  featured?: boolean;         // <- extra field from your JSON
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
  format: 1,
  buyLinks: 1,
  pages: 1,
  featured: 1
} as const;

/**
 * Fetch the featured book. Supports both legacy {status:"featured"} and new {featured:true}.
 */
export async function getFeaturedBook(): Promise<BookDoc | null> {
  try {
    const db = await getDb();
    const doc = await db.collection<BookDoc>('books').findOne(
      { $or: [{ status: 'featured' }, { featured: true }] },
      { projection: { _id: 0, ...fields } }
    );
    if (doc) {
      doc.cover = normalizeFirebaseUrl(doc.cover);
    }
    return doc ?? null;
  } catch (e) {
    console.error('[getFeaturedBook] failed:', e);
    return null;
  }
}

/**
 * Fetch a single book by its app-wide id.
 */
export async function getBookById(id: string): Promise<BookDoc | null> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<BookDoc>('books')
      .findOne({ id }, { projection: { _id: 0, ...fields } });
    if (doc) {
      doc.cover = normalizeFirebaseUrl(doc.cover);
    }
    return doc ?? null;
  } catch (e) {
    console.error('[getBookById] failed:', e);
    return null;
  }
}

/**
 * Fetch all books, sorted by publishDate (newest first, then title).
 */
export async function getAllBooks(): Promise<BookDoc[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection<BookDoc>('books')
      .find({}, { projection: { _id: 0, ...fields } })
      .sort({ publishDate: -1, title: 1 })
      .toArray();

    return docs.map((b) => ({
      ...b,
      cover: normalizeFirebaseUrl(b.cover)
    }));
  } catch (e) {
    console.error('[getAllBooks] failed:', e);
    return [];
  }
}
