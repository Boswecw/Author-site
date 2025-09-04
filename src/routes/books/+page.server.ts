// src/routes/books/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/types'; // Import from types instead of books
import { normalizeFirebaseUrl } from '$lib/utils/urls';

export const load: PageServerLoad = async () => {
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
          isbn: 1,
          format: 1,
          pages: 1,
          buyLinks: 1
        }
      }
    )
    .sort({ status: 1, publishDate: 1, title: 1 })
    .toArray();

  const books = docs.map((book) => ({
    id: book.id,
    title: book.title,
    description: book.description ?? '',
    cover: normalizeFirebaseUrl(book.cover) ?? null,
    genre: book.genre ?? 'faith',
    status: book.status ?? 'writing',
    publishDate: book.publishDate
      ? book.publishDate instanceof Date
        ? book.publishDate.toISOString()
        : String(book.publishDate)
      : null,
    isbn: book.isbn ?? null,
    format: book.format ?? 'EPUB',
    pages: book.pages ?? null,
    buyLinks: book.buyLinks ?? null
  }));

  return { books };
};