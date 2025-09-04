// src/lib/services/imageLoading.ts - SIMPLIFIED WORKING VERSION
import { browser } from '$app/environment';
import { normalizeFirebaseUrl } from '$lib/utils/urls';
import { createImageFallback } from '$lib/utils/image';
import { storage } from '$lib/services/firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';

export async function resolveCover(filename?: string | null) {
  if (!filename) return null;
  if (/^https?:\/\//.test(filename)) return filename;
  return await getDownloadURL(ref(storage, filename));
}

export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: await resolveCover('Faith_in_a_FireStorm.png').catch(() => null),
    CONVICTION_IN_A_FLOOD: await resolveCover('Conviction_in_a_Flood Cover.png').catch(() => null),
    HURRICANE_EVE: await resolveCover('Hurricane_Eve Cover.png').catch(() => null),
    THE_FAITH_OF_THE_HUNTER: await resolveCover('TheFaithoftheHuntercover.png').catch(() => null),
    HEART_OF_THE_STORM: await resolveCover('Heart_of_the_Storm_Elf_and_Wolf.png').catch(() => null),
    SYMBIOGENESIS: await resolveCover('Symbiogenesis.png').catch(() => null)
  },
  AUTHOR: {
    PORTRAIT: await resolveCover('CharlesBoswell.jpg').catch(() => null),
    FIREFIGHTER: await resolveCover('CharlesBosewll_USFS.jpg').catch(() => null),
    NAVY: await resolveCover('Navy1993.JPG').catch(() => null),
    AUGUST_25: await resolveCover('August25.png').catch(() => null)
  },
  ICONS: {
    SIGNATURE_LOGO: await resolveCover('Signaturelogo.png').catch(() => null),
    CHRISTIAN_FICTION: await resolveCover('ChristianFiction.png').catch(() => null),
    EPIC_FANTASY: await resolveCover('EpicFantasy.png').catch(() => null)
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
        console.warn('[ImageLoadingService] Failed to load', src);
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

// Legacy exports for backward compatibility
export const imageService = imageLoadingService;

/**
 * Preload multiple images
 */
export async function preloadImages(urls: (string | null | undefined)[]): Promise<{
  loaded: string[];
  failed: string[];
}> {
  const validUrls = urls
    .map(url => normalizeFirebaseUrl(url) ?? url)
    .filter((url): url is string => !!url);

  const results = await Promise.allSettled(
    validUrls.map(url => imageLoadingService.loadImage(url))
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
