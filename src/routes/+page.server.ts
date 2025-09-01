// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { getFeaturedBook, type BookDoc } from '$lib/server/books';

// Always return a string if input exists; otherwise undefined
function normalizeFirebaseUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  // Fix wrong bucket segment if present; if not present, returns the same string
  return url.replace(
    'endless-fire-467204-n2.firebasestorage.app',
    'endless-fire-467204-n2.appspot.com'
  );
}

export const load: PageServerLoad = async () => {
  try {
    const [featuredRaw, db] = await Promise.all([getFeaturedBook(), getDb()]);

    // Fetch FULL docs to keep types simple
    const upcomingRaw = await db
      .collection<BookDoc>('books')
      .find({ genre: 'faith', status: 'upcoming' })
      .sort({ publishDate: 1 })
      .limit(2)
      .toArray();

    // Normalize covers but NEVER return undefined for a field typed as string
    const featured =
      featuredRaw
        ? { ...featuredRaw, cover: normalizeFirebaseUrl(featuredRaw.cover) || featuredRaw.cover }
        : null;

    const upcoming = upcomingRaw.map((b) => ({
      ...b,
      cover: normalizeFirebaseUrl(b.cover) || b.cover
    }));

    return { featured, upcoming };
  } catch (err) {
    console.error('Error in home loader:', err);
    return { featured: null, upcoming: [] as BookDoc[] };
  }
};
