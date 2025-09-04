// src/lib/actions/progressiveImage.ts - COMPLETE FIX
import { browser } from '$app/environment';
import { createImageFallback } from '$lib/utils/image';
import type { ActionReturn } from 'svelte/action';

interface ProgressiveImageOptions {
  src: string;
  fallbackType?: 'book' | 'avatar' | 'logo';
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
  timeout?: number;
}

interface ProgressiveImageAttributes {
  'on:loaded'?: (e: CustomEvent<{ src: string }>) => void;
  'on:error'?: (e: CustomEvent<{ src: string; error: Error }>) => void;
}

/**
 * ✅ FIXED: Progressive image loading action for Svelte 5
 */
export function progressiveImage(
  node: HTMLImageElement,
  options: ProgressiveImageOptions
): ActionReturn<ProgressiveImageOptions, ProgressiveImageAttributes> {
  
  let currentSrc = '';
  let isLoading = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Load image with fallback handling
   */
  function loadImage(src: string, fallbackType: 'book' | 'avatar' | 'logo', fallbackText: string) {
    if (!browser || !src || isLoading || currentSrc === src) return;

    isLoading = true;
    currentSrc = src;

    // Set timeout for loading
    timeoutId = setTimeout(() => {
      handleError(new Error('Image loading timeout'));
    }, options.timeout || 10000);

    try {
      const img = new Image();
      
      img.onload = () => {
        if (timeoutId) clearTimeout(timeoutId);
        isLoading = false;
        
        node.src = src;
        node.dispatchEvent(new CustomEvent('loaded', { detail: { src } }));
        options.onLoad?.();
      };

      img.onerror = () => {
        if (timeoutId) clearTimeout(timeoutId);
        handleError(new Error(`Failed to load image: ${src}`));
      };

      // Start loading
      img.src = src;
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      handleError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Handle loading errors
   */
  function handleError(error: Error) {
    isLoading = false;
    
    console.warn('[progressiveImage] Load error:', error);
    
    // Set fallback image
    const fallback = createImageFallback(
      options.fallbackText || 'Loading',
      options.fallbackType || 'book'
    );
    
    node.src = fallback;
    node.dispatchEvent(new CustomEvent('error', { detail: { src: currentSrc, error } }));
    options.onError?.();
  }

  /**
   * Initialize the action
   */
  function init(opts: ProgressiveImageOptions) {
    if (!opts.src) return;
    
    loadImage(
      opts.src,
      opts.fallbackType || 'book',
      opts.fallbackText || 'Loading'
    );
  }

  // Initialize with current options
  init(options);

  return {
    update(newOptions: ProgressiveImageOptions) {
      // Only reload if src changed
      if (newOptions.src !== options.src) {
        options = newOptions;
        init(newOptions);
      } else {
        options = newOptions;
      }
    },

    destroy() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isLoading = false;
      currentSrc = '';
    }
  };
}

/**
 * ✅ FIXED: Image preloading utility for bulk operations
 */
export class ImagePreloader {
  private cache = new Map<string, boolean>();
  private loading = new Set<string>();

  /**
   * Preload a single image
   */
  async preload(src: string): Promise<boolean> {
    if (!browser || !src) return false;

    // Check cache
    if (this.cache.has(src)) {
      return this.cache.get(src) ?? false;
    }

    // Prevent duplicate loading
    if (this.loading.has(src)) {
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!this.loading.has(src)) {
            clearInterval(checkInterval);
            resolve(this.cache.get(src) ?? false);
          }
        }, 100);
      });
    }

    this.loading.add(src);

    try {
      const success = await this.loadSingleImage(src);
      this.cache.set(src, success);
      return success;
    } catch (error) {
      console.warn('[ImagePreloader] Failed to preload:', src, error);
      this.cache.set(src, false);
      return false;
    } finally {
      this.loading.delete(src);
    }
  }

  /**
   * Load single image element
   */
  private loadSingleImage(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = src;
    });
  }

  /**
   * Preload multiple images with progress callback
   */
  async preloadBatch(
    sources: (string | null | undefined)[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ loaded: string[]; failed: string[] }> {
    const validSources = sources.filter((src): src is string => 
      typeof src === 'string' && src.length > 0
    );

    if (validSources.length === 0) {
      return { loaded: [], failed: [] };
    }

    const results: { src: string; success: boolean }[] = [];
    
    for (let i = 0; i < validSources.length; i++) {
      const src = validSources[i];
      const success = await this.preload(src);
      
      results.push({ src, success });
      onProgress?.(i + 1, validSources.length);
    }

    return {
      loaded: results.filter(r => r.success).map(r => r.src),
      failed: results.filter(r => !r.success).map(r => r.src)
    };
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.loading.clear();
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();