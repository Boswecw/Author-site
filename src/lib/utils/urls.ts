// src/lib/utils/urls.ts - FIXED to handle both domains
export function sanitizeFirebaseUrl(u?: string | null): string | null {
  if (!u) return null;
  
  let cleaned = u.trim().replace(/^['"]+|['"]+$/g, '').replace(/%22$/, '');
  
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // If decoding fails, use original
  }
  
  return cleaned;
}

export function normalizeFirebaseUrl(u?: string | null): string | null {
  return sanitizeFirebaseUrl(u);
}

/**
 * ✅ FIXED: Convert Firebase URLs to working format
 */
export function toFirebaseDownloadIfNeeded(u?: string | null): string | null {
  const url = sanitizeFirebaseUrl(u);
  if (!url) return null;

  try {
    const uo = new URL(url);
    
    // ✅ FIX: Convert old appspot.com URLs to firebasestorage.app
    if (uo.hostname === 'firebasestorage.googleapis.com' && uo.pathname.startsWith('/v0/b/')) {
      // Extract bucket name from path
      const pathParts = uo.pathname.split('/');
      const bucketName = pathParts[3]; // /v0/b/{bucket}/o/...
      
      // If it's the old appspot.com format, convert to firebasestorage.app
      if (bucketName.endsWith('.appspot.com')) {
        const newBucket = bucketName.replace('.appspot.com', '.firebasestorage.app');
        uo.pathname = uo.pathname.replace(bucketName, newBucket);
        return uo.toString();
      }
      
      return url; // Already correct format
    }
    
    // Handle gs:// URLs
    if (url.startsWith('gs://')) {
      const without = url.slice(5);
      const i = without.indexOf('/');
      const bucket = i === -1 ? without : without.slice(0, i);
      const objectPath = i === -1 ? '' : without.slice(i + 1);
      
      // Use the correct firebasestorage.app domain
      const correctBucket = bucket.endsWith('.appspot.com') 
        ? bucket.replace('.appspot.com', '.firebasestorage.app')
        : bucket;
      
      const encoded = encodeURIComponent(objectPath);
      return `https://firebasestorage.googleapis.com/v0/b/${correctBucket}/o/${encoded}?alt=media`;
    }
    
    // Handle .firebasestorage.app URLs (correct format)
    if (uo.hostname.endsWith('.firebasestorage.app')) {
      const bucket = uo.hostname;
      const rawPath = uo.pathname.replace(/^\/o\//, '');
      const encoded = encodeURIComponent(rawPath);
      const params = new URLSearchParams(uo.search);
      if (!params.has('alt')) params.set('alt', 'media');
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?${params.toString()}`;
    }
  } catch (error) {
    console.warn('URL parsing failed:', error);
  }

  return url;
}