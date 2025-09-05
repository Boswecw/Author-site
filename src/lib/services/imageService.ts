// src/lib/services/imageService.ts
import { browser } from '$app/environment';
import { getClientStorage } from '$lib/services/firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';
import { createFallbackImage } from '$lib/utils/image';

interface ImageCacheEntry {
  url: string | null;
  timestamp: number;
  attempts: number;
}

interface LoadStats {
  total: number;
  success: number;
  failed: number;
  cached: number;
}

class ImageService {
  private cache = new Map<string, Promise<string | null>>();
  private urlCache = new Map<string, ImageCacheEntry>();
  private loaded = new Set<string>();
  private loading = new Set<string>();
  private stats: LoadStats = { total: 0, success: 0, failed: 0, cached: 0 };
  
  // Cache settings
  private readonly maxCacheSize = 100;
  private readonly cacheExpiry = 30 * 60 * 1000; // 30 minutes
  private readonly maxRetries = 2;

  /**
   * Resolve a cover image path to a usable URL
   */
  async resolveCover(input?: string | null): Promise<string> {
    if (!input) {
      return createFallbackImage('BOOK', 'book');
    }

    // If it's already a full URL, return as-is
    if (this.isFullUrl(input)) {
      return input;
    }

    // If not in browser, return fallback
    if (!browser) {
      return createFallbackImage('BOOK', 'book');
    }

    try {
      const resolved = await this.resolveFromStorage(input);
      return resolved || createFallbackImage('BOOK', 'book');
    } catch (error) {
      console.warn('[ImageService] Failed to resolve cover:', input, error);
      return createFallbackImage('BOOK', 'book');
    }
  }

  /**
   * Resolve multiple covers in batch
   */
  async resolveCovers(inputs: (string | null | undefined)[]): Promise<string[]> {
    const promises = inputs.map(input => this.resolveCover(input));
    return Promise.all(promises);
  }

  /**
   * Resolve Firebase Storage path to URL with caching and retry logic
   */
  private async resolveFromStorage(path: string): Promise<string | null> {
    const key = `storage:${path}`;
    
    // Check URL cache first
    const cached = this.urlCache.get(key);
    if (cached && this.isCacheValid(cached)) {
      this.stats.cached++;
      return cached.url;
    }

    // Check if already loading
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Start new fetch
    const promise = this.fetchFromStorageWithRetry(path);
    this.cache.set(key, promise);
    
    // Clean up promise from cache when done
    promise.finally(() => {
      this.cache.delete(key);
    });

    return promise;
  }

  /**
   * Fetch from Firebase Storage with retry logic
   */
  private async fetchFromStorageWithRetry(path: string): Promise<string | null> {
    const key = `storage:${path}`;
    const cached = this.urlCache.get(key);
    const attempts = cached?.attempts || 0;

    this.stats.total++;

    if (attempts >= this.maxRetries) {
      console.warn(`[ImageService] Max retries exceeded for: ${path}`);
      this.stats.failed++;
      return null;
    }

    try {
      const url = await this.fetchFromStorage(path);
      
      if (url) {
        // Cache successful result
        this.urlCache.set(key, {
          url,
          timestamp: Date.now(),
          attempts: 0
        });
        this.loaded.add(url);
        this.stats.success++;
        this.cleanupCache();
        return url;
      } else {
        throw new Error('No URL returned');
      }
    } catch (error) {
      // Cache failed attempt
      this.urlCache.set(key, {
        url: null,
        timestamp: Date.now(),
        attempts: attempts + 1
      });
      this.stats.failed++;
      
      console.warn(`[ImageService] Storage fetch failed (attempt ${attempts + 1}):`, path, error);
      return null;
    }
  }

  /**
   * Actually fetch from Firebase Storage
   */
  private async fetchFromStorage(path: string): Promise<string | null> {
    if (this.loading.has(path)) {
      // Wait for existing request
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.loading.has(path)) {
            clearInterval(interval);
            resolve(this.urlCache.get(`storage:${path}`)?.url || null);
          }
        }, 100);
      });
    }

    this.loading.add(path);

    try {
      const storage = await getClientStorage();
      if (!storage) {
        throw new Error('Firebase storage not available');
      }

      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } finally {
      this.loading.delete(path);
    }
  }

  /**
   * Preload an image URL to check if it loads
   */
  async preloadImage(url?: string | null, timeout: number = 10000): Promise<string | null> {
    if (!browser || !url) return null;
    if (this.loaded.has(url)) return url;

    return new Promise((resolve) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        this.loaded.add(url);
        resolve(url);
      };

      img.onerror = () => {
        cleanup();
        resolve(null);
      };

      // Set CORS for Firebase URLs
      if (url.includes('firebasestorage.googleapis.com')) {
        img.crossOrigin = 'anonymous';
      }

      img.src = url;
    });
  }

  /**
   * Preload multiple images in parallel
   */
  async preloadImages(
    urls: (string | null | undefined)[], 
    timeout: number = 10000,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ loaded: string[]; failed: string[] }> {
    const validUrls = urls.filter((url): url is string => Boolean(url));
    
    if (validUrls.length === 0) {
      return { loaded: [], failed: [] };
    }

    const results = await Promise.allSettled(
      validUrls.map(async (url, index) => {
        const result = await this.preloadImage(url, timeout);
        onProgress?.(index + 1, validUrls.length);
        return { url, success: Boolean(result) };
      })
    );

    const loaded: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          loaded.push(result.value.url);
        } else {
          failed.push(result.value.url);
        }
      } else {
        failed.push(validUrls[index]);
      }
    });

    return { loaded, failed };
  }

  /**
   * Get a fallback image for different types
   */
  getFallbackImage(type: 'book' | 'author' | 'logo', text = ''): string {
    const typeMap: Record<'book' | 'author' | 'logo', 'book' | 'avatar' | 'logo'> = {
      book: 'book',
      author: 'avatar',
      logo: 'logo'
    };

    const label = text || type.toUpperCase();
    return createFallbackImage(label, typeMap[type]);
  }

  /**
   * Get loading statistics
   */
  getStats(): LoadStats {
    return { ...this.stats };
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: ImageCacheEntry): boolean {
    return Date.now() - entry.timestamp < this.cacheExpiry;
  }

  /**
   * Check if URL is already a full URL
   */
  private isFullUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    if (this.urlCache.size <= this.maxCacheSize) return;

    // Remove expired entries first
    const now = Date.now();
    for (const [key, entry] of this.urlCache.entries()) {
      if (now - entry.timestamp > this.cacheExpiry) {
        this.urlCache.delete(key);
      }
    }

    // If still too large, remove oldest entries
    if (this.urlCache.size > this.maxCacheSize) {
      const entries = Array.from(this.urlCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
      toRemove.forEach(([key]) => this.urlCache.delete(key));
    }
  }

  /**
   * Clear all caches and reset stats
   */
  clear(): void {
    this.cache.clear();
    this.urlCache.clear();
    this.loaded.clear();
    this.loading.clear();
    this.stats = { total: 0, success: 0, failed: 0, cached: 0 };
  }

  /**
   * Clear only expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.urlCache.entries()) {
      if (now - entry.timestamp > this.cacheExpiry) {
        this.urlCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();

// Export convenience functions
export const resolveCover = imageService.resolveCover.bind(imageService);
export const resolveCovers = imageService.resolveCovers.bind(imageService);
export const preloadImage = imageService.preloadImage.bind(imageService);
export const preloadImages = imageService.preloadImages.bind(imageService);
export const getFallbackImage = imageService.getFallbackImage.bind(imageService);
export const getImageStats = imageService.getStats.bind(imageService);