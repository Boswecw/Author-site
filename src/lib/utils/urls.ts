export function normalizeFirebaseUrl(url?: string | null): string | null {
    if (!url) return null;
    let out = url
      .replace('endless-fire-467204-n2.firebasestorage.app', 'endless-fire-467204-n2.appspot.com')
      .replace('https://endless-fire-467204-n2.appspot.com', 'https://firebasestorage.googleapis.com');
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
  