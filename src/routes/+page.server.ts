// src/routes/+page.server.ts - UPDATED for books/ subfolder
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { placeholderBooks } from '$lib/data/books';
import { env as publicEnv } from '$env/dynamic/public';

type BookDoc = {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null; // filename or path stored in Mongo (e.g., "Symbiogenesis.png" or "books/Symbiogenesis.png")
  genre?: 'faith' | 'epic' | 'sci-fi' | string | null;
  status?: 'draft' | 'upcoming' | 'published' | 'coming-soon' | string | null;
  publishDate?: string | Date | null;
  isbn?: string | null;
  format?: string | null;
  pages?: number | null;
  buyLinks?: Record<string, string | null>;
  featured?: boolean;
};

// ───────────────────────────── Firebase URL helpers ─────────────────────────────

/**
 * Normalize a Firebase Storage bucket value so that it is the canonical bucket ID:
 * <project-id>.appspot.com
 * (Dev data may contain *.firebasestorage.app; convert to appspot.com for the REST endpoint.)
 */
function normalizeBucketId(input?: string | null): string {
  const fallback = 'endless-fire-467204-n2.appspot.com';
  if (!input) return fallback;
  // strip protocol/host if someone pasted a URL by mistake
  const raw = input.replace(/^https?:\/\/[^/]+\/?/i, '').trim();
  if (raw.endsWith('.firebasestorage.app')) {
    return raw.replace(/\.firebasestorage\.app$/, '.appspot.com');
  }
  return raw;
}

const BUCKET_ID = normalizeBucketId(publicEnv.PUBLIC_FIREBASE_STORAGE_BUCKET);
const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_ID}/o`;

/** Builds a public download URL from an object path in the bucket. */
const buildImageUrl = (path: string) => `${BASE_URL}/${encodeURIComponent(path)}?alt=media`;

// Folder for covers in your bucket
const COVERS_FOLDER = 'books';

/** If a bare filename is provided, prefix with books/; if it's already a path, keep it. */
const ensureCoverPath = (nameOrPath: string) =>
  nameOrPath.includes('/') ? nameOrPath : `${COVERS_FOLDER}/${nameOrPath}`;

/** Normalize a BookDoc -> returned shape for the UI, with proper cover URL. */
function normalizeBook(book: BookDoc) {
  const coverPath = book.cover ? ensureCoverPath(book.cover) : null;

  return {
    id: book.id,
    title: book.title,
    description: book.description ?? '',
    cover: coverPath ? buildImageUrl(coverPath) : null, // filename -> books/<file> -> URL
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
      // Fallback to placeholders (leave as-is; they may already include URLs)
      console.warn('[+page.server] No books found, using placeholderBooks');
      const [phFeatured, ...phRest] = placeholderBooks;
      return { featured: phFeatured, upcoming: phRest };
    }

    // 4) Normalize + build image URLs (with books/ prefix)
    const featuredOut = featured ? normalizeBook(featured) : null;
    const upcoming = upcomingRaw.map(normalizeBook);

    return { featured: featuredOut, upcoming };
  } catch (error) {
    console.error('[+page.server] Database error:', error);
    const [phFeatured, ...phRest] = placeholderBooks;
    return { featured: phFeatured, upcoming: phRest };
  }
};
