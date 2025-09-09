// src/lib/utils/image.ts - FINAL CLEAN VERSION
import { browser } from '$app/environment';

/**
 * Create fallback SVG for failed images - NO client-side Firebase code
 */
export function createFallbackImage(text: string, type: 'book' | 'avatar' | 'logo' = 'book'): string {
  const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 300, h: 300 };
  const displayText = text.length > 10 ? text.substring(0, 10) + '…' : text;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" 
          font-family="Arial, sans-serif" font-size="20" fill="#6b7280">${displayText}</text>
  </svg>`;

  try {
    const base64 = browser 
      ? btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, 'utf8').toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.warn('[createFallbackImage] Error:', error);
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==';
  }
}

/**
 * Server already built complete URLs - just use with fallback if needed
 */
export function getImageWithFallback(url?: string | null, fallbackText = 'IMAGE'): string {
  return url?.trim() || createFallbackImage(fallbackText, 'book');
}

/**
 * Preload image for performance (optional)
 */
export async function preloadImage(url: string): Promise<boolean> {
  if (!browser || !url) return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Legacy compatibility export
export { createFallbackImage as createImageFallback };

