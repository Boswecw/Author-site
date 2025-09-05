// src/lib/utils/image.ts
import { browser } from '$app/environment';
import { getClientStorage } from '$lib/services/firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Create a fallback SVG image for when images fail to load
 */
export function createFallbackImage(
  text: string,
  type: 'book' | 'avatar' | 'logo'
): string {
  const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 300, h: 300 };
  const displayText = text.length > 10 ? text.substring(0, 10) + '…' : text;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="20" fill="#6b7280">${displayText}</text>
  </svg>`;

  try {
    const base64 = browser
      ? btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, 'utf8').toString('base64');
    
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.warn('[createFallbackImage] Error creating fallback:', error);
    // Return a simple gray placeholder if SVG creation fails
    return `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>')}`;
  }
}

/**
 * Resolve Firebase Storage paths to download URLs
 */
export async function resolveFirebaseImage(path: string): Promise<string | null> {
  if (!browser || !path) return null;

  try {
    // If it's already a full URL, return as-is
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const storage = await getClientStorage();
    if (!storage) {
      console.warn('[resolveFirebaseImage] Storage not available');
      return null;
    }

    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.warn(`[resolveFirebaseImage] Failed to resolve: ${path}`, error);
    return null;
  }
}

/**
 * Book cover resolver – tries Firebase first, falls back to SVG
 */
export async function resolveCover(coverPath?: string | null): Promise<string> {
  if (!coverPath) {
    return createFallbackImage('BOOK', 'book');
  }

  const resolvedUrl = await resolveFirebaseImage(coverPath);
  if (resolvedUrl) return resolvedUrl;

  console.warn(`[resolveCover] Using fallback for: ${coverPath}`);
  return createFallbackImage('BOOK', 'book');
}

/**
 * Pre-defined fallback images
 */
export const FALLBACK_IMAGES = {
  BOOK_COVER: createFallbackImage('BOOK', 'book'),
  AUTHOR_PHOTO: createFallbackImage('AUTHOR', 'avatar'),
  LOGO: createFallbackImage('CB', 'logo')
} as const;

/**
 * Legacy compatibility exports
 */
export { createFallbackImage as createImageFallback };