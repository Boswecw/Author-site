// lib/utils/image.ts
import { imageService } from '$lib/services/imageLoading';

// Helper to build Firebase Storage URLs
const fb = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/${encodeURIComponent(
    path
  )}?alt=media`;

// Centralized mapping of image assets used across the app
export const IMAGES = {
  SIGNATURE_LOGO: '/file.svg',
  AUTHOR_PORTRAIT: fb('author/portrait.jpg'),
  AUTHOR_FIREFIGHTER: fb('author/firefighter.jpg'),
  BOOKS: {
    FAITH_FIRESTORM: fb('books/faith-firestorm.jpg'),
    CONVICTION_FLOOD: fb('books/conviction-in-a-flood.jpg'),
    HURRICANE_EVE: fb('books/hurricane-eve.jpg'),
    HUNTERS_FAITH: fb('books/hunters-faith.jpg'),
    HEART_OF_STORM: fb('books/heart-of-the-storm.jpg'),
    FAITH_IN_A_FIRESTORM: fb('books/faith-in-a-firestorm.jpg'),
    CONVICTION_IN_A_FLOOD: fb('books/conviction-in-a-flood.jpg'),
    THE_FAITH_OF_THE_HUNTER: fb('books/the-faith-of-the-hunter.jpg')
  }
} as const;

// Convenience wrapper so consumers don't depend on the service directly
export const preloadImage = (src: string) => imageService.preloadImage(src);

function base64EncodeUtf8(s: string) {
  if (typeof window === 'undefined') {
    return Buffer.from(s, 'utf-8').toString('base64');
  }
  // Browser-safe UTF-8 → base64
  return btoa(unescape(encodeURIComponent(s)));
}

export function createImageFallback(
  text: string,
  type: 'book' | 'author' | 'blog' = 'book',
  bgColor = '#7f1d1d',
  textColor = 'white'
): string {
  const [width, height] = (type === 'book' ? '400x600' : '300x300').split('x');
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${text}">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="serif" font-size="18" font-weight="bold"
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${base64EncodeUtf8(svg)}`;
}
