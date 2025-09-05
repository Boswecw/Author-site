// src/lib/services/authorImages.ts - FIXED TYPE ISSUES
const BUCKET_NAME = 'endless-fire-467204-n2.firebasestorage.app';
const BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o`;

function buildImageUrl(filename: string): string {
  const encodedFilename = encodeURIComponent(filename);
  return `${BASE_URL}/${encodedFilename}?alt=media`;
}

// ✅ FIXED: Add index signature for dynamic access
export const AUTHOR_IMAGES = {
  BOOKS: {
    CONVICTION_IN_A_FLOOD: buildImageUrl('Conviction_in_a_Flood.png'),
    FAITH_IN_A_FIRESTORM: buildImageUrl('Faith_in_a_FireStorm.png'),
    HURRICANE_EVE: buildImageUrl('Hurrican_Eve.png'),
    SYMBIOGENESIS: buildImageUrl('Symbiogenesis.png'),
    THE_FAITH_OF_THE_HUNTER: buildImageUrl('The_Faith_of_the_Hunter.png'),
    HEART_OF_THE_STORM: buildImageUrl('Heart_of_the_Storm.png')
  } as Record<string, string>, // ← Add this type annotation
  AUTHOR: {
    PORTRAIT: buildImageUrl('CharlesBoswell.jpg'),
    FIREFIGHTER: buildImageUrl('CharlesBosewll_USFS.jpg'),
    NAVY: buildImageUrl('Navy1993.JPG'),
    AUGUST_25: buildImageUrl('August25.png')
  },
  ICONS: {
    SIGNATURE_LOGO: buildImageUrl('Signaturelogo.png'),
    CHRISTIAN_FICTION: buildImageUrl('ChristianFiction.png'),
    EPIC_FANTASY: buildImageUrl('EpicFantasy.png')
  }
};

const isBrowser = typeof window !== 'undefined';

export function toBase64UnicodeSafe(svg: string): string {
  if (isBrowser && typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(svg)));
  }
  return Buffer.from(svg, 'utf8').toString('base64');
}

export function createImageFallback(text: string, type: 'book' | 'avatar' | 'logo' = 'book'): string {
  const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 300, h: 300 };
  const displayText = text.length > 10 ? text.substring(0, 10) + '...' : text;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="20" fill="#6b7280">${displayText}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${toBase64UnicodeSafe(svg)}`;
}

export function getImageUrl(filename: string | null): string | null {
  if (!filename) return null;
  return buildImageUrl(filename);
}

// ✅ FIXED: Safer type checking for dynamic access
export function getBookCover(bookId: string): string | null {
  const bookKey = bookId.toUpperCase().replace(/-/g, '_');
  const booksRecord = AUTHOR_IMAGES.BOOKS as Record<string, string>;
  return booksRecord[bookKey] || null;
}

export async function preloadImage(url?: string | null): Promise<string | null> {
  if (!isBrowser || !url) return null;
  
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      resolve(null);
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(url);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };

    if (url.includes('firebasestorage.googleapis.com')) {
      (img as HTMLImageElement).crossOrigin = 'anonymous';
    }

    img.src = url;
  });
}

// Legacy compatibility exports
export const FIREBASE_IMAGES = AUTHOR_IMAGES;
export const resolveCover = getImageUrl;
export const createFallback = createImageFallback;