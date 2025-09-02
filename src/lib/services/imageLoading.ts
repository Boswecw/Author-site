// src/lib/services/imageLoading.ts
import { writable } from 'svelte/store';

/**
 * Firebase Storage URL normalization and fallback management
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
   * Normalize Firebase Storage URLs to use correct domain
   */
  normalizeFirebaseUrl(url?: string | null): string | undefined {
    if (!url) return undefined;
    
    // Fix common Firebase Storage domain issues
    return url
      .replace('endless-fire-467204-n2.firebasestorage.app', 'endless-fire-467204-n2.appspot.com')
      .replace(/([?&])alt=media&?/g, '$1alt=media'); // Clean up duplicate parameters
  }

  /**
   * Preload an image and cache the result
   */
  async preloadImage(src: string): Promise<boolean> {
    const normalizedSrc = this.normalizeFirebaseUrl(src) || src;
    
    if (this.imageCache.has(normalizedSrc)) {
      return this.imageCache.get(normalizedSrc)!;
    }

    const loadPromise = new Promise<boolean>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadingStates.set(normalizedSrc, true);
        resolve(true);
      };
      
      img.onerror = () => {
        this.loadingStates.set(normalizedSrc, false);
        resolve(false);
      };
      
      // Set crossOrigin for Firebase Storage
      if (normalizedSrc.includes('firebasestorage.googleapis.com')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = normalizedSrc;
    });

    this.imageCache.set(normalizedSrc, loadPromise);
    return loadPromise;
  }

  /**
   * Check if an image is already loaded
   */
  isImageLoaded(src: string): boolean {
    const normalizedSrc = this.normalizeFirebaseUrl(src) || src;
    return this.loadingStates.get(normalizedSrc) === true;
  }

  /**
   * Generate fallback data URLs for common image types
   */
  generateFallback(type: 'avatar' | 'book' | 'logo' | 'hero', text?: string): string {
    const svg = this.createSVGFallback(type, text);
    const base64 =
      typeof window === 'undefined'
        ? Buffer.from(svg).toString('base64')
        : btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  }

  private createSVGFallback(type: string, text?: string): string {
    const configs = {
      avatar: { width: 200, height: 200, bg: '#2C3E7F', text: text || 'AUTHOR' },
      book: { width: 300, height: 450, bg: '#7A1C1C', text: text || 'BOOK' },
      logo: { width: 56, height: 56, bg: '#F5F2E7', text: text || 'CB', textColor: '#2B2B2B', stroke: '#2B2B2B' },
      hero: { width: 1200, height: 600, bg: '#C9A86A', text: text || 'HERO' }
    };

    const config = configs[type as keyof typeof configs] || configs.avatar;
    
    return `
      <svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${config.width}" height="${config.height}" fill="${config.bg}" ${config.stroke ? `stroke="${config.stroke}" stroke-width="2"` : ''}/>
        <text x="${config.width/2}" y="${config.height/2 + 6}" font-family="serif" font-size="${Math.min(config.width, config.height) * 0.1}" font-weight="600" fill="${config.textColor || 'white'}" text-anchor="middle">${config.text}</text>
      </svg>
    `.trim();
  }

  /**
   * Create a reactive store for image loading state
   */
  createImageStore(src: string) {
    const normalizedSrc = this.normalizeFirebaseUrl(src) || src;
    const { subscribe, set, update } = writable<{
      loading: boolean;
      loaded: boolean;
      error: boolean;
      src: string;
    }>({
      loading: false,
      loaded: this.isImageLoaded(normalizedSrc),
      error: false,
      src: normalizedSrc
    });

    const load = async () => {
      update(state => ({ ...state, loading: true, error: false }));
      
      try {
        const success = await this.preloadImage(normalizedSrc);
        update(state => ({ 
          ...state, 
          loading: false, 
          loaded: success, 
          error: !success 
        }));
      } catch {
        update(state => ({ 
          ...state, 
          loading: false, 
          loaded: false, 
          error: true 
        }));
      }
    };

    // Auto-load if not already loaded
    if (!this.isImageLoaded(normalizedSrc)) {
      load();
    }

    return {
      subscribe,
      load,
      reset: () => set({
        loading: false,
        loaded: false,
        error: false,
        src: normalizedSrc
      })
    };
  }

  /**
   * Preload multiple images with progress tracking
   */
  async preloadImages(
    sources: string[], 
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ loaded: string[]; failed: string[] }> {
    const loaded: string[] = [];
    const failed: string[] = [];
    
    const promises = sources.map(async (src, index) => {
      const success = await this.preloadImage(src);
      
      if (success) {
        loaded.push(src);
      } else {
        failed.push(src);
      }
      
      onProgress?.(loaded.length + failed.length, sources.length);
      
      return success;
    });

    await Promise.allSettled(promises);
    
    return { loaded, failed };
  }

  /**
   * Clear the image cache
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadingStates.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): { size: number; loadedCount: number } {
    return {
      size: this.imageCache.size,
      loadedCount: Array.from(this.loadingStates.values()).filter(Boolean).length
    };
  }
}

// Export singleton instance
export const imageService = ImageLoadingService.getInstance();

// Common image URLs used throughout the app
export const APP_IMAGES = {
  SIGNATURE_LOGO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
  
  AUTHOR_PHOTO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58',
  
  FIREFIGHTER_PHOTO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
  
  ICONS: {
    FAITH: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
    EPIC: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025'
  }
} as const;

// Fallback data URIs for instant loading
export const FALLBACK_IMAGES = {
  SIGNATURE_LOGO: imageService.generateFallback('logo', 'CB'),
  AUTHOR_PHOTO: imageService.generateFallback('avatar', 'CWB'),
  FAITH_ICON: imageService.generateFallback('avatar', 'FAITH'),
  EPIC_ICON: imageService.generateFallback('avatar', 'EPIC'),
  BOOK_COVER: imageService.generateFallback('book', 'BOOK')
} as const;