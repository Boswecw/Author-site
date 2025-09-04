// src/lib/services/imageLoading.ts
import { normalizeFirebaseUrl, createPlaceholderImage } from '$lib/utils/urls';

/**
 * Simple image loading service for your standardized Firebase URLs
 */
export class ImageLoadingService {
  private static instance: ImageLoadingService;
  private imageCache = new Map<string, Promise<boolean>>();
  private loadingStates = new Map<string, boolean>();

  static getInstance(): ImageLoadingService {
    if (!ImageLoadingService.instance) {
      ImageLoadingService.instance = new ImageLoadingService();
    }
    return ImageLoadingService.instance;
  }

  /**
   * Preload an image and cache the result
   */
  async preloadImage(src: string): Promise<boolean> {
    const normalizedSrc = normalizeFirebaseUrl(src);
    if (!normalizedSrc) return false;
    
    if (this.imageCache.has(normalizedSrc)) {
      return this.imageCache.get(normalizedSrc)!;
    }

    const loadPromise = new Promise<boolean>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadingStates.set(normalizedSrc, true);
        resolve(true);
      };
      
      img.onerror = (error) => {
        console.warn('[ImageLoading] Failed to load:', normalizedSrc, error);
        this.loadingStates.set(normalizedSrc, false);
        resolve(false);
      };
      
      // Set crossOrigin for Firebase Storage
      img.crossOrigin = 'anonymous';
      img.src = normalizedSrc;
    });

    this.imageCache.set(normalizedSrc, loadPromise);
    return loadPromise;
  }

  /**
   * Check if an image is loaded successfully
   */
  isImageLoaded(src: string): boolean {
    const normalizedSrc = normalizeFirebaseUrl(src);
    if (!normalizedSrc) return false;
    return this.loadingStates.get(normalizedSrc) === true;
  }

  /**
   * Generate fallback placeholder images
   */
  generateFallback(type: 'book' | 'avatar' | 'logo', text?: string): string {
    const colors = {
      book: { bg: '#f3f4f6', border: '#e5e7eb', text: '#6b7280' },
      avatar: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
      logo: { bg: '#ecfccb', border: '#65a30d', text: '#365314' }
    };

    const { bg, border, text: textColor } = colors[type];
    const displayText = text || type.toUpperCase();

    const svg = `
      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="system-ui, sans-serif" font-size="16" font-weight="500" fill="${textColor}">
          ${displayText}
        </text>
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Batch preload multiple images
   */
  async preloadImages(
    sources: (string | null | undefined)[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ loaded: string[]; failed: string[] }> {
    const validSources = sources.filter((src): src is string => Boolean(src));
    const loaded: string[] = [];
    const failed: string[] = [];
    
    const promises = validSources.map(async (src) => {
      const success = await this.preloadImage(src);
      
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
   * Clear the cache
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadingStates.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): { cached: number; loaded: number } {
    return {
      cached: this.imageCache.size,
      loaded: Array.from(this.loadingStates.values()).filter(Boolean).length
    };
  }
}

// Export singleton instance
export const imageService = ImageLoadingService.getInstance();

// Fallback images for instant loading
export const FALLBACK_IMAGES = {
  BOOK_COVER: imageService.generateFallback('book', 'BOOK'),
  AUTHOR_PHOTO: imageService.generateFallback('avatar', 'AUTHOR'),
  LOGO: imageService.generateFallback('logo', 'CB')
} as const;