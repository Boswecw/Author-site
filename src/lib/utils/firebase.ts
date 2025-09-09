// src/lib/utils/firebase.ts - FIXED VERSION
export const BUCKET_NAME = 'endless-fire-467204-n2.firebasestorage.app';
export const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o`;

/**
 * Build Firebase Storage URL with optional folder support
 * @param path - Can be filename, folder/filename, or full path
 * @param folder - Optional folder to prepend if path is just a filename
 * @returns Complete Firebase Storage URL
 */
export function buildImageUrl(path: string, folder?: string): string {
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If path includes a folder (has '/') or no folder specified, use as-is
  // Otherwise, prepend the folder
  const finalPath = (folder && !path.includes('/')) 
    ? `${folder}/${path}` 
    : path;
    
  return `${BASE_URL}/${encodeURIComponent(finalPath)}?alt=media`;
}

/**
 * Specific helper for book covers - ensures books/ folder
 */
export function buildBookCoverUrl(filename: string): string {
  return buildImageUrl(filename, 'books');
}

/**
 * Specific helper for icons - ensures icons/ folder  
 */
export function buildIconUrl(filename: string): string {
  return buildImageUrl(filename, 'icons');
}