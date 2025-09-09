// src/lib/utils/image.ts - MINIMAL: Only what you actually need
import { browser } from '$app/environment';

/**
 * Create a fallback SVG image for when images fail to load
 */
export function createFallbackImage(
  text: string,
  type: 'book' | 'avatar' | 'logo' = 'book'
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
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==';
  }
}

/**
 * Get image URL with fallback - server already built complete URLs
 */
export function getImageWithFallback(
  url: string | null | undefined,
  fallbackType: 'book' | 'avatar' | 'logo' = 'book'
): string {
  if (url && typeof url === 'string' && url.trim()) {
    return url.trim();
  }
  
  return createFallbackImage(fallbackType.toUpperCase(), fallbackType);
}

/**
 * Preload image for performance
 */
export async function preloadImage(url: string): Promise<boolean> {
  if (!browser || !url) return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Pre-defined fallback images
 */
export const FALLBACK_IMAGES = {
  BOOK_COVER: createFallbackImage('BOOK', 'book'),
  AUTHOR_PHOTO: createFallbackImage('AUTHOR', 'avatar'),
  LOGO: createFallbackImage('CB', 'logo')
} as const;

// Legacy compatibility exports (so existing imports don't break)
export { createFallbackImage as createImageFallback };

// Legacy compatibility functions - now just simple wrappers
export function resolveCover(coverUrl?: string | null): Promise<string> {
  return Promise.resolve(getImageWithFallback(coverUrl, 'book'));
}

export function resolveCovers(coverUrls: (string | null | undefined)[]): Promise<string[]> {
  const results = coverUrls.map(url => getImageWithFallback(url, 'book'));
  return Promise.resolve(results);
}