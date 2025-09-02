// src/lib/utils/urls.ts
/**
 * Normalize Firebase Storage URLs to the canonical REST download form and
 * fix common issues (legacy domain, double-encoding, stray spaces).
 */
export function normalizeFirebaseUrl(url?: string | null): string | null {
    if (!url) return null;
  
    // 1) Swap legacy domain → canonical host
    let out = url
      .replace('endless-fire-467204-n2.firebasestorage.app', 'endless-fire-467204-n2.appspot.com')
      // If someone pasted the bucket host, prefer the REST endpoint
      .replace('https://endless-fire-467204-n2.appspot.com', 'https://firebasestorage.googleapis.com');
  
    // 2) Ensure object path is single-encoded when using /o/<object>
    try {
      const u = new URL(out);
      const oIndex = u.pathname.indexOf('/o/');
      if (oIndex !== -1) {
        const before = u.pathname.slice(0, oIndex + 3);
        const objectPathRaw = u.pathname.slice(oIndex + 3);
        // Decode once, then encode once (fixes double-encoding and stray spaces)
        const fixedObject = encodeURIComponent(decodeURIComponent(objectPathRaw));
        u.pathname = before + fixedObject;
        out = u.toString();
      }
    } catch {
      // If URL() fails (non-absolute), just return best-effort string
    }
  
    return out;
  }
  