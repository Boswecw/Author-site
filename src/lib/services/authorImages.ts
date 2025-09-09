// src/lib/services/authorImages.ts - COMPLETE with all missing exports
import { buildBookCoverUrl, buildImageUrl, buildIconUrl } from '$lib/utils/firebase';

export const AUTHOR_IMAGES = {
  BOOKS: {
    CONVICTION_IN_A_FLOOD: buildBookCoverUrl('Conviction_in_a_Flood.png'),
    FAITH_IN_A_FIRESTORM: buildBookCoverUrl('Faith_in_a_FireStorm.png'),
    HURRICANE_EVE: buildBookCoverUrl('Hurricane_Eve.png'),
    SYMBIOGENESIS: buildBookCoverUrl('Symbiogenesis.png'),
    THE_FAITH_OF_THE_HUNTER: buildBookCoverUrl('The_Faith_of_the_Hunter.png'),
    HEART_OF_THE_STORM: buildBookCoverUrl('Heart_of_the_Storm.png')
  },
  AUTHOR: {
    PORTRAIT: buildImageUrl('CharlesBoswell.jpg'),
    FIREFIGHTER: buildImageUrl('CharlesBosewll_USFS.jpg'),
    NAVY: buildImageUrl('Navy1993.JPG'),
    AUGUST_25: buildImageUrl('August25.png')
  },
  ICONS: {
    SIGNATURE_LOGO: buildIconUrl('Signaturelogo.png'),
    CHRISTIAN_FICTION: buildIconUrl('ChristianFiction.png'),
    EPIC_FANTASY: buildIconUrl('EpicFantasy.png')
  }
};

// ✅ ADD MISSING EXPORT - Alias for compatibility
export const FIREBASE_IMAGES = AUTHOR_IMAGES;

// ✅ ADD MISSING EXPORT - Image URL helper
export function getImageUrl(filename: string | null): string | null {
  if (!filename) return null;
  return buildImageUrl(filename);
}

// ✅ ADD MISSING EXPORT - Image fallback generator
export function createImageFallback(text: string, type: 'book' | 'avatar' | 'logo' = 'book'): string {
  const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 300, h: 300 };
  const displayText = text.length > 10 ? text.substring(0, 10) + '...' : text;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="20" fill="#6b7280">${displayText}</text>
  </svg>`;

  const isBrowser = typeof window !== 'undefined';
  const base64 = isBrowser 
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, 'utf8').toString('base64');
    
  return `data:image/svg+xml;base64,${base64}`;
}

// ✅ ADD MISSING EXPORT - Base64 helper
export function toBase64UnicodeSafe(svg: string): string {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser 
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, 'utf8').toString('base64');
}

// ✅ ADD MISSING EXPORT - Preload helper
export async function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}