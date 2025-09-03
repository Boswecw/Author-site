// src/lib/utils/image.ts

import { normalizeFirebaseUrl } from './urls';

/**
 * CRITICAL FIX: Use YOUR actual Firebase Storage URLs
 * Based on the URLs you provided in project knowledge
 */
export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
    CONVICTION_IN_A_FLOOD: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1', // From your MongoDB
    HURRICANE_EVE: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Hurrican_Eve.png?alt=media&token=cac22f0d-d0c8-4965-b6be-d743a3968148',
    THE_FAITH_OF_THE_HUNTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/The_Faith_of_the_Hunter.png?alt=media&token=17825380-c90b-41d3-b16e-dc04cac14a69',
    HEART_OF_THE_STORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Heart_of_the_Storm.png?alt=media&token=a289b1cc-87c1-402c-a920-00e895ddf4cd',
    SYMBIOGENESIS: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Symbiogenesis.png?alt=media&token=f9a763d8-bc7e-49d5-8bb2-afe2596ac023'
  },
  AUTHOR: {
    PORTRAIT: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBoswell.jpg?alt=media&token=1ba4211f-b06c-49c3-9ef9-96e75fccc8e0',
    FIREFIGHTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
    NAVY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Navy1993.JPG?alt=media&token=c1be8697-f87e-404b-b6df-8d3d856f2140'
  },
  ICONS: {
    SIGNATURE_LOGO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
    CHRISTIAN_FICTION: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
    EPIC_FANTASY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025'
  },
  MISC: {
    AUGUST_25: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58'
  }
} as const;

/**
 * CRITICAL FIX: Preload images with resilient error handling
 */
export async function preloadImage(url: string): Promise<string | null> {
  if (!url) return null;
  
  try {
    const normalizedUrl = normalizeFirebaseUrl(url);
    if (!normalizedUrl) return null;
    
    // Test with HEAD request first (faster)
    const headResponse = await fetch(normalizedUrl, { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'cors'
    });
    
    if (!headResponse.ok) {
      console.warn('[preloadImage] HEAD request failed:', normalizedUrl, headResponse.status);
      return null;
    }
    
    // If HEAD passes, preload the actual image
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(normalizedUrl);
      img.onerror = () => {
        console.warn('[preloadImage] Image load failed:', normalizedUrl);
        resolve(null);
      };
      img.src = normalizedUrl;
    });
    
  } catch (error) {
    console.warn('[preloadImage] Network error:', url, error);
    return null;
  }
}

/**
 * CRITICAL FIX: Create fallback images as data URIs
 */
export function createImageFallback(text: string, width = 300, height = 400): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7f1d1d;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" stroke="#dc2626" stroke-width="2"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, -apple-system, sans-serif" font-size="14" 
            font-weight="600" fill="white">
        ${text}
      </text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, -apple-system, sans-serif" font-size="11" 
            fill="#fca5a5">
        Cover Unavailable
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * CRITICAL FIX: Progressive image loading service
 */
export class ProgressiveImageLoader {
  private cache = new Map<string, Promise<string | null>>();
  
  async load(url: string): Promise<string | null> {
    if (!url) return null;
    
    // Return cached promise if exists
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }
    
    // Create and cache the loading promise
    const loadPromise = this.loadWithFallback(url);
    this.cache.set(url, loadPromise);
    
    return loadPromise;
  }
  
  private async loadWithFallback(url: string): Promise<string | null> {
    const normalizedUrl = normalizeFirebaseUrl(url);
    if (!normalizedUrl) return null;
    
    try {
      const success = await preloadImage(normalizedUrl);
      return success;
    } catch {
      return null;
    }
  }
  
  clear() {
    this.cache.clear();
  }
}

// Global instance for reuse
export const imageLoader = new ProgressiveImageLoader();

/**
 * CRITICAL FIX: Updated IMAGES constants to use YOUR actual Firebase URLs
 * This maintains backward compatibility with your existing code
 */
export const IMAGES = {
  BOOKS: {
    // Primary references using your actual URLs
    FAITH_IN_A_FIRESTORM: FIREBASE_IMAGES.BOOKS.FAITH_IN_A_FIRESTORM,
    CONVICTION_IN_A_FLOOD: FIREBASE_IMAGES.BOOKS.CONVICTION_IN_A_FLOOD,
    THE_FAITH_OF_THE_HUNTER: FIREBASE_IMAGES.BOOKS.THE_FAITH_OF_THE_HUNTER,
    HURRICANE_EVE: FIREBASE_IMAGES.BOOKS.HURRICANE_EVE,
    HEART_OF_THE_STORM: FIREBASE_IMAGES.BOOKS.HEART_OF_THE_STORM,
    
    // Legacy aliases for backward compatibility
    FAITH_FIRESTORM: FIREBASE_IMAGES.BOOKS.FAITH_IN_A_FIRESTORM,
    CONVICTION_FLOOD: FIREBASE_IMAGES.BOOKS.CONVICTION_IN_A_FLOOD,
    HUNTERS_FAITH: FIREBASE_IMAGES.BOOKS.THE_FAITH_OF_THE_HUNTER,
    HEART_OF_STORM: FIREBASE_IMAGES.BOOKS.HEART_OF_THE_STORM
  },
  AUTHOR: {
    PORTRAIT: FIREBASE_IMAGES.AUTHOR.PORTRAIT,
    FIREFIGHTER: FIREBASE_IMAGES.AUTHOR.FIREFIGHTER,
    NAVY: FIREBASE_IMAGES.AUTHOR.NAVY
  },
  ICONS: {
    SIGNATURE_LOGO: FIREBASE_IMAGES.ICONS.SIGNATURE_LOGO,
    CHRISTIAN_FICTION: FIREBASE_IMAGES.ICONS.CHRISTIAN_FICTION,
    EPIC_FANTASY: FIREBASE_IMAGES.ICONS.EPIC_FANTASY
  },
  PLACEHOLDER: '/images/placeholder-book.jpg' // Add this to static/images/
} as const;

/**
 * Batch preload multiple images
 */
export async function preloadImages(urls: (string | null | undefined)[]): Promise<void> {
  const validUrls = urls.filter((url): url is string => Boolean(url));
  
  await Promise.allSettled(
    validUrls.map(url => imageLoader.load(url))
  );
}