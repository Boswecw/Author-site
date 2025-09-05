// src/lib/services/imageService.ts
import { browser } from '$app/environment';
import { getClientStorage } from '$lib/services/firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';
import { normalizeFirebaseUrl } from '$lib/utils/urls';
import { createImageFallback } from '$lib/utils/image';

class ImageService {
  private cache = new Map<string, Promise<string | null>>();
  private loaded = new Set<string>();

  async resolveCover(input?: string | null): Promise<string | null> {
    if (!input) return null;
    if (/^https?:\/\//i.test(input)) {
      const u = normalizeFirebaseUrl(input) ?? input;
      return u;
    }
    if (!browser) return null; // SSR-safe

    const key = `storage:${input}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const p = this.resolveFromStorage(input);
    this.cache.set(key, p);
    return p;
  }

  private async resolveFromStorage(path: string): Promise<string | null> {
    try {
      const storage = await getClientStorage();
      if (!storage) return null;
      const url = await getDownloadURL(ref(storage, path));
      const normalized = normalizeFirebaseUrl(url) ?? url;
      this.loaded.add(normalized);
      return normalized;
    } catch (e) {
      console.warn('[ImageService] Failed to resolve', path, e);
      return null;
    }
  }

  async preloadImage(url?: string | null): Promise<string | null> {
    if (!browser || !url) return null;
    const u = normalizeFirebaseUrl(url) ?? url;
    if (this.loaded.has(u)) return u;

    return new Promise((resolve) => {
      const img = new Image();
      const tid = setTimeout(() => resolve(null), 10000);
      img.onload = () => { clearTimeout(tid); this.loaded.add(u); resolve(u); };
      img.onerror = () => { clearTimeout(tid); resolve(null); };
      if (u.includes('firebasestorage.googleapis.com')) img.crossOrigin = 'anonymous';
      img.src = u;
    });
  }

  getFallbackImage(type: 'book' | 'author' | 'logo', text = ''): string {
    type Kind = 'book' | 'avatar' | 'logo';
    const map: Record<'book' | 'author' | 'logo', Kind> = { book: 'book', author: 'avatar', logo: 'logo' };
    const label = text || (type === 'author' ? 'AUTHOR' : type.toUpperCase());
    return createImageFallback(label, map[type]);
  }

  clear() { this.cache.clear(); this.loaded.clear(); }
}

export const imageService = new ImageService();
export const resolveCover = imageService.resolveCover.bind(imageService);
export const preloadImage = imageService.preloadImage.bind(imageService);
export const getFallbackImage = imageService.getFallbackImage.bind(imageService);
