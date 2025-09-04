// src/lib/services/imageLoading.ts - COMPLETE CONSOLIDATION FIX
import { browser } from '$app/environment';
import { normalizeFirebaseUrl } from '$lib/utils/urls';
import { createImageFallback } from '$lib/utils/image';

/**
 * ✅ FIXED: Centralized Firebase Storage URLs
 * Update these URLs with fresh tokens from your Firebase Console
 */
export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
    CONVICTION_IN_A_FLOOD: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
    HURRICANE_EVE: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334',
    THE_FAITH_OF_THE_HUNTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/TheFaithoftheHuntercover.png?alt=media&token=ac09e3b1-7cee-4df3-bc9e-dcbcf14a482f',
    HEART_OF_THE_STORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Heart_of_the_Storm_Elf_and_Wolf.png?alt=media&token=5376fbb7-b0e4-4595-abc8-6ec96be68005',
    SYMBIOGENESIS: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Symbiogenesis.png?alt=media&token=f9a763d8-bc7e-49d5-8bb2-afe2596ac023'
  },
  AUTHOR: {
    PORTRAIT: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/CharlesBoswell.jpg?alt=media&token=1ba4211f-b06c-49c3-9ef9-96e75fccc8e0',
    FIREFIGHTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
    NAVY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Navy1993.JPG?alt=media&token=c1be8697-f87e-404b-b6df-8d3d856f2140',
    AUGUST_25: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58'
  },
  ICONS: {
    SIGNATURE_LOGO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
    CHRISTIAN_FICTION: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
    EPIC_FANTASY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025'
  }
} as const;

/**
 * ✅ FIXED: Safe fallback image generator for SSR/browser
 */
function generateFallbackImage(type: 'book' | 'avatar' | 'logo', text: string): string {
  if (!browser) {
    // SSR fallback - simple base64 encoded SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial" font-size="24" fill="#6b7280">Loading...</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Browser fallback - use the utility function
  return createImageFallback(text, type);
}

/**
 * ✅ FIXED: Export FALLBACK_IMAGES that components expect
 */
export const FALLBACK_IMAGES = {
  get BOOK_COVER() {
    return generateFallbackImage('book', 'BOOK');
  },
  get AUTHOR_PHOTO() {
    return generateFallbackImage('avatar', 'AUTHOR');
  },
  get LOGO() {
    return generateFallbackImage('logo', 'CB');
  }
} as const;

/**
 * ✅ FIXED: Image loading service class
 */
export class ImageLoadingService {
  private cache = new Map<string, Promise<string | null>>();
  private loadedImages = new Set<string>();

  /**
   * Load image with caching and fallback
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
        resolve(null);
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(src);
      };

      img.onerror = () => {
        clearTimeout(timeout);
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
   * Preload multiple images
   */
  async preloadImages(urls: (string | null | undefined)[]): Promise<{
    loaded: string[];
    failed: string[];
  }> {
    const validUrls = urls
      .map(url => normalizeFirebaseUrl(url) ?? url)
      .filter((url): url is string => !!url);

    const results = await Promise.allSettled(
      validUrls.map(url => this.loadImage(url))
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

/**
 * Re-export progressive image functionality for backward compatibility
 */
export { progressiveImage, imagePreloader } from '$lib/actions/progressiveImage';
export { normalizeFirebaseUrl } from '$lib/utils/urls';