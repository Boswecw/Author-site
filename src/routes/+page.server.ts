// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getFeaturedBook, type BookDoc } from '$lib/server/books';

/**
 * Normalize older firebase domain variants to the standard appspot host.
 * Return null if the input is nullish; never return undefined to keep shapes stable.
 */
function normalizeFirebaseUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace('endless-fire-467204-n2.firebasestorage.app', 'endless-fire-467204-n2.appspot.com');
}

/**
 * Public shape that is guaranteed to be JSON-serializable for SvelteKit.
 * (Dates -> ISO strings; no ObjectId; stable nulls, not undefined)
 */
type PublicBook = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: string | null;
  status?: string | null;
  publishDate?: string | null; // ISO string if present
  isbn?: string | null;
  format?: string | null;
};

/** Convert a BookDoc (from Mongo) into a serializable PublicBook */
function toPublicBook(b: BookDoc): PublicBook {
  return {
    id: b.id, // assuming your code writes a string id; if not, map _id.toString() where you create BookDoc
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
    const [featuredRaw, db] = await Promise.all([getFeaturedBook(), getDb()]);

    // Query only the fields you actually render (keeps payload small and serializable)
    const upcomingRaw = await db
      .collection<BookDoc>('books')
      .find(
        { genre: 'faith', status: 'upcoming' },
        {
          projection: {
            _id: 0,          // ensure no ObjectId leaks into the payload
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
    // Return a fully-typed, serializable fallback
    return { featured: null, upcoming: [] as PublicBook[] };
  }
};
