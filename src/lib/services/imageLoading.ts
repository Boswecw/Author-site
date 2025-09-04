// src/lib/services/imageLoading.ts - SIMPLIFIED WORKING VERSION
import { browser } from '$app/environment';
import { normalizeFirebaseUrl } from '$lib/utils/urls';
import { createImageFallback } from '$lib/utils/image';

import { storage } from '$lib/services/firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Resolve a cover reference to a loadable URL.
 * - If it's already an http(s) URL, normalize & return it.
 * - If it's a filename/path (e.g. "Symbiogenesis.png"), use Firebase Storage to get a fresh URL.
 * - Returns null on SSR or when resolution fails.
 */
export async function resolveCover(filename?: string | null): Promise<string | null> {
  if (!filename) return null;

  // Already a full URL?
  if (/^https?:\/\//i.test(filename)) {
    return normalizeFirebaseUrl(filename) ?? filename;
  }

  // Only try Storage on the client
  if (!browser) return null;

  try {
    const fileRef = ref(storage, filename);
    const url = await getDownloadURL(fileRef);
    return normalizeFirebaseUrl(url) ?? url;
  } catch (err) {
    console.warn('[resolveCover] Failed to resolve', filename, err);
    return null;
  }
}

/**
 * Commonly used image references, resolved up-front on the client.
 * NOTE: Top-level await runs only on the client here (SSR returns null),
 *       which is fine because components typically consume these in onMount.
 */
export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: browser ? await resolveCover('Faith_in_a_FireStorm.png').catch(() => null) : null,
    CONVICTION_IN_A_FLOOD: browser ? await resolveCover('Conviction_in_a_Flood.png').catch(() => null) : null,
    HURRICANE_EVE:        browser ? await resolveCover('Hurrican_Eve.png').catch(() => null) : null,
    THE_FAITH_OF_THE_HUNTER: browser ? await resolveCover('The_Faith_of_the_Hunter.png').catch(() => null) : null,
    HEART_OF_THE_STORM:   browser ? await resolveCover('Heart_of_the_Storm.png').catch(() => null) : null,
    SYMBIOGENESIS:        browser ? await resolveCover('Symbiogenesis.png').catch(() => null) : null
  },
  AUTHOR: {
    PORTRAIT:   browser ? await resolveCover('CharlesBoswell.jpg').catch(() => null) : null,
    FIREFIGHTER:browser ? await resolveCover('CharlesBosewll_USFS.jpg').catch(() => null) : null,
    NAVY:       browser ? await resolveCover('Navy1993.JPG').catch(() => null) : null,
    AUGUST_25:  browser ? await resolveCover('August25.png').catch(() => null) : null
  },
  ICONS: {
    SIGNATURE_LOGO:     browser ? await resolveCover('Signaturelogo.png').catch(() => null) : null,
    CHRISTIAN_FICTION:  browser ? await resolveCover('ChristianFiction.png').catch(() => null) : null,
    EPIC_FANTASY:       browser ? await resolveCover('EpicFantasy.png').catch(() => null) : null
  }
} as const;

/**
 * Simple image loading service
 */
class ImageLoadingService {
  private cache = new Map<string, Promise<string | null>>();
  private loadedImages = new Set<string>();

  /**
   * Load image with timeout and error handling
   */
  async loadImage(url?: string | null): Promise<string | null> {
    if (!url) return null;

    const normalizedUrl = normalizeFirebaseUrl(url) ?? url;

    // Return immediately if already loaded
    if (this.loadedImages.has(normalizedUrl)) {
      return normalizedUrl;
    }

    // Return cached promise if loading
    if (this.cache.has(normalizedUrl)) {
      return this.cache.get(normalizedUrl)!;
    }

    // Create new loading promise
    const loadPromise = this.loadSingleImage(normalizedUrl);
    this.cache.set(normalizedUrl, loadPromise);

    try {
      const result = await loadPromise;
      if (result) {
        this.loadedImages.add(normalizedUrl);
      } else {
        console.warn('[ImageLoadingService] Failed to load', normalizedUrl);
      }
      return result;
    } catch (error) {
      console.warn('[ImageLoadingService] Failed to load:', normalizedUrl, error);
      return null;
    }
  }

  /**
   * Load single image with timeout
   */
  private loadSingleImage(src: string): Promise<string | null> {
    if (!browser) return Promise.resolve(src);

    return new Promise((resolve) => {
      const img = new Image();

      // Timeout to prevent hanging
      const timeout = setTimeout(() => {
        img.onload = img.onerror = null;
        console.warn('[ImageLoadingService] Timeout/Fail', src);
        resolve(null);
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(src);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.warn('[ImageLoadingService] Failed to load', src);
        resolve(null);
      };

      // Set CORS for Firebase images
      if (src.includes('firebasestorage.googleapis.com')) {
        img.crossOrigin = 'anonymous';
      }

      img.src = src;
    });
  }

  /**
   * Check if image is already loaded
   */
  isLoaded(url?: string | null): boolean {
    if (!url) return false;
    const normalizedUrl = normalizeFirebaseUrl(url) ?? url;
    return this.loadedImages.has(normalizedUrl);
  }

  /**
   * Clear cache and loaded images
   */
  clear() {
    this.cache.clear();
    this.loadedImages.clear();
  }
}

// Export singleton instance
export const imageLoadingService = new ImageLoadingService();

// Legacy alias
export const imageService = imageLoadingService;

/**
 * Preload multiple images
 */
export async function preloadImages(urls: (string | null | undefined)[]): Promise<{
  loaded: string[];
  failed: string[];
}> {
  const validUrls = urls
    .map((url) => normalizeFirebaseUrl(url) ?? url)
    .filter((url): url is string => !!url);

  const results = await Promise.allSettled(
    validUrls.map((url) => imageLoadingService.loadImage(url))
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

// Export commonly used fallbacks
export const IMAGES = {
  BOOKS: FIREBASE_IMAGES.BOOKS,
  AUTHOR: FIREBASE_IMAGES.AUTHOR,
  ICONS: FIREBASE_IMAGES.ICONS,
  FALLBACKS: {
    BOOK: createImageFallback('BOOK', 'book'),
    AUTHOR: createImageFallback('AUTHOR', 'avatar'),
    LOGO: createImageFallback('CB', 'logo')
  }
} as const;

export { createImageFallback };
