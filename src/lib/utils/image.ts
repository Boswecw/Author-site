// src/lib/utils/images.ts - COMPLETE REWRITE FOR RELIABLE LOADING
import { browser } from '$app/environment';

/**
 * CRITICAL FIX: Your actual Firebase Storage URLs with proper encoding
 * These are external URLs that Vite should NOT process at build time
 */
export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
    CONVICTION_IN_A_FLOOD: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Conviction_in_a_Flood.png?alt=media&token=0e509deb-cc0f-4f2d-9852-d7fab2f28741',
    HURRICANE_EVE: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Hurrican_Eve.png?alt=media&token=cac22f0d-d0c8-4965-b6be-d743a3968148',
    THE_FAITH_OF_THE_HUNTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/The_Faith_of_the_Hunter.png?alt=media&token=17825380-c90b-41d3-b16e-dc04cac14a69',
    HEART_OF_THE_STORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Heart_of_the_Storm.png?alt=media&token=a289b1cc-87c1-402c-a920-00e895ddf4cd',
    SYMBIOGENESIS: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Symbiogenesis.png?alt=media&token=f9a763d8-bc7e-49d5-8bb2-afe2596ac023'
  },
  AUTHOR: {
    PORTRAIT: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBoswell.jpg?alt=media&token=1ba4211f-b06c-49c3-9ef9-96e75fccc8e0',
    FIREFIGHTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
    NAVY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Navy1993.JPG?alt=media&token=c1be8697-f87e-404b-b6df-8d3d856f2140',
    AUGUST_25: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58'
  },
  ICONS: {
    SIGNATURE_LOGO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
    CHRISTIAN_FICTION: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
    EPIC_FANTASY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025'
  }
} as const;

/**
 * Clean URLs and ensure HTTPS - your Firebase URLs are already clean!
 */
export function cleanFirebaseUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    let cleanUrl = url;
    
    // Ensure HTTPS
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace('http://', 'https://');
    }
    
    // Add protocol if missing
    if (cleanUrl.startsWith('//')) {
      cleanUrl = `https:${cleanUrl}`;
    }
    
    return cleanUrl;
  } catch (error) {
    console.warn('[cleanFirebaseUrl] Error cleaning URL:', error);
    return url;
  }
}

/**
 * Create fallback placeholder images
 */
export function createImageFallback(text: string, width = 300, height = 400): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#7a1c1c" rx="8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="serif" font-size="16" font-weight="600" fill="white">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Reliable image loader with proper error handling
 */
export async function loadImageSafely(url: string): Promise<string> {
  if (!browser) return createImageFallback('Loading...');
  
  const cleanUrl = cleanFirebaseUrl(url);
  if (!cleanUrl) return createImageFallback('Invalid URL');
  
  return new Promise((resolve) => {
    const img = new Image();
    
    // Success - return the clean URL
    img.onload = () => resolve(cleanUrl);
    
    // Error - return placeholder
    img.onerror = () => {
      console.warn('[loadImageSafely] Failed to load:', cleanUrl);
      resolve(createImageFallback('Image Unavailable'));
    };
    
    // Set CORS for Firebase Storage
    img.crossOrigin = 'anonymous';
    img.src = cleanUrl;
    
    // Timeout fallback
    setTimeout(() => {
      if (!img.complete) {
        console.warn('[loadImageSafely] Timeout loading:', cleanUrl);
        resolve(createImageFallback('Loading Timeout'));
      }
    }, 10000);
  });
}

/**
 * Main image constants that your components can use
 * These reference the cleaned Firebase URLs
 */
export const IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: FIREBASE_IMAGES.BOOKS.FAITH_IN_A_FIRESTORM,
    CONVICTION_IN_A_FLOOD: FIREBASE_IMAGES.BOOKS.CONVICTION_IN_A_FLOOD,
    THE_FAITH_OF_THE_HUNTER: FIREBASE_IMAGES.BOOKS.THE_FAITH_OF_THE_HUNTER,
    HURRICANE_EVE: FIREBASE_IMAGES.BOOKS.HURRICANE_EVE,
    HEART_OF_THE_STORM: FIREBASE_IMAGES.BOOKS.HEART_OF_THE_STORM,
    SYMBIOGENESIS: FIREBASE_IMAGES.BOOKS.SYMBIOGENESIS
  },
  AUTHOR: {
    PORTRAIT: FIREBASE_IMAGES.AUTHOR.PORTRAIT,
    FIREFIGHTER: FIREBASE_IMAGES.AUTHOR.FIREFIGHTER,
    NAVY: FIREBASE_IMAGES.AUTHOR.NAVY,
    AUGUST_25: FIREBASE_IMAGES.AUTHOR.AUGUST_25
  },
  ICONS: {
    SIGNATURE_LOGO: FIREBASE_IMAGES.ICONS.SIGNATURE_LOGO,
    CHRISTIAN_FICTION: FIREBASE_IMAGES.ICONS.CHRISTIAN_FICTION,
    EPIC_FANTASY: FIREBASE_IMAGES.ICONS.EPIC_FANTASY
  }
} as const;

/**
 * Batch preload critical images
 */
export async function preloadCriticalImages(): Promise<void> {
  if (!browser) return;
  
  const criticalUrls = [
    IMAGES.BOOKS.FAITH_IN_A_FIRESTORM,
    IMAGES.AUTHOR.PORTRAIT,
    IMAGES.AUTHOR.AUGUST_25
  ];
  
  await Promise.allSettled(
    criticalUrls.map(url => loadImageSafely(url))
  );
}

// Export for backward compatibility
export { cleanFirebaseUrl as normalizeFirebaseUrl };