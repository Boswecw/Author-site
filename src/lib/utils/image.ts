// src/lib/utils/image.ts - SIMPLIFIED: No Firebase client dependencies needed
import { browser } from '$app/environment';

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
    const simpleSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>';
    try {
      const simpleBase64 = browser ? btoa(simpleSvg) : Buffer.from(simpleSvg, 'utf8').toString('base64');
      return `data:image/svg+xml;base64,${simpleBase64}`;
    } catch {
      return 'data:image/svg+xml;base64,';
    }
  }
}

/**
 * ✅ SIMPLIFIED: Get image URL with fallback - server already built complete URLs
 */
export function getImageWithFallback(
  url: string | null | undefined,
  fallbackType: 'book' | 'avatar' | 'logo' = 'book',
  fallbackText = ''
): string {
  // If we have a URL (server-built), use it
  if (url && typeof url === 'string' && url.trim()) {
    return url.trim();
  }
  
  // Otherwise, return fallback
  const text = fallbackText || fallbackType.toUpperCase();
  return createFallbackImage(text, fallbackType);
}

/**
 * ✅ SIMPLIFIED: Book cover with fallback - no Firebase SDK needed
 */
export function getBookCoverWithFallback(coverUrl?: string | null): string {
  return getImageWithFallback(coverUrl, 'book', 'BOOK');
}

/**
 * ✅ SIMPLIFIED: Author image with fallback
 */
export function getAuthorImageWithFallback(imageUrl?: string | null): string {
  return getImageWithFallback(imageUrl, 'avatar', 'AUTHOR');
}

/**
 * ✅ SIMPLIFIED: Logo with fallback
 */
export function getLogoWithFallback(logoUrl?: string | null): string {
  return getImageWithFallback(logoUrl, 'logo', 'CB');
}

/**
 * Preload image to improve perceived performance
 */
export async function preloadImage(url: string): Promise<boolean> {
  if (!browser || !url) return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    
    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      console.log(`[preloadImage] ✅ Preloaded: ${url.substring(0, 50)}...`);
      resolve(true);
    };

    img.onerror = () => {
      cleanup();
      console.warn(`[preloadImage] ❌ Failed to preload: ${url.substring(0, 50)}...`);
      resolve(false);
    };

    img.src = url;
  });
}

/**
 * Preload multiple images in parallel
 */
export async function preloadImages(
  urls: (string | null | undefined)[],
  onProgress?: (loaded: number, total: number) => void
): Promise<{ loaded: string[]; failed: string[] }> {
  const validUrls = urls.filter((url): url is string => Boolean(url));
  
  if (validUrls.length === 0) {
    return { loaded: [], failed: [] };
  }

  const results = await Promise.allSettled(
    validUrls.map(async (url, index) => {
      const success = await preloadImage(url);
      onProgress?.(index + 1, validUrls.length);
      return { url, success };
    })
  );

  const loaded: string[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        loaded.push(result.value.url);
      } else {
        failed.push(result.value.url);
      }
    } else {
      failed.push(validUrls[index]);
    }
  });

  return { loaded, failed };
}

/**
 * Test if an image URL is accessible
 */
export async function testImageUrl(url: string): Promise<boolean> {
  if (!browser || !url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const isAccessible = response.ok;
    console.log(`[testImageUrl] ${isAccessible ? '✅' : '❌'} ${url.substring(0, 50)}...`);
    return isAccessible;
  } catch (error) {
    console.warn(`[testImageUrl] ❌ Network error for: ${url.substring(0, 50)}...`, error);
    return false;
  }
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

// Legacy compatibility for existing code
export function resolveCover(coverUrl?: string | null): Promise<string> {
  // Since server now builds complete URLs, just return with fallback
  return Promise.resolve(getBookCoverWithFallback(coverUrl));
}

export function resolveCovers(coverUrls: (string | null | undefined)[]): Promise<string[]> {
  // Since server now builds complete URLs, just map with fallbacks
  const results = coverUrls.map(url => getBookCoverWithFallback(url));
  return Promise.resolve(results);
}