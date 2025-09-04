import { getDownloadURL, getStorage, ref } from 'firebase/storage';

/**
 * Resolve a cover image path to a full URL.
 * - Returns `null` for falsy input.
 * - Returns the original value if it's already an HTTP(S) URL.
 * - Otherwise treats the value as a Firebase storage path and resolves it
 *   using `getDownloadURL`.
 */
export async function resolveCover(path?: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const storageRef = ref(getStorage(), path);
  return getDownloadURL(storageRef);
}
