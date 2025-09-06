import { getDownloadURL, ref, type FirebaseStorage } from 'firebase/storage';
import { storageDefault, storageFirebasestorage, storageAppspot } from '$lib/firebaseClient';

const STORAGES: FirebaseStorage[] = [storageDefault, storageFirebasestorage, storageAppspot];

function isFirebaseHttpUrl(u: string) {
  return /^https?:\/\/.*firebasestorage\.googleapis\.com/i.test(u);
}
function isGsUrl(u: string) {
  return /^gs:\/\//i.test(u);
}
function extractObjectFromFirebaseHttp(u: string): string | null {
  // https.../o/<ENCODED>?...
  const m = u.match(/\/o\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
function extractObjectFromGs(u: string): string | null {
  // gs://bucket/path/to/object.png -> return "path/to/object.png"
  const m = u.match(/^gs:\/\/[^/]+\/(.+)$/i);
  return m ? m[1] : null;
}

function candidatesFor(path: string): string[] {
  const c = new Set<string>();
  c.add(path);
  c.add(path.replace(/ /g, '_'));
  c.add(path.replace(/ /g, '%20'));
  if (/Hurrican_/i.test(path)) c.add(path.replace(/Hurrican_/i, 'Hurricane_'));
  return [...c];
}

async function tryAll(storages: FirebaseStorage[], objectPath: string): Promise<string | null> {
  for (const s of storages) {
    try {
      const url = await getDownloadURL(ref(s, objectPath));
      return url;
    } catch {}
  }
  return null;
}

export async function resolveFirebaseImage(raw?: string | null): Promise<string> {
  if (!raw) throw new Error('No image path');

  // Pass-through non-Firebase absolute URLs
  if (/^https?:\/\//i.test(raw) && !isFirebaseHttpUrl(raw)) return raw;

  // Firebase 'https' URL: extract object name and resolve
  if (isFirebaseHttpUrl(raw)) {
    const obj = extractObjectFromFirebaseHttp(raw);
    if (obj) {
      const tries = candidatesFor(obj);
      for (const candidate of tries) {
        const url = await tryAll(STORAGES, candidate);
        if (url) return url;
      }
    }
    // if we couldn’t parse, just return the original — <img onerror> will try fallback
    return raw;
  }

  // gs:// URL: extract object name and resolve
  if (isGsUrl(raw)) {
    const obj = extractObjectFromGs(raw);
    if (obj) {
      const tries = candidatesFor(obj);
      for (const candidate of tries) {
        const url = await tryAll(STORAGES, candidate);
        if (url) return url;
      }
    }
    throw new Error(`Failed to resolve gs url: ${raw}`);
  }

  // Bare filename or relative path
  const tries = candidatesFor(raw);
  for (const candidate of tries) {
    const url = await tryAll(STORAGES, candidate);
    if (url) return url;
  }

  throw new Error(`Firebase image not found (tried: ${tries.join(', ')})`);
}
