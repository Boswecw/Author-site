// src/lib/actions/progressiveImage.ts
import { imageService } from '$lib/services/imageLoading';

interface ProgressiveImageOptions {
  fallback?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  preload?: boolean;
}

/**
 * Svelte action for progressive image loading with fallbacks
 * Usage: <img src="..." use:progressiveImage={{ fallback: "...", onLoad: () => {} }} />
 */
export function progressiveImage(
  img: HTMLImageElement, 
  options: ProgressiveImageOptions = {}
) {
  const { fallback, onLoad, onError, preload = false } = options;
  const originalSrc = img.src;
  
  // Normalize Firebase URLs
  const normalizedSrc = imageService.normalizeFirebaseUrl(originalSrc) || originalSrc;
  
  // Set up loading states
  let loaded = false;
  let failed = false;
  
  const handleLoad = () => {
    if (failed) return; // Don't override error state
    
    loaded = true;
    img.style.opacity = '1';
    onLoad?.();
  };
  
  const handleError = () => {
    failed = true;
    loaded = false;
    
    if (fallback) {
      img.src = fallback;
      img.style.opacity = '1';
    } else {
      img.style.opacity = '0.5'; // Dim the broken image
    }
    
    onError?.(`Failed to load image: ${normalizedSrc}`);
  };
  
  // Set initial state
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.3s ease-in-out';
  
  // Update src if normalized
  if (normalizedSrc !== originalSrc) {
    img.src = normalizedSrc;
  }
  
  // Add event listeners
  img.addEventListener('load', handleLoad);
  img.addEventListener('error', handleError);
  
  // Preload if requested
  if (preload) {
    imageService.preloadImage(normalizedSrc).then(success => {
      if (!success && !failed) {
        handleError();
      }
    });
  }
  
  // Check if already loaded (cached)
  if (img.complete && img.naturalWidth > 0) {
    handleLoad();
  }
  
  return {
    update(newOptions: ProgressiveImageOptions) {
      // Handle option updates if needed
      Object.assign(options, newOptions);
    },

    destroy() {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    }
  };
}

