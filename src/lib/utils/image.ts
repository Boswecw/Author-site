// src/lib/utils/image.ts - COMPLETE FIX
import { normalizeFirebaseUrl } from '$lib/utils/urls';

const isBrowser = typeof window !== 'undefined';

/** Unicode-safe base64 for SVG, works in SSR and browser */
function toBase64UnicodeSafe(svg: string): string {
  if (isBrowser && typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(svg)));
  }
  // Node/SSR fallback
  return Buffer.from(svg, 'utf8').toString('base64');
}

/** Decide when crossOrigin helps (Firebase) */
function shouldUseCrossOrigin(src: string): boolean {
  return src.includes('firebasestorage.googleapis.com');
}

/**
 * ✅ FIXED: Updated Firebase Storage URLs with fresh tokens
 * Replace with your current valid tokens from Firebase Console
 */
export const FIREBASE_IMAGES = {
  BOOKS: {
    FAITH_IN_A_FIRESTORM: "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3",
    CONVICTION_IN_A_FLOOD: "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1",
    HURRICANE_EVE: "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334",
    THE_FAITH_OF_THE_HUNTER: "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/TheFaithoftheHuntercover.png?alt=media&token=ac09e3b1-7cee-4df3-bc9e-dcbcf14a482f",
    HEART_OF_THE_STORM: "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Heart_of_the_Storm_Elf_and_Wolf.png?alt=media&token=5376fbb7-b0e4-4595-abc8-6ec96be68005",
  },
  AUTHOR: {
    PORTRAIT: null,      // Add your author photo URL here
    FIREFIGHTER: null,   // Add firefighter photo URL here  
    NAVY: null          // Add Navy photo URL here
  },
  ICONS: {
    SIGNATURE_LOGO: null,
    CHRISTIAN_FICTION: null,
    EPIC_FANTASY: null
  }
} as const;

/**
 * ✅ FIXED: Better image preloader with retry logic
 */
export async function preloadImage(url?: string | null): Promise<string | null> {
  if (!url) return null;
  const normalizedUrl = normalizeFirebaseUrl(url) ?? url;
  
  if (!isBrowser) return normalizedUrl;
  
  return new Promise((resolve) => {
    const img = new Image();
    
    // Set crossOrigin before src to avoid tainted canvas issues
    if (shouldUseCrossOrigin(normalizedUrl)) {
      img.crossOrigin = 'anonymous';
    }
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      resolve(null);
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(normalizedUrl);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.warn(`Failed to load image: ${normalizedUrl}`);
      resolve(null);
    };
    
    img.src = normalizedUrl;
  });
}

/** Create SVG fallback image with better styling */
export function createImageFallback(
  text: string = 'BOOK',
  type: 'book' | 'avatar' | 'logo' = 'book'
): string {
  type Config = {
    width: number;
    height: number;
    bg: string;
    text: string;
    textColor?: string;
    stroke?: string;
  };
  
  const configs: Record<'book' | 'avatar' | 'logo', Config> = {
    book: { 
      width: 300, 
      height: 450, 
      bg: '#7A1C1C', 
      text: text.slice(0, 20).toUpperCase() // Limit text length
    },
    avatar: { 
      width: 200, 
      height: 200, 
      bg: '#2C3E7F', 
      text: text.slice(0, 10).toUpperCase() 
    },
    logo: { 
      width: 56, 
      height: 56, 
      bg: '#F5F2E7', 
      text: text.slice(0, 3).toUpperCase(), 
      textColor: '#2B2B2B', 
      stroke: '#2B2B2B' 
    }
  };
  
  const c = configs[type];
  
  const svg = `
<svg width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grain" patternUnits="userSpaceOnUse" width="4" height="4">
      <rect width="4" height="4" fill="${c.bg}"/>
      <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.1)"/>
    </pattern>
  </defs>
  <rect width="${c.width}" height="${c.height}" fill="url(#grain)" ${c.stroke ? `stroke="${c.stroke}" stroke-width="2"` : ''}/>
  <text x="${c.width / 2}" y="${c.height / 2 + Math.round(c.height * 0.03)}"
        font-family="serif" font-size="${Math.floor(Math.min(c.width, c.height) * 0.12)}"
        font-weight="600" fill="${c.textColor || 'white'}" text-anchor="middle">${c.text}</text>
</svg>`.trim();
  
  return `data:image/svg+xml;base64,${toBase64UnicodeSafe(svg)}`;
}

/** ✅ FIXED: Progressive image loading with better caching */
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

/** Public aliases to maintain compatibility */
export const IMAGES = {
  BOOKS: FIREBASE_IMAGES.BOOKS,
  AUTHOR: FIREBASE_IMAGES.AUTHOR,
  ICONS: FIREBASE_IMAGES.ICONS,
  PLACEHOLDER: '/images/placeholder-book.jpg' // Ensure this exists in static/images/
} as const;

/** ✅ FIXED: Batch preload with better error handling */
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