// src/routes/+page.server.ts - FIXED
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
// Covers now store Firebase Storage paths

type BookDoc = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null; // Firebase Storage path
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

  try {
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

    if (!featuredDoc && upcoming.length === 0) {
      console.warn('[+page.server] No books found, returning placeholder data');

      const featured = {
        id: 'faith-in-a-firestorm',
        title: 'Faith in a Firestorm',
        description:
          'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
        cover: 'books/Faith_in_a_FireStorm.png',
        genre: 'faith',
        status: 'upcoming'
      } as const;

      const upcomingSample = [
        {
          id: 'conviction-in-a-flood',
          title: 'Conviction in a Flood',
          cover: 'books/Conviction_in_a_Flood Cover.png',
          genre: 'faith',
          status: 'upcoming'
        },
        {
          id: 'hurricane-eve',
          title: 'Hurricane Eve',
          cover: 'books/Hurricane_Eve Cover.png',
          genre: 'epic',
          status: 'upcoming'
        }
      ];

      return { featured, upcoming: upcomingSample };
    }

    // 3) If no featured is set, fall back to the most recent from upcoming
    const effectiveFeatured = featuredDoc ?? upcoming[0] ?? null;

    const featured = effectiveFeatured ?? null;

    console.log('[+page.server] Featured book:', featured?.title, 'cover:', featured?.cover);
    console.log('[+page.server] Upcoming books:', upcoming.length);

    return {
      featured,
      upcoming
    };

  } catch (error) {
    console.error('[+page.server] Database error:', error);
    return { 
      featured: null, 
      upcoming: [] 
    };
  }
};