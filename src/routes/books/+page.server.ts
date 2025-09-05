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
const ICONS_FOLDER  = 'icons';

// Ensure we include the folder when a bare filename is provided
const ensurePath = (nameOrPath: string, folder: string) =>
  nameOrPath.includes('/') ? nameOrPath : `${folder}/${nameOrPath}`;

// 🖼️ Map genre -> icon *paths* (adjust names if needed)
const GENRE_ICON_FILES: Record<'faith' | 'epic' | 'sci-fi', string | null> = {
  faith:  `${ICONS_FOLDER}/faith-icon.png`,
  epic:   `${ICONS_FOLDER}/epic-icon.png`,
  'sci-fi': `${ICONS_FOLDER}/sci-fi-icon.png`, // set to null if not uploaded yet
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

  const books = docs.map((b) => {
    const coverPath = b.cover ? ensurePath(b.cover, COVERS_FOLDER) : null;
    return {
      id: b.id,
      title: b.title,
      description: b.description ?? '',
      // filename or path -> full Firebase URL (with books/ prefix when needed)
      cover: coverPath ? buildImageUrl(coverPath) : null,
      genre: b.genre ?? 'faith',
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
      featured: b.featured ?? false
    };
  });

  const genreIcons = getGenreIcons();

  return { books, genreIcons };
};
