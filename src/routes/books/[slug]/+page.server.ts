// src/routes/books/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/types';

// Firebase URL builder - consistent with other server files
const BUCKET_NAME = 'endless-fire-467204-n2.firebasestorage.app';
const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o`;
const buildImageUrl = (path: string) =>
  `${BASE_URL}/${encodeURIComponent(path)}?alt=media`;

// Folders in your bucket
const COVERS_FOLDER = 'books';

// Ensure we include the folder when a bare filename is provided
const ensurePath = (nameOrPath: string, folder: string) =>
  nameOrPath.includes('/') ? nameOrPath : `${folder}/${nameOrPath}`;

export const load: PageServerLoad = async ({ params }) => {
  try {
    const db = await getDb();
    const coll = db.collection<BookDoc>('books');

    console.log(`[books/slug] Looking for book: ${params.slug}`);

    const book = await coll.findOne(
      { id: params.slug },
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
          buyLinks: 1, // Fixed: use buyLinks instead of links
          featured: 1   // Added: include featured field
        }
      }
    );

    if (!book) {
      console.log(`[books/slug] Book not found in database: ${params.slug}`);
      
      // Enhanced placeholder books with proper Firebase URLs
      const placeholderBooks: Record<string, any> = {
        'faith-in-a-firestorm': {
          id: 'faith-in-a-firestorm',
          title: 'Faith in a Firestorm',
          description: 'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
          cover: buildImageUrl('books/Faith_in_a_FireStorm.png'), // Build proper URL
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-09-01',
          isbn: null,
          format: 'EPUB',
          pages: 320,
          buyLinks: {
            amazon: 'https://amazon.com/dp/B0CQJ2XYZ1'
          }
        },
        'conviction-in-a-flood': {
          id: 'conviction-in-a-flood',
          title: 'Conviction in a Flood',
          description: 'When disaster strikes, faith and determination are the only things standing between hope and despair.',
          cover: buildImageUrl('books/Conviction_in_a_Flood.png'), // Build proper URL
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-12-01',
          isbn: null,
          format: 'EPUB',
          pages: 300,
          buyLinks: {}
        },
        'hurricane-eve': {
          id: 'hurricane-eve',
          title: 'Hurricane Eve',
          description: 'A gripping tale of survival and faith during one of nature\'s most powerful storms.',
          cover: buildImageUrl('books/Hurricane_Eve.png'), // Correct spelling with proper URL
          genre: 'faith',
          status: 'upcoming',
          publishDate: '2025-11-01',
          isbn: null,
          format: 'EPUB',
          pages: null,
          buyLinks: {}
        }
      };

      const placeholderBook = placeholderBooks[params.slug];
      
      if (!placeholderBook) {
        console.log(`[books/slug] No placeholder found for: ${params.slug}`);
        throw error(404, `Book "${params.slug}" not found`);
      }

      console.log(`[books/slug] Using placeholder for: ${params.slug}`);
      return { book: placeholderBook };
    }

    // ✅ FIXED: Check if cover is already a complete URL to prevent double-encoding
    const isAlreadyUrl = book.cover?.startsWith('http');
    const coverPath = book.cover && !isAlreadyUrl ? ensurePath(book.cover, COVERS_FOLDER) : null;
    
    const processedBook = {
      id: book.id,
      title: book.title,
      description: book.description ?? '',
      // ✅ FIXED: Use existing URL if already complete, otherwise build new one
      cover: isAlreadyUrl ? book.cover : (coverPath ? buildImageUrl(coverPath) : null),
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
      featured: (book as any).featured ?? false // Handle missing featured field
    };

    console.log(`[books/slug] Found book in database: ${book.title}`);
    if (book.id === 'hurricane-eve') {
      console.log(`[books/slug] Hurricane Eve cover: ${book.cover} -> ${processedBook.cover}`);
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