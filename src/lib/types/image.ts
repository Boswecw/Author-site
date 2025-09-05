// src/lib/types/image.ts

export type ImageType = 'book' | 'avatar' | 'logo';

export interface ImageConfig {
  width: number;
  height: number;
}

export interface ImageDimensions {
  w: number;
  h: number;
}

export interface ImageServiceInterface {
  resolveCover(input?: string | null): Promise<string>;
  preloadImage(url?: string | null): Promise<string | null>;
  getFallbackImage(type: 'book' | 'author' | 'logo', text?: string): string;
  clear(): void;
}

export interface ReliableImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  loading?: 'lazy' | 'eager';
  fallbackType?: ImageType;
  fallbackText?: string;
}

export interface ImageCache {
  storage: Map<string, Promise<string | null>>;
  loaded: Set<string>;
}