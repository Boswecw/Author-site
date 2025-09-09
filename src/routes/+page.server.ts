// src/routes/+page.server.ts - FIXED: Normalize placeholder books too
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { placeholderBooks } from '$lib/data/books';
import { buildBookCoverUrl } from '$lib/utils/firebase'; // ✅ Use central utility

type BookDoc = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null; // filename or path stored in Mongo
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
  status?: 'draft' | 'upcoming' | 'published' | 'coming-soon' | string | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: Record<string, string | null>;
  featured?: boolean;
};

/** ✅ SIMPLIFIED: Use central utility - automatically handles books/ folder */
function normalizeBook(book: BookDoc) {
  return {
    id: book.id,
    title: book.title,
    description: book.description ?? '',
    cover: book.cover ? buildBookCoverUrl(book.cover) : null, // ✅ Always includes books/ folder
    genre: book.genre ?? 'faith',
    status: book.status ?? 'draft',
    publishDate: book.publishDate
      ? book.publishDate instanceof Date
        ? book.publishDate.toISOString()
        : String(book.publishDate)
      : null,
    isbn: book.isbn ?? null,
    format: book.format ?? 'EPUB',
    pages: book.pages ?? null,
    buyLinks: book.buyLinks ?? null,
    featured: !!book.featured
  };
}

export const load: PageServerLoad = async () => {
  const db = await getDb();
  const coll = db.collection<BookDoc>('books');

  const projection = {
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
  } as const;

  const sortByDateDesc = (a: BookDoc, b: BookDoc) => {
    const da =
      a.publishDate instanceof Date
        ? a.publishDate.getTime()
        : a.publishDate
        ? Date.parse(a.publishDate)
        : -Infinity;
    const dbb =
      b.publishDate instanceof Date
        ? b.publishDate.getTime()
        : b.publishDate
        ? Date.parse(b.publishDate)
        : -Infinity;
    return dbb - da;
  };

  try {
    console.log('[+page.server] Loading homepage data...');

    // 1) Featured (if explicitly set)
    const featuredDoc =
      (await coll.findOne({ featured: true }, { projection })) ?? null;

    // 2) Non-draft, non-featured for the "upcoming" rail
    const nonDraftCursor = coll.find(
      {
        featured: { $ne: true },
        $or: [{ status: { $exists: false } }, { status: { $ne: 'draft' } }]
      },
      { projection }
    );

    const nonDraft = await nonDraftCursor.toArray();
    nonDraft.sort(sortByDateDesc);

    // 3) Pick final featured + upcoming
    const featured = featuredDoc ?? nonDraft[0] ?? null;
    const upcomingRaw = (featured
      ? nonDraft.filter((b) => b.id !== featured.id)
      : nonDraft
    ).slice(0, 12);

    if (!featured && upcomingRaw.length === 0) {
      // ✅ FIXED: Normalize placeholder books too so they get proper Firebase URLs
      console.warn('[+page.server] No books found, using placeholderBooks');
      const [phFeatured, ...phRest] = placeholderBooks;
      
      return { 
        featured: phFeatured ? normalizeBook(phFeatured as BookDoc) : null, // ✅ Normalize placeholders
        upcoming: phRest.map(book => normalizeBook(book as BookDoc)) // ✅ Normalize placeholders
      };
    }

    // 4) ✅ SIMPLIFIED: Normalize using central utility (includes books/ prefix automatically)
    const featuredOut = featured ? normalizeBook(featured) : null;
    const upcoming = upcomingRaw.map(normalizeBook);

    // Debug logging
    console.log('[+page.server] Featured:', featuredOut ? featuredOut.title : 'None');
    console.log('[+page.server] Upcoming:', upcoming.length);
    
    // ✅ FIXED: Add more detailed debug logging
    if (featuredOut && featuredOut.cover) {
      console.log('[+page.server] Featured cover URL:', featuredOut.cover.substring(0, 100) + '...');
    }
    if (upcoming.length > 0 && upcoming[0].cover) {
      console.log('[+page.server] First upcoming cover URL:', upcoming[0].cover.substring(0, 100) + '...');
    }

    return { featured: featuredOut, upcoming };
  } catch (error) {
    console.error('[+page.server] Database error:', error);
    
    // ✅ FIXED: Normalize placeholder books in catch block too
    const [phFeatured, ...phRest] = placeholderBooks;
    return { 
      featured: phFeatured ? normalizeBook(phFeatured as BookDoc) : null, // ✅ Normalize placeholders  
      upcoming: phRest.map(book => normalizeBook(book as BookDoc)) // ✅ Normalize placeholders
    };
  }
};