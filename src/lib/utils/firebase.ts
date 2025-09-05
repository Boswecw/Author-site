// src/lib/utils/firebase.ts
export const BUCKET_NAME = 'endless-fire-467204-n2.firebasestorage.app';
export const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o`;

export function buildImageUrl(filename: string): string {
  return `${BASE_URL}/${encodeURIComponent(filename)}?alt=media`;
}
