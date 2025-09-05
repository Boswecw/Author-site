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

  // ✅ FIXED: Ensure consistent Firebase Storage domain
  const config = {
    apiKey: env('VITE_FIREBASE_API_KEY'),
    authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: env('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET') || 'endless-fire-467204-n2.firebasestorage.app'
  };

  console.log('🔥 Firebase config:', { 
    projectId: config.projectId,
    storageBucket: config.storageBucket 
  });

  const app = getApps().length ? getApps()[0] : initializeApp(config);
  _storage = getStorage(app);
  
  return _storage;
}

// ✅ Helper to verify Firebase Storage URLs use correct domain
export function validateFirebaseUrl(url: string): boolean {
  if (!url) return false;
  
  const correctDomain = 'endless-fire-467204-n2.firebasestorage.app';
  const incorrectDomain = 'endless-fire-467204-n2.appspot.com';
  
  if (url.includes(incorrectDomain)) {
    console.warn('❌ Wrong Firebase domain detected:', url);
    return false;
  }
  
  return url.includes(correctDomain) || url.includes('firebasestorage.googleapis.com');
}