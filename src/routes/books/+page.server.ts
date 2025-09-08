// src/routes/books/+page.server.ts
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import type { BookDoc } from '$lib/types';

// Firebase URL builder (accepts full object path, e.g. "books/Heart.png")
const BUCKET_NAME = 'endless-fire-467204-n2.firebasestorage.app';
const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o`;
const buildImageUrl = (path: string) =>
  `${BASE_URL}/${encodeURIComponent(path)}?alt=media`;

// Folders in your bucket
const COVERS_FOLDER = 'books';
const ICONS_FOLDER = 'icons';

// Ensure we include the folder when a bare filename is provided
const ensurePath = (nameOrPath: string, folder: string) =>
  nameOrPath.includes('/') ? nameOrPath : `${folder}/${nameOrPath}`;

// Map genre -> icon paths
const GENRE_ICON_FILES: Record<'faith' | 'epic' | 'sci-fi', string | null> = {
  faith: `${ICONS_FOLDER}/faith-icon.png`,
  epic: `${ICONS_FOLDER}/epic-icon.png`,
  'sci-fi': `${ICONS_FOLDER}/sci-fi-icon.png`,
};

// Build icon URL map
function getGenreIcons() {
  return Object.fromEntries(
    (Object.keys(GENRE_ICON_FILES) as Array<'faith' | 'epic' | 'sci-fi'>).map((k) => {
      const p = GENRE_ICON_FILES[k];
      return [k, p ? buildImageUrl(p) : null];
    })
  ) as Record<'faith' | 'epic' | 'sci-fi', string | null>;
}

export const load: PageServerLoad = async () => {
  try {
    const db = await getDb();

    const docs = await db
      .collection<BookDoc>('books')
      .find(
        {},
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
      .sort({ status: 1, publishDate: 1, title: 1 })
      .toArray();

    console.log(`[books/page.server] Found ${docs.length} books in database`);

    const books = docs.map((b) => {
      const coverPath = b.cover ? ensurePath(b.cover, COVERS_FOLDER) : null;
      const coverUrl = coverPath ? buildImageUrl(coverPath) : null;
      
      // Debug logging for Hurricane Eve specifically
      if (b.id === 'hurricane-eve') {
        console.log(`[books/page.server] Hurricane Eve cover processing:`, {
          originalCover: b.cover,
          coverPath,
          coverUrl: coverUrl?.substring(0, 100) + '...'
        });
      }
      
      return {
        id: b.id,
        title: b.title,
        description: b.description ?? '',
        cover: coverUrl,
        genre: (b.genre ?? 'faith') as 'faith' | 'epic' | 'sci-fi',
        status: b.status ?? 'writing',
        publishDate: b.publishDate
          ? b.publishDate instanceof Date
            ? b.publishDate.toISOString()
            : String(b.publishDate)
          : null,
        isbn: b.isbn ?? null,
        format: b.format ?? 'EPUB',
        pages: b.pages ?? null,
        buyLinks: b.buyLinks ?? null,
        featured: (b as any).featured ?? false
      };
    });

    const genreIcons = getGenreIcons();

    return { books, genreIcons };
  } catch (error) {
    console.error('[books/page.server] Error loading books:', error);
    
    // Return empty data rather than crashing
    return {
      books: [],
      genreIcons: {
        faith: null,
        epic: null,
        'sci-fi': null
      }
    };
  }
};