// src/lib/services/imageLoading.ts - SIMPLIFIED WORKING VERSION
import { browser } from '$app/environment';
import { normalizeFirebaseUrl } from '$lib/utils/urls';
import { createImageFallback } from '$lib/utils/image';
import { FIREBASE_TOKENS } from '$lib/config/firebaseTokens';

const BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/';

function withToken(path: string, token: string): string {
  return `${BASE_URL}${path}?alt=media&token=${token}`;
}

export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: withToken('Faith_in_a_FireStorm.png', FIREBASE_TOKENS.BOOKS.FAITH_IN_A_FIRESTORM),
    CONVICTION_IN_A_FLOOD: withToken('Conviction_in_a_Flood%20Cover.png', FIREBASE_TOKENS.BOOKS.CONVICTION_IN_A_FLOOD),
    HURRICANE_EVE: withToken('Hurricane_Eve%20Cover.png', FIREBASE_TOKENS.BOOKS.HURRICANE_EVE),
    THE_FAITH_OF_THE_HUNTER: withToken('TheFaithoftheHuntercover.png', FIREBASE_TOKENS.BOOKS.THE_FAITH_OF_THE_HUNTER),
    HEART_OF_THE_STORM: withToken('Heart_of_the_Storm_Elf_and_Wolf.png', FIREBASE_TOKENS.BOOKS.HEART_OF_THE_STORM),
    SYMBIOGENESIS: withToken('Symbiogenesis.png', FIREBASE_TOKENS.BOOKS.SYMBIOGENESIS)
  },
  AUTHOR: {
    PORTRAIT: withToken('CharlesBoswell.jpg', FIREBASE_TOKENS.AUTHOR.PORTRAIT),
    FIREFIGHTER: withToken('CharlesBosewll_USFS.jpg', FIREBASE_TOKENS.AUTHOR.FIREFIGHTER),
    NAVY: withToken('Navy1993.JPG', FIREBASE_TOKENS.AUTHOR.NAVY),
    AUGUST_25: withToken('August25.png', FIREBASE_TOKENS.AUTHOR.AUGUST_25)
  },
  ICONS: {
    SIGNATURE_LOGO: withToken('Signaturelogo.png', FIREBASE_TOKENS.ICONS.SIGNATURE_LOGO),
    CHRISTIAN_FICTION: withToken('ChristianFiction.png', FIREBASE_TOKENS.ICONS.CHRISTIAN_FICTION),
    EPIC_FANTASY: withToken('EpicFantasy.png', FIREBASE_TOKENS.ICONS.EPIC_FANTASY)
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
