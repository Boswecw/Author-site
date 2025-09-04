// src/lib/services/imageLoading.ts - SIMPLIFIED WORKING VERSION
import { browser } from '$app/environment';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

const BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/';

function buildUrl(path: string): string {
  return `${BASE_URL}${path}?alt=media`;
}

export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: buildUrl('Faith_in_a_FireStorm.png'),
    CONVICTION_IN_A_FLOOD: buildUrl('Conviction_in_a_Flood%20Cover.png'),
    HURRICANE_EVE: buildUrl('Hurricane_Eve%20Cover.png'),
    THE_FAITH_OF_THE_HUNTER: buildUrl('TheFaithoftheHuntercover.png'),
    HEART_OF_THE_STORM: buildUrl('Heart_of_the_Storm_Elf_and_Wolf.png'),
    SYMBIOGENESIS: buildUrl('Symbiogenesis.png')
  },
  AUTHOR: {
    PORTRAIT: buildUrl('CharlesBoswell.jpg'),
    FIREFIGHTER: buildUrl('CharlesBosewll_USFS.jpg'),
    NAVY: buildUrl('Navy1993.JPG'),
    AUGUST_25: buildUrl('August25.png')
  },
  ICONS: {
    SIGNATURE_LOGO: buildUrl('Signaturelogo.png'),
    CHRISTIAN_FICTION: buildUrl('ChristianFiction.png'),
    EPIC_FANTASY: buildUrl('EpicFantasy.png')
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

