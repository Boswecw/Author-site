// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getFeaturedBook, type BookDoc } from '$lib/server/books';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

/** Public, JSON-serializable shape for the client */
type PublicBook = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: string | null;
  status?: string | null;
  publishDate?: string | null; // ISO string
  isbn?: string | null;
  format?: string | null;
};

function toPublicBook(b: BookDoc): PublicBook {
  return {
    id: b.id, // if you store only _id: ObjectId in Mongo, adjust where you build BookDoc to include a string id
    title: b.title,
    description: b.description ?? null,
    cover: normalizeFirebaseUrl(b.cover),
    genre: b.genre ?? null,
    status: b.status ?? null,
    publishDate: b.publishDate
      ? (b.publishDate instanceof Date ? b.publishDate.toISOString() : String(b.publishDate))
      : null,
    isbn: b.isbn ?? null,
    format: b.format ?? null
  };
}

export const load: PageServerLoad = async () => {
  try {
    // fetch the featured book and a db handle in parallel
    const [featuredRaw, db] = await Promise.all([getFeaturedBook(), getDb()]);

    // keep payload tight with projection, and ensure no ObjectId leaks
    const upcomingRaw = await db
      .collection<BookDoc>('books')
      .find(
        { genre: 'faith', status: 'upcoming' },
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
            format: 1
          }
        }
      )
      .sort({ publishDate: 1 })
      .limit(2)
      .toArray();

    const featured = featuredRaw ? toPublicBook(featuredRaw) : null;
    const upcoming = upcomingRaw.map(toPublicBook);

    return { featured, upcoming };
  } catch (err) {
    console.error('Error in home loader:', err);
    // fail-soft so the page still renders
    return { featured: null, upcoming: [] as PublicBook[] };
  }
};
