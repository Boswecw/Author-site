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

/**
 * Svelte action for lazy loading images with intersection observer
 */
export function lazyImage(img: HTMLImageElement, options: {
  src: string;
  fallback?: string;
  threshold?: number;
}) {
  const { src, fallback, threshold = 0.1 } = options;
  const normalizedSrc = imageService.normalizeFirebaseUrl(src) || src;
  
  // Set placeholder
  if (fallback) {
    img.src = fallback;
  }
  img.style.opacity = '0.5';
  img.style.transition = 'opacity 0.3s ease-in-out';
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Load the real image
        const realImg = new Image();
        realImg.onload = () => {
          img.src = normalizedSrc;
          img.style.opacity = '1';
        };
        realImg.onerror = () => {
          if (!fallback) {
            img.style.opacity = '0.3'; // Dim failed images
          }
        };
        realImg.src = normalizedSrc;
        
        observer.unobserve(img);
      }
    });
  }, { threshold });
  
  observer.observe(img);
  
  return {
    destroy() {
      observer.unobserve(img);
      observer.disconnect();
    }
  };
}

/**
 * Utility function to create responsive image sources
 */
export function createResponsiveSources(
  baseUrl: string, 
  sizes: { width: number; suffix?: string }[] = [
    { width: 400, suffix: 'sm' },
    { width: 800, suffix: 'md' },
    { width: 1200, suffix: 'lg' }
  ]
): string {
  const normalizedUrl = imageService.normalizeFirebaseUrl(baseUrl) || baseUrl;
  
  return sizes
    .map(({ width, suffix }) => {
      // For Firebase Storage, we can't resize on-the-fly, so we return the original
      // In a real app, you'd have different sized versions stored
      return `${normalizedUrl} ${width}w`;
    })
    .join(', ');
}