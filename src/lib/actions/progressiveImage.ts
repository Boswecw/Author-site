// src/lib/actions/progressiveImage.ts
import { browser } from '$app/environment';
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
 * CRITICAL FIX: Progressive image loading action for your project structure
 */
export function progressiveImage(
  node: HTMLImageElement,
  options: ProgressiveImageOptions
): ActionReturn<ProgressiveImageOptions, ProgressiveImageAttributes> {
  
  let currentSrc = '';
  let isLoading = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Generate fallback SVG image
   */
  function generateFallback(type: 'book' | 'avatar' | 'logo', text: string): string {
    if (!browser) {
      return `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial" font-size="24" fill="#6b7280">Loading...</text></svg>')}`;
    }

    try {
      const colors = {
        book: { bg: '#dc2626', text: '#ffffff' },
        avatar: { bg: '#059669', text: '#ffffff' },
        logo: { bg: '#7c3aed', text: '#ffffff' }
      };

      const { bg, text: textColor } = colors[type];
      const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 200, h: 200 };

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
        <rect width="100%" height="100%" fill="${bg}"/>
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">${text}</text>
      </svg>`;

      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (error) {
      console.warn('[progressiveImage] Error generating fallback:', error);
      return '';
    }
  }

  /**
   * Load image progressively
   */
  async function loadImage(src: string, fallbackType: string, fallbackText: string): Promise<void> {
    if (!browser || !src || isLoading) return;

    // Prevent loading the same image again
    if (currentSrc === src) return;

    isLoading = true;
    currentSrc = src;

    // Set fallback immediately
    const fallback = generateFallback(fallbackType as any, fallbackText);
    node.src = fallback;
    node.style.opacity = '0.75';

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set up timeout
    const timeout = options.timeout || 10000;
    timeoutId = setTimeout(() => {
      isLoading = false;
      const error = new Error(`Image load timeout: ${src}`);
      node.dispatchEvent(new CustomEvent('error', { detail: { src, error } }));
      options.onError?.();
    }, timeout);

    try {
      // Preload the actual image
      const img = new Image();
      
      img.onload = () => {
        if (timeoutId) clearTimeout(timeoutId);
        
        // Update the actual image
        node.src = src;
        node.style.opacity = '1';
        isLoading = false;
        
        // Dispatch success event
        node.dispatchEvent(new CustomEvent('loaded', { detail: { src } }));
        options.onLoad?.();
      };

      img.onerror = () => {
        if (timeoutId) clearTimeout(timeoutId);
        isLoading = false;
        
        const error = new Error(`Failed to load image: ${src}`);
        node.dispatchEvent(new CustomEvent('error', { detail: { src, error } }));
        options.onError?.();
      };

      // Start loading
      img.src = src;
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      isLoading = false;
      
      console.warn('[progressiveImage] Load error:', error);
      node.dispatchEvent(new CustomEvent('error', { detail: { src, error } }));
      options.onError?.();
    }
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
 * CRITICAL FIX: Image preloading utility for bulk operations
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
    const validSources = sources.filter((src): src is string => Boolean(src && typeof src === 'string'));
    const loaded: string[] = [];
    const failed: string[] = [];
    
    const promises = validSources.map(async (src) => {
      const success = await this.preload(src);
      
      if (success) {
        loaded.push(src);
      } else {
        failed.push(src);
      }
      
      onProgress?.(loaded.length + failed.length, validSources.length);
      return success;
    });

    await Promise.allSettled(promises);
    return { loaded, failed };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loading.size
    };
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();