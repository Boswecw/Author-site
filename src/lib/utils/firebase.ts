// src/lib/utils/firebase.ts - FIXED
export const BUCKET_NAME = 'endless-fire-467204-n2.firebasestorage.app';
export const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o`;

/**
 * Build Firebase Storage URL with folder support
 */
export function buildImageUrl(path: string, folder?: string): string {
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If path includes a folder or no folder specified, use as-is
  // Otherwise, prepend the folder
  const finalPath = (folder && !path.includes('/')) 
    ? `${folder}/${path}` 
    : path;
    
  return `${BASE_URL}/${encodeURIComponent(finalPath)}?alt=media`;
}

/**
 * CRITICAL: Book covers must include books/ folder
 */
export function buildBookCoverUrl(filename: string): string {
  return buildImageUrl(filename, 'books');
}

export function buildIconUrl(filename: string): string {
  return buildImageUrl(filename, 'icons');
}

export function buildPostImageUrl(filename: string): string {
  return buildImageUrl(filename, 'posts');
}