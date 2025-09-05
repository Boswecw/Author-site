// Extract "object path" from a Firebase Storage URL or gs:// URL.
// Returns null if it can't find a path.
export function extractFirebasePath(input?: string | null): string | null {
  if (!input) return null;

  // If it's already a simple path like "books/Foo.png"
  if (!/^https?:\/\//i.test(input) && !/^gs:\/\//i.test(input)) {
    return input;
  }

  // gs://bucket/dir/file.ext
  const gs = /^gs:\/\/[^/]+\/(.+)$/.exec(input);
  if (gs) return decodeURIComponent(gs[1]);

  try {
    const u = new URL(input);
    // Typical REST form:
    // https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<ENCODED_PATH>?...
    if (/firebasestorage.googleapis.com$/.test(u.hostname)) {
      const parts = u.pathname.split('/'); // ['', 'v0', 'b', '<bucket>', 'o', '<ENCODED_PATH>']
      const oIdx = parts.indexOf('o');
      if (oIdx !== -1 && parts[oIdx + 1]) {
        return decodeURIComponent(parts[oIdx + 1]);
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}
