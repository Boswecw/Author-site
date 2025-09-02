import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getFeaturedBook, type BookDoc } from '$lib/server/books';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

type PublicBook = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: string | null;
  status?: string | null;
  publishDate?: string | null;
  isbn?: string | null;
  format?: string | null;
  buyLinks?: { amazon?: string; barnes?: string; other?: string } | null;
  pages?: number | null;
};

function toPublicBook(b: BookDoc): PublicBook {
  return {
    id: b.id,
    title: b.title,
    description: b.description ?? null,
    cover: normalizeFirebaseUrl(b.cover),
    genre: b.genre ?? null,
    status: b.status ?? null,
    publishDate: b.publishDate
      ? (b.publishDate instanceof Date ? b.publishDate.toISOString() : String(b.publishDate))
      : null,
    isbn: b.isbn ?? null,
    format: b.format ?? null,
    buyLinks: b.buyLinks ?? null,
    pages: typeof b.pages === 'number' ? b.pages : null
  };
}

export const load: PageServerLoad = async () => {
  const [featuredRaw, db] = await Promise.all([getFeaturedBook(), getDb()]);

  const upcomingRaw = await db
    .collection<BookDoc>('books')
    .find(
      { status: 'upcoming' },
      {
        projection: {
          _id: 0,
          id: 1, title: 1, description: 1, cover: 1, genre: 1,
          status: 1, publishDate: 1, isbn: 1, format: 1, buyLinks: 1, pages: 1
        }
      }
    )
    .sort({ publishDate: 1 })
    .limit(3)
    .toArray();

  return {
    featured: featuredRaw ? toPublicBook(featuredRaw) : null,
    upcoming: upcomingRaw.map(toPublicBook)
  };
};
