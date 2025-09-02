// src/lib/utils/urls.ts
/**
 * Normalize Firebase Storage URLs:
 * - swap legacy *.firebasestorage.app -> *.appspot.com
 * - fix double-encoding/spaces in the /o/<object> segment
 */
export function normalizeFirebaseUrl(url?: string | null): string | null {
    if (!url) return null;
  
    let out = url.trim();
  
    // 1) Swap legacy domain → canonical host
    out = out.replace(
      /endless-fire-467204-n2\.firebasestorage\.app/gi,
      'endless-fire-467204-n2.appspot.com'
    );
  
    // 2) Ensure object path is single-encoded when using /o/<object>
    try {
      const u = new URL(out);
      const oIndex = u.pathname.indexOf('/o/');
      if (oIndex !== -1) {
        const before = u.pathname.slice(0, oIndex + 3);
        const objectPathRaw = u.pathname.slice(oIndex + 3);
        // Decode once, then encode once (fixes %2520 or raw spaces)
        const fixedObject = encodeURIComponent(decodeURIComponent(objectPathRaw));
        u.pathname = before + fixedObject;
        out = u.toString();
      }
    } catch {
      // If URL() fails (not absolute), just return best-effort string
    }
  
    return out;
  }
  