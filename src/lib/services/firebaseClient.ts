import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

function env(name: string): string | undefined {
  return (import.meta as any).env?.[name] || process.env?.[name];
}

const config = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('FIREBASE_BUCKET') || env('VITE_FIREBASE_STORAGE_BUCKET')
};

const app = getApps().length ? getApps()[0] : initializeApp(config);
export const storage = getStorage(app);
export { app };
