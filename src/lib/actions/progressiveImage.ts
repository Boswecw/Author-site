// src/lib/actions/progressiveImage.ts
import { imageService } from '$lib/services/imageLoading';
import { normalizeFirebaseUrl, createPlaceholderImage } from '$lib/utils/urls';

interface ProgressiveImageOptions {
  fallback?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  placeholder?: boolean;
}

/**
 * Progressive image loading action for your standardized Firebase URLs
 * Usage: <img src={url} use:progressiveImage />
 */
export function progressiveImage(
  img: HTMLImageElement,
  options: ProgressiveImageOptions = {}
) {
  const { fallback, onLoad, onError, placeholder = true } = options;
  
  let originalSrc = img.src;
  let isDestroyed = false;

  async function loadImage() {
    if (isDestroyed || !originalSrc) return;

    const normalizedSrc = normalizeFirebaseUrl(originalSrc);
    if (!normalizedSrc) {
      handleError(new Error('Invalid URL'));
      return;
    }

    // Show placeholder while loading
    if (placeholder) {
      img.src = createPlaceholderImage('Loading...', img.width || 300, img.height || 400);
      img.classList.add('img-loading');
    }

    try {
      // Preload the image
      const success = await imageService.preloadImage(normalizedSrc);
      
      if (isDestroyed) return;

      if (success) {
        // Image loaded successfully
        img.src = normalizedSrc;
        img.classList.remove('img-loading');
        img.classList.add('img-loaded');
        onLoad?.();
      } else {
        handleError(new Error('Failed to load image'));
      }
    } catch (error) {
      if (!isDestroyed) {
        handleError(error);
      }
    }
  }

  function handleError(error: any) {
    if (isDestroyed) return;
    
    console.warn('[progressiveImage] Error loading:', originalSrc, error);
    
    // Try fallback if provided
    if (fallback) {
      img.src = fallback;
    } else {
      // Use placeholder with error message
      img.src = createPlaceholderImage('Image Error', img.width || 300, img.height || 400);
    }
    
    img.classList.remove('img-loading');
    img.classList.add('img-error');
    onError?.(error);
  }

  // Start loading
  loadImage();

  return {
    update(newOptions: ProgressiveImageOptions) {
      Object.assign(options, newOptions);
      
      // If src changed, reload
      if (img.src !== originalSrc) {
        originalSrc = img.src;
        loadImage();
      }
    },
    
    destroy() {
      isDestroyed = true;
      img.classList.remove('img-loading', 'img-loaded', 'img-error');
    }
  };
}

/**
 * Simple image preloader function
 */
export async function preloadBookCovers(books: Array<{ cover?: string | null }>) {
  const covers = books
    .map(book => book.cover)
    .filter((cover): cover is string => Boolean(cover));
    
  if (covers.length === 0) return;
  
  console.log('[preloadBookCovers] Preloading', covers.length, 'covers...');
  
  const { loaded, failed } = await imageService.preloadImages(covers);
  
  console.log('[preloadBookCovers] Loaded:', loaded.length, 'Failed:', failed.length);
  
  if (failed.length > 0) {
    console.warn('[preloadBookCovers] Failed to load:', failed);
  }
}