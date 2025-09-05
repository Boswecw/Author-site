// src/lib/utils/urls.ts

/**
 * Return true if the URL points at Firebase Storage REST endpoint.
 */
export function isFirebaseStorageUrl(u: URL): boolean {
  return /(^|\.)firebasestorage\.googleapis\.com$/.test(u.hostname);
}

/**
 * Normalize a Firebase Storage REST URL:
 * - If bucket segment uses ".firebasestorage.app", rewrite to ".appspot.com"
 * - Ensure alt=media is present (to get the raw file)
 * - Preserve any other query params
 *
 * If the input is not an http(s) URL, or not a Firebase Storage REST URL,
 * this returns the original string.
 */
export function normalizeFirebaseUrl(input?: string | null): string | null {
  if (!input) return null;

  // Non-http inputs (e.g., "books/Foo.png" or "gs://bucket/obj") are left alone.
  if (!/^https?:\/\//i.test(input)) return input;

  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return input;
  }

  if (!isFirebaseStorageUrl(u)) {
    // Not a Firebase Storage REST URL; leave it as-is.
    return u.toString();
  }

  // Path looks like: /v0/b/<bucket>/o/<encodedPath>
  const parts = u.pathname.split('/'); // ["", "v0", "b", "<bucket>", "o", "<encodedPath>"]
  const bIdx = parts.indexOf('b');
  if (bIdx !== -1 && parts[bIdx + 1]) {
    const bucket = parts[bIdx + 1];

    // If someone stored a malformed bucket like "<name>.firebasestorage.app", fix it.
    if (bucket.endsWith('.firebasestorage.app')) {
      const fixed = bucket.replace(/\.firebasestorage\.app$/i, '.appspot.com');
      parts[bIdx + 1] = fixed;
      u.pathname = parts.join('/');
    }
  }

  // Ensure alt=media is present (don’t clobber other params)
  if (!u.searchParams.has('alt')) {
    u.searchParams.set('alt', 'media');
  }

  return u.toString();
}

/**
 * Extract the Firebase Storage *object path* from many possible forms:
 *  - "books/Foo.png"           -> "books/Foo.png"
 *  - "gs://bucket/books/Foo"   -> "books/Foo"
 *  - REST URL                  -> decoded "books/Foo"
 *
 * Returns null if we can't find a path.
 */
export function extractFirebasePath(input?: string | null): string | null {
  if (!input) return null;

  // Already a plain path?
  if (!/^https?:\/\//i.test(input) && !/^gs:\/\//i.test(input)) {
    return input;
  }

  // gs://bucket/dir/file.ext
  const gs = /^gs:\/\/[^/]+\/(.+)$/.exec(input);
  if (gs) return decodeURIComponent(gs[1]);

  try {
    const u = new URL(input);
    if (isFirebaseStorageUrl(u)) {
      // REST path: /v0/b/<bucket>/o/<ENCODED_PATH>
      const parts = u.pathname.split('/');
      const oIdx = parts.indexOf('o');
      if (oIdx !== -1 && parts[oIdx + 1]) {
        return decodeURIComponent(parts[oIdx + 1]);
      }
    }
  } catch {
    /* ignore parse errors */
  }

  return null;
}
