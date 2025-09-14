// src/lib/utils/firebase.ts - Firebase URL builders
import { PUBLIC_FIREBASE_STORAGE_BUCKET } from '$env/static/public';

const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${PUBLIC_FIREBASE_STORAGE_BUCKET}/o`;

/**
 * Build a Firebase public URL for any file
 * @param nameOrPath - Filename or path (e.g., "cover.png" or "books/cover.png")
 * @param folder - Optional folder prefix (only if nameOrPath doesn't include path)
 */
export function buildImageUrl(nameOrPath: string, folder?: string): string {
  if (!nameOrPath?.trim()) {
    console.warn('[buildImageUrl] Empty nameOrPath provided');
    return '';
  }
  
  // If it's already a full URL, return as-is
  if (/^https?:\/\//i.test(nameOrPath)) {
    return nameOrPath;
  }
  
  // Build the path
  let path = nameOrPath;
  if (folder && !nameOrPath.includes('/')) {
    path = `${folder}/${nameOrPath}`;
  }
  
  // URL encode the path
  const encodedPath = encodeURIComponent(path);
  return `${BASE_URL}/${encodedPath}?alt=media`;
}

/**
 * Build a Firebase URL specifically for book covers (always in books/ folder)
 */
export function buildBookCoverUrl(nameOrPath: string): string {
  return buildImageUrl(nameOrPath, 'books');
}

/**
 * Build a Firebase URL specifically for icons (always in icons/ folder)
 */
export function buildIconUrl(nameOrPath: string): string {
  return buildImageUrl(nameOrPath, 'icons');
}

/**
 * Build a Firebase URL for blog hero images (posts/ folder by default)
 */
export function buildHeroImageUrl(nameOrPath: string): string {
  if (!nameOrPath?.trim()) return '';
  
  // If already a full URL, return as-is
  if (/^https?:\/\//i.test(nameOrPath)) {
    return nameOrPath;
  }
  
  // If it includes a path, use as-is, otherwise default to posts/ folder
  if (nameOrPath.includes('/')) {
    return buildImageUrl(nameOrPath);
  } else {
    return buildImageUrl(nameOrPath, 'posts');
  }
}
