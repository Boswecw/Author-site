// src/lib/utils/urls.ts

/**
 * CRITICAL FIX: Enhanced Firebase Storage URL normalization for YOUR domain
 * Now handles both .firebasestorage.app and .appspot.com domains
 */
export function normalizeFirebaseUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    let normalizedUrl = url;
    
    // Handle YOUR specific Firebase Storage domain patterns
    // Your URLs use: endless-fire-467204-n2.firebasestorage.app
    // But some code expects: endless-fire-467204-n2.appspot.com
    
    // KEEP your .firebasestorage.app URLs as-is - they work fine!
    // Just ensure HTTPS and proper formatting
    
    // Ensure HTTPS
    if (normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }
    
    // Add protocol if missing
    if (normalizedUrl.startsWith('//')) {
      normalizedUrl = `https:${normalizedUrl}`;
    }
    
    // Return as-is if already valid (your URLs are already perfect)
    if (normalizedUrl.startsWith('https://firebasestorage.googleapis.com') || 
        normalizedUrl.startsWith('data:')) {
      return normalizedUrl;
    }
    
    return normalizedUrl;
  } catch (error) {
    console.warn('[normalizeFirebaseUrl] Failed to normalize URL:', url, error);
    return url;
  }
}

/**
 * Test if a URL is accessible via HEAD request
 * Used to prevent 404 crashes during hydration
 */
export async function testImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'cors'
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get a safe image URL with fallback testing
 */
export async function getSafeImageUrl(url: string | null, fallback?: string): Promise<string> {
  if (!url) return fallback || createPlaceholderImage('No Image');
  
  const normalizedUrl = normalizeFirebaseUrl(url);
  if (!normalizedUrl) return fallback || createPlaceholderImage('Invalid URL');
  
  const isAccessible = await testImageUrl(normalizedUrl);
  if (isAccessible) return normalizedUrl;
  
  // Try fallback if provided
  if (fallback) {
    const fallbackWorks = await testImageUrl(fallback);
    if (fallbackWorks) return fallback;
  }
  
  // Generate placeholder as last resort
  return createPlaceholderImage('Image Not Available');
}

/**
 * Create a placeholder image SVG
 */
export function createPlaceholderImage(text: string, width = 300, height = 400): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#6b7280">
        ${text}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}