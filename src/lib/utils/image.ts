// src/lib/utils/image.ts
import { browser } from '$app/environment';
import { getClientStorage } from '$lib/services/firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Create a fallback SVG image for when images fail to load
 */
export function createFallbackImage(
  text: string,
  type: 'book' | 'avatar' | 'logo'
): string {
  const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 300, h: 300 };
  const displayText = text.length > 10 ? text.substring(0, 10) + '…' : text;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="20" fill="#6b7280">${displayText}</text>
  </svg>`;

  try {
    const base64 = browser
      ? btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, 'utf8').toString('base64');
    
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.warn('[createFallbackImage] Error creating fallback:', error);
    // Return a simple gray placeholder if SVG creation fails
    const simpleSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>';
    try {
      const simpleBase64 = browser ? btoa(simpleSvg) : Buffer.from(simpleSvg, 'utf8').toString('base64');
      return `data:image/svg+xml;base64,${simpleBase64}`;
    } catch {
      // Ultimate fallback - return empty data URL
      return 'data:image/svg+xml;base64,';
    }
  }
}

/**
 * Generate filename variants to handle common typos and naming inconsistencies
 */
function getFilenameVariants(filename: string): string[] {
  const variants = new Set<string>();
  
  // Add original filename
  variants.add(filename);
  
  // Handle common typos and variations
  const typoFixes = [
    // Hurricane vs Hurrican typo
    { from: /Hurrican_/gi, to: 'Hurricane_' },
    { from: /Hurricane_/gi, to: 'Hurrican_' },
    // Space handling
    { from: / /g, to: '_' },
    { from: /_/g, to: ' ' },
    { from: / /g, to: '%20' },
    // Case variations
    { from: /([a-z])([A-Z])/g, to: '$1_$2' },
  ];
  
  typoFixes.forEach(fix => {
    variants.add(filename.replace(fix.from, fix.to));
  });
  
  // Add variations with and without file extensions
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const extension = filename.match(/\.[^/.]+$/)?.[0] || '';
  
  if (extension) {
    variants.add(nameWithoutExt + extension.toLowerCase());
    variants.add(nameWithoutExt + extension.toUpperCase());
  }
  
  return Array.from(variants);
}

/**
 * Resolve Firebase Storage paths to download URLs with retry logic
 */
export async function resolveFirebaseImage(path: string): Promise<string | null> {
  if (!browser || !path) {
    console.log('[resolveFirebaseImage] Skipping - not in browser or no path');
    return null;
  }

  try {
    // If it's already a full URL, return as-is
    if (/^https?:\/\//i.test(path)) {
      console.log(`[resolveFirebaseImage] Returning full URL: ${path}`);
      return path;
    }

    const storage = await getClientStorage();
    if (!storage) {
      console.warn('[resolveFirebaseImage] Storage client not available');
      return null;
    }

    console.log(`[resolveFirebaseImage] Attempting to resolve: ${path}`);
    
    // Try original path first
    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`[resolveFirebaseImage] ✅ Success with original path: ${path}`);
      return downloadURL;
    } catch (originalError) {
      console.warn(`[resolveFirebaseImage] Original path failed: ${path}`, originalError);
      
      // Try filename variants if original fails
      const variants = getFilenameVariants(path);
      console.log(`[resolveFirebaseImage] Trying ${variants.length} variants for: ${path}`);
      
      for (const variant of variants) {
        if (variant === path) continue; // Skip original, already tried
        
        try {
          const variantRef = ref(storage, variant);
          const downloadURL = await getDownloadURL(variantRef);
          console.log(`[resolveFirebaseImage] ✅ Success with variant: ${variant}`);
          return downloadURL;
        } catch (variantError) {
          console.log(`[resolveFirebaseImage] Variant failed: ${variant}`);
        }
      }
      
      throw originalError; // Re-throw original error if all variants fail
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[resolveFirebaseImage] Failed to resolve: ${path}`, {
      error: errorMessage,
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

/**
 * Book cover resolver with enhanced error handling and logging
 */
export async function resolveCover(coverPath?: string | null): Promise<string> {
  console.log(`[resolveCover] Input: ${coverPath}`);
  
  if (!coverPath) {
    console.log('[resolveCover] No cover path provided, using fallback');
    return createFallbackImage('BOOK', 'book');
  }

  try {
    const resolvedUrl = await resolveFirebaseImage(coverPath);
    
    if (resolvedUrl) {
      console.log(`[resolveCover] ✅ Resolved: ${coverPath} -> ${resolvedUrl.substring(0, 100)}...`);
      return resolvedUrl;
    } else {
      console.warn(`[resolveCover] ⚠️ Failed to resolve: ${coverPath}, using fallback`);
      return createFallbackImage('BOOK', 'book');
    }
  } catch (error) {
    console.error(`[resolveCover] ❌ Error resolving: ${coverPath}`, error);
    return createFallbackImage('BOOK', 'book');
  }
}

/**
 * Batch resolve multiple covers with progress tracking
 */
export async function resolveCovers(coverPaths: (string | null | undefined)[]): Promise<string[]> {
  console.log(`[resolveCovers] Resolving ${coverPaths.length} covers`);
  
  const promises = coverPaths.map(async (path, index) => {
    try {
      const result = await resolveCover(path);
      console.log(`[resolveCovers] ${index + 1}/${coverPaths.length} completed`);
      return result;
    } catch (error) {
      console.error(`[resolveCovers] Error resolving cover ${index + 1}:`, error);
      return createFallbackImage('BOOK', 'book');
    }
  });
  
  const results = await Promise.all(promises);
  console.log(`[resolveCovers] ✅ All ${coverPaths.length} covers resolved`);
  return results;
}

/**
 * Preload image to improve perceived performance
 */
export async function preloadImage(url: string): Promise<boolean> {
  if (!browser) return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log(`[preloadImage] ✅ Preloaded: ${url.substring(0, 50)}...`);
      resolve(true);
    };
    img.onerror = () => {
      console.warn(`[preloadImage] ❌ Failed to preload: ${url.substring(0, 50)}...`);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Test if an image URL is accessible
 */
export async function testImageUrl(url: string): Promise<boolean> {
  if (!browser) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const isAccessible = response.ok;
    console.log(`[testImageUrl] ${isAccessible ? '✅' : '❌'} ${url.substring(0, 50)}...`);
    return isAccessible;
  } catch (error) {
    console.warn(`[testImageUrl] ❌ Network error for: ${url.substring(0, 50)}...`, error);
    return false;
  }
}

/**
 * Pre-defined fallback images
 */
export const FALLBACK_IMAGES = {
  BOOK_COVER: createFallbackImage('BOOK', 'book'),
  AUTHOR_PHOTO: createFallbackImage('AUTHOR', 'avatar'),
  LOGO: createFallbackImage('CB', 'logo')
} as const;

/**
 * Legacy compatibility exports
 */
export { createFallbackImage as createImageFallback };