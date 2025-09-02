export function normalizeFirebaseUrl(url?: string | null): string | null {
  if (!url) return null;

  // Correct common Firebase Storage domain issues and parameter duplication
  let out = url
    .replace(
      'endless-fire-467204-n2.firebasestorage.app',
      'endless-fire-467204-n2.appspot.com'
    )
    .replace(
      'https://endless-fire-467204-n2.appspot.com',
      'https://firebasestorage.googleapis.com'
    )
    .replace(/([?&])alt=media&?/g, '$1alt=media');

  // Ensure the object path segment is properly encoded
  try {
    const u = new URL(out);
    const i = u.pathname.indexOf('/o/');
    if (i !== -1) {
      const before = u.pathname.slice(0, i + 3);
      const objectRaw = u.pathname.slice(i + 3);
      const fixed = encodeURIComponent(decodeURIComponent(objectRaw));
      u.pathname = before + fixed;
      out = u.toString();
    }
  } catch {}

  return out;
}

  
