// src/lib/utils/urls.ts - COMPLETE FIX
/**
 * ✅ FIXED: Normalize Firebase Storage URLs
 * Handles various Firebase URL formats and ensures consistent access
 */
export function normalizeFirebaseUrl(url?: string | null): string | null {
	if (!url || typeof url !== 'string') return null;
	
	try {
	  // Already normalized or not a Firebase URL
	  if (!url.includes('firebase')) return url;
	  
	  // Convert firebasestorage.app to appspot.com (more reliable)
	  let normalized = url.replace(
		/https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^\/]+)\.firebasestorage\.app/,
		'https://firebasestorage.googleapis.com/v0/b/$1.appspot.com'
	  );
	  
	  // Ensure alt=media parameter is present for direct access
	  if (normalized.includes('firebasestorage.googleapis.com')) {
		const urlObj = new URL(normalized);
		if (!urlObj.searchParams.has('alt')) {
		  urlObj.searchParams.set('alt', 'media');
		  normalized = urlObj.toString();
		}
	  }
	  
	  return normalized;
	} catch (error) {
	  console.warn('[normalizeFirebaseUrl] Invalid URL:', url, error);
	  return url; // Return original if parsing fails
	}
  }
  
  /**
   * ✅ Check if URL is a Firebase Storage URL
   */
  export function isFirebaseStorageUrl(url?: string | null): boolean {
	if (!url || typeof url !== 'string') return false;
	return url.includes('firebasestorage.googleapis.com') || 
		   url.includes('firebase') && url.includes('storage');
  }
  
  /**
   * ✅ Get Firebase storage bucket from URL
   */
  export function getFirebaseBucket(url?: string | null): string | null {
	if (!url || !isFirebaseStorageUrl(url)) return null;
	
	const match = url.match(/\/b\/([^\/]+)\./);
	return match ? match[1] : null;
  }
  
  /**
   * ✅ Validate that URL is accessible (basic check)
   */
  export function isValidUrl(url?: string | null): boolean {
	if (!url || typeof url !== 'string') return false;
	
	try {
	  new URL(url);
	  return true;
	} catch {
	  return false;
	}
  }
  
  /**
   * ✅ FIXED: Legacy function name for backward compatibility
   * This is the same as normalizeFirebaseUrl but with the old name
   */
  export function toFirebaseDownloadIfNeeded(url?: string | null): string | null {
	return normalizeFirebaseUrl(url);
  }