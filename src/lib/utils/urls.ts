// src/lib/utils/urls.ts
/**
 * Simple URL normalizer for your standardized Firebase Storage URLs
 * All URLs are now clean and consistent - no complex fixes needed
 */
export function normalizeFirebaseUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const cleanUrl = url.trim();
  
  // Your URLs are already perfect - just ensure HTTPS
  if (cleanUrl.startsWith('http://')) {
    return cleanUrl.replace('http://', 'https://');
  }
  
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }
  
  // Return as-is for valid Firebase Storage URLs
  if (cleanUrl.startsWith('https://firebasestorage.googleapis.com') || 
      cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  
  return cleanUrl;
}

/**
 * Test if a Firebase Storage URL is accessible
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
 * Create a simple placeholder SVG for failed images
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