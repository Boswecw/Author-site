// src/routes/books/[slug]/+page.server.ts - UPDATED to use central Firebase utilities
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/types';
import { buildBookCoverUrl } from '$lib/utils/firebase'; // ✅ Use central utility

/** ✅ SIMPLIFIED: Use central utility for book cover URLs */
function normalizeBook(book: BookDoc) {
  return {
    id: book.id,
    title: book.title,
    description: book.description ?? '',
    cover: book.cover ? buildBookCoverUrl(book.cover) : null, // ✅ Automatically includes books/ folder
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
    buyLinks: book.buyLinks ?? {},
    featured: !!book.featured
  };
}

export const load: PageServerLoad = async ({ params }) => {
  try {
    const db = await getDb();
    const coll = db.collection<BookDoc>('books');

    console.log(`[books/slug] Looking for book: ${params.slug}`);

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

    const book = await coll.findOne({ id: params.slug }, { projection });

    if (!book) {
      console.log(`[books/slug] Book not found in database: ${params.slug}`);
      
      // ✅ Placeholder books - store as filenames, normalize with central utility
      const placeholderBooks: Record<string, any> = {
        'faith-in-a-firestorm': {
          id: 'faith-in-a-firestorm',
          title: 'Faith in a Firestorm',
          description: 'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
          cover: 'Faith_in_a_FireStorm.png', // Will be normalized to include books/ folder
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-09-01',
          isbn: null,
          format: 'EPUB',
          pages: 320,
          buyLinks: {
            amazon: 'https://amazon.com/dp/B0CQJ2XYZ1'
          },
          featured: false
        },
        'conviction-in-a-flood': {
          id: 'conviction-in-a-flood',
          title: 'Conviction in a Flood',
          description: 'When disaster strikes, faith and determination are the only things standing between hope and despair.',
          cover: 'Conviction_in_a_Flood.png', // Will be normalized to include books/ folder
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-12-01',
          isbn: null,
          format: 'EPUB',
          pages: 300,
          buyLinks: {},
          featured: false
        },
        'hurricane-eve': {
          id: 'hurricane-eve',
          title: 'Hurricane Eve',
          description: 'A gripping tale of survival and faith during one of nature\'s most powerful storms.',
          cover: 'Hurricane_Eve.png', // Will be normalized to include books/ folder (corrected spelling)
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-11-01',
          isbn: null,
          format: 'EPUB',
          pages: null,
          buyLinks: {},
          featured: false
        },
        'symbiogenesis': {
          id: 'symbiogenesis',
          title: 'Symbiogenesis',
          description: 'A sci-fi exploration of biological cooperation and evolution on an alien world.',
          cover: 'Symbiogenesis.png', // Will be normalized to include books/ folder
          genre: 'sci-fi',
          status: 'upcoming',
          publishDate: '2026-03-01',
          isbn: null,
          format: 'EPUB',
          pages: null,
          buyLinks: {},
          featured: false
        }
      };

      const placeholderBook = placeholderBooks[params.slug];
      
      if (!placeholderBook) {
        console.log(`[books/slug] No placeholder found for: ${params.slug}`);
        throw error(404, `Book "${params.slug}" not found`);
      }

      // ✅ SIMPLIFIED: Normalize using central utility
      const normalizedPlaceholder = normalizeBook(placeholderBook);
      console.log(`[books/slug] Using placeholder for: ${params.slug}`);
      
      return { book: normalizedPlaceholder };
    }

    // ✅ SIMPLIFIED: Process database book using central utility
    const processedBook = normalizeBook(book);

    console.log(`[books/slug] Found book in database: ${book.title}`);
    
    // Debug logging for Hurricane Eve specifically
    if (book.id === 'hurricane-eve') {
      console.log(`[books/slug] Hurricane Eve cover processing:`, {
        originalCover: book.cover,
        processedCover: processedBook.cover?.substring(0, 100) + '...'
      });
    }

    return { book: processedBook };
    
  } catch (err) {
    console.error('[books/slug] Load error:', params.slug, err);
    
    // Re-throw SvelteKit errors (like 404)
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Convert other errors to 500
    throw error(500, 'Failed to load book details');
  }
};
