// src/lib/server/books.ts - Fix function signature and type issues

import { getDb } from '$lib/server/db';
import type { BookDoc, Book } from '$lib/types';
import type { WithId } from 'mongodb';

// ✅ FIXED: Make the generic constraint more specific
export async function getBooks<T extends Record<string, any> = BookDoc>(
  filter: Record<string, any> = {}
): Promise<T[]> {
  try {
    const db = await getDb();
    const books = await db.collection<T>('books')
      .find(filter)
      .sort({ publishDate: -1 })
      .toArray();
    
    // ✅ FIXED: Cast the result to satisfy TypeScript
    const result = books as T[];
    return result;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export async function getFeaturedBook(): Promise<Book | null> {
  try {
    const books = await getBooks<WithId<BookDoc>>({ featured: true, status: 'published' });
    
    if (books.length === 0) {
      console.log('[books] No featured book found, falling back to latest published');
      const latestBooks = await getBooks<WithId<BookDoc>>({ status: 'published' });
      if (latestBooks.length === 0) return null;
      return sanitizeBook(latestBooks[0]);
    }
    
    return sanitizeBook(books[0]);
  } catch (error) {
    console.error('Error getting featured book:', error);
    return null;
  }
}

// ✅ FIXED: Add optional limit parameter to match usage in +layout.server.ts
export async function getUpcomingBooks(limit?: number): Promise<Book[]> {
  try {
    const filter = { status: { $in: ['upcoming', 'writing', 'coming-soon'] } };
    const books = await getBooks<WithId<BookDoc>>(filter);
    
    const sanitized = books.map(sanitizeBook);
    
    // Apply limit if provided
    return limit ? sanitized.slice(0, limit) : sanitized;
  } catch (error) {
    console.error('Error getting upcoming books:', error);
    return [];
  }
}

export async function getPublishedBooks(): Promise<Book[]> {
  try {
    const books = await getBooks<WithId<BookDoc>>({ status: 'published' });
    return books.map(sanitizeBook);
  } catch (error) {
    console.error('Error getting published books:', error);
    return [];
  }
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  try {
    const db = await getDb();
    const book = await db.collection<BookDoc>('books').findOne({ id: slug });
    
    if (!book) return null;
    return sanitizeBook(book);
  } catch (error) {
    console.error('Error getting book by slug:', error);
    return null;
  }
}

// ✅ FIXED: Ensure sanitizeBook always returns proper Book type with featured property
// src/lib/server/books.ts
function sanitizeBook(doc: any): Book {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    cover: doc.cover ?? null,
    genre: doc.genre,
    status: doc.status,
    publishDate: doc.publishDate ? String(doc.publishDate) : null,
    isbn: doc.isbn,
    format: doc.format,
    pages: doc.pages,
    buyLinks: doc.buyLinks ?? {},
    featured: Boolean(doc.featured) // <-- add this
  };
}
