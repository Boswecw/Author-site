// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { toFirebaseDownloadIfNeeded } from '$lib/utils/urls';

type BookDoc = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
  status?: string | null;
  publishDate?: string | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: Record<string, string | null>;
  featured?: boolean;
};

export const load: PageServerLoad = async () => {
  const db = await getDb();
  const coll = db.collection<BookDoc>('books');

  // 1) Try to get the explicit featured book
  const featuredDoc = await coll.findOne(
    { featured: true },
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
        buyLinks: 1,
        featured: 1
      }
    }
  );

  // 2) Also fetch a list of non-featured books (e.g., for cards)
  const upcoming = await coll
    .find(
      { featured: { $ne: true } },
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
          buyLinks: 1,
          featured: 1
        }
      }
    )
    .sort({ publishDate: -1 }) // newest first if present
    .limit(12)
    .toArray();

  // 3) If no featured is set, fall back to the most recent from upcoming
  const effectiveFeatured = featuredDoc ?? upcoming[0] ?? null;

  // Normalize covers to canonical download URLs
  const featured = effectiveFeatured
    ? { ...effectiveFeatured, cover: toFirebaseDownloadIfNeeded(effectiveFeatured.cover) }
    : null;

  const upcomingNorm = upcoming.map(b => ({
    ...b,
    cover: toFirebaseDownloadIfNeeded(b.cover)
  }));

  return { featured, upcoming: upcomingNorm };
};
