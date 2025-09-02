import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/server/books';

// normalize older firebase domain variants to the standard appspot host
function normalizeFirebaseUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(
    'endless-fire-467204-n2.firebasestorage.app',
    'endless-fire-467204-n2.appspot.com'
  );
}

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
    .toArray();

  const books = docs.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description ?? null,
    cover: normalizeFirebaseUrl((b as any).cover),
    genre: b.genre ?? null,
    status: b.status ?? null,
    publishDate: b.publishDate
      ? b.publishDate instanceof Date
        ? b.publishDate.toISOString()
        : String(b.publishDate)
      : null,
    isbn: b.isbn ?? null,
    format: (b as any).format ?? null,
    pages: (b as any).pages ?? null,
    buyLinks: (b as any).buyLinks ?? null
  }));

  return { books };
};

