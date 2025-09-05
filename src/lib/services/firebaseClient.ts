// src/lib/services/firebaseClient.ts
import { browser } from '$app/environment';

function env(name: string): string | undefined {
  return (import.meta as any).env?.[name] || process.env?.[name];
}

let _storage: import('firebase/storage').FirebaseStorage | null = null;

export async function getClientStorage() {
  if (!browser) return null;
  if (_storage) return _storage;

  const [{ initializeApp, getApps }, { getStorage }] = await Promise.all([
    import('firebase/app'),
    import('firebase/storage')
  ]);

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        apiKey: env('VITE_FIREBASE_API_KEY'),
        authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
        projectId: env('VITE_FIREBASE_PROJECT_ID'),
        storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET')
      });

  _storage = getStorage(app);
  return _storage;
}
