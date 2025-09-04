// src/lib/services/firebaseClient.ts - Firebase client initialization

import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Helper to read environment variables safely in both Vite and Node environments
function env(name: string): string | undefined {
  return (import.meta as any).env?.[name] || process.env?.[name];
}

const config = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('FIREBASE_BUCKET') || env('VITE_FIREBASE_STORAGE_BUCKET')
};

// Ensure we only initialize once
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);

// Export both app and storage
export { firebaseApp };
export const storage = getStorage(firebaseApp);
