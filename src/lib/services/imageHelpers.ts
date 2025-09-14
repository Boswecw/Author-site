// src/lib/utils/imageHelpers.ts - SIMPLE VERSION
import { createFallbackImage } from '$lib/utils/image';

export function getImageWithFallback(url: string | null | undefined): string {
  if (!url) return createFallbackImage('BOOK', 'book');
  if (url.startsWith('data:')) return url; // Already a fallback
  return url; // Use server-built URL directly
}

export function preloadImage(url?: string | null): Promise<boolean> {
  if (!url) return Promise.resolve(false);
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
