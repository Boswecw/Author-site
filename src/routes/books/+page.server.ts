// src/routes/books/+page.server.ts - UPDATED to use central Firebase utilities
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/types';
import { buildBookCoverUrl, buildIconUrl } from '$lib/utils/firebase'; // ✅ Use central utilities

// ✅ SIMPLIFIED: Just filenames, central utilities will add proper folder paths
const GENRE_ICON_FILES: Record<'faith' | 'epic' | 'sci-fi', string> = {
  faith: 'faith-icon.png',    // buildIconUrl will add icons/
  epic: 'epic-icon.png',          // buildIconUrl will add icons/
  'sci-fi': 'sci-fi-icon.png',     // buildIconUrl will add icons/ (update filename to match your actual file)
};

/** ✅ SIMPLIFIED: Build icon URLs using central utility */
function getGenreIcons() {
  return Object.fromEntries(
    (Object.keys(GENRE_ICON_FILES) as Array<'faith' | 'epic' | 'sci-fi'>).map((genre) => {
      const filename = GENRE_ICON_FILES[genre];
      return [genre, buildIconUrl(filename)]; // ✅ Automatically includes icons/ folder
    })
  ) as Record<'faith' | 'epic' | 'sci-fi', string>;
}

/** ✅ SIMPLIFIED: Normalize book using central utility */
function normalizeBook(book: BookDoc) {
  return {
    id: book.id,
    title: book.title,
    description: book.description ?? '',
    cover: book.cover ? buildBookCoverUrl(book.cover) : null, // ✅ Automatically includes books/ folder
    genre: (book.genre ?? 'faith') as 'faith' | 'epic' | 'sci-fi',
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
  try {
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

    // Get all books sorted by status, date, and title
    const docs = await coll
      .find({}, { projection })
      .sort({ status: 1, publishDate: 1, title: 1 })
      .toArray();

    console.log(`[books/page.server] Found ${docs.length} books in database`);

    // ✅ SIMPLIFIED: Normalize books using central utility (automatically includes books/ folder)
    const books = docs.map((book) => {
      const normalized = normalizeBook(book);
      
      // Debug logging for Hurricane Eve specifically  
      if (book.id === 'hurricane-eve') {
        console.log(`[books/page.server] Hurricane Eve cover processing:`, {
          originalCover: book.cover,
          normalizedCover: normalized.cover?.substring(0, 100) + '...'
        });
      }
      
      return normalized;
    });

    // ✅ SIMPLIFIED: Build genre icons using central utility (automatically includes icons/ folder)
    const genreIcons = getGenreIcons();

    console.log(`[books/page.server] Generated URLs for ${books.length} books`);
    console.log(`[books/page.server] Genre icons:`, Object.keys(genreIcons));

    return { 
      books, 
      genreIcons 
    };

  } catch (error) {
    console.error('[books/page.server] Error loading books:', error);
    
    // ✅ Return fallback icons using central utility
    return {
      books: [],
      genreIcons: {
        faith: buildIconUrl('ChristianFiction.png'),
        epic: buildIconUrl('EpicFantasy.png'),
        'sci-fi': buildIconUrl('sci-fi-icon.png')
      }
    };
  }
};