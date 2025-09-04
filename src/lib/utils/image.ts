// src/lib/utils/image.ts - COMPLETE FIX
import { normalizeFirebaseUrl } from '$lib/utils/urls';

const isBrowser = typeof window !== 'undefined';

/** Unicode-safe base64 for SVG, works in SSR and browser */
export function toBase64UnicodeSafe(svg: string): string {
  if (isBrowser && typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(svg)));
  }
  // Node/SSR fallback
  return Buffer.from(svg, 'utf8').toString('base64');
}

/**
 * Create fallback image as data URI
 */
export function createImageFallback(text: string, type: 'book' | 'avatar' | 'logo'): string {
  const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 300, h: 300 };
  const displayText = text.length > 10 ? text.substring(0, 10) + '...' : text;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="20" fill="#6b7280">${displayText}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${toBase64UnicodeSafe(svg)}`;
}

/**
 * Preload single image with timeout and CORS handling
 */
export async function preloadImage(url?: string | null): Promise<string | null> {
  if (!isBrowser || !url) return null;
  
  return new Promise((resolve) => {
    const img = new Image();
    
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      console.warn('[preloadImage] Timeout loading:', url);
      resolve(null);
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(url);
    };

    img.onerror = (e) => {
      clearTimeout(timeout);
      console.warn('[preloadImage] Failed to load:', url, e);
      resolve(null);
    };

    // Set CORS for Firebase images
    if (url.includes('firebasestorage.googleapis.com')) {
      img.crossOrigin = 'anonymous';
    }

    img.src = url;
  });
}

/**
 * Progressive Image Loader class with caching
 */
class ProgressiveImageLoader {
  private cache = new Map<string, Promise<string | null>>();
  private loadedImages = new Set<string>();

  async load(url?: string | null): Promise<string | null> {
    const key = normalizeFirebaseUrl(url) ?? url ?? '';
    if (!key) return null;

    // Return immediately if already loaded
    if (this.loadedImages.has(key)) return key;

    if (this.cache.has(key)) return this.cache.get(key)!;

    const p = (async () => {
      try {
        const result = await preloadImage(key);
        if (result) this.loadedImages.add(key);
        return result;
      } catch (error) {
        console.warn(`Image loading failed for: ${key}`, error);
        return null;
      }
    })();

    this.cache.set(key, p);
    return p;
  }

  clear() {
    this.cache.clear();
    this.loadedImages.clear();
  }

  isLoaded(url?: string | null): boolean {
    const key = normalizeFirebaseUrl(url) ?? url ?? '';
    return this.loadedImages.has(key);
  }
}

export const imageLoader = new ProgressiveImageLoader();

/**
 * Batch preload with better error handling
 */
export async function preloadImages(urls: (string | null | undefined)[]): Promise<{
  loaded: string[];
  failed: string[];
}> {
  if (!isBrowser) return { loaded: [], failed: [] };
  
  const validUrls = urls
    .map((u) => normalizeFirebaseUrl(u) ?? u ?? '')
    .filter(Boolean);
  
  const results = await Promise.allSettled(
    validUrls.map((url) => imageLoader.load(url))
  );
  
  const loaded: string[] = [];
  const failed: string[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      loaded.push(validUrls[index]);
    } else {
      failed.push(validUrls[index]);
    }
  });
  
  return { loaded, failed };
}

// Export static fallback images for components
export const FALLBACK_IMAGES = {
  get BOOK_COVER() {
    return createImageFallback('BOOK', 'book');
  },
  get AUTHOR_PHOTO() {
    return createImageFallback('AUTHOR', 'avatar');
  },
  get LOGO() {
    return createImageFallback('CB', 'logo');
  }
} as const;