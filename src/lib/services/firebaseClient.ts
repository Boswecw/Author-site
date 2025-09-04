// src/lib/services/firebaseClient.ts - Firebase client initialization

// Helper to read environment variables safely in both Vite and Node environments
function env(name: string): string | undefined {
  return (import.meta as any).env?.[name] || process.env?.[name];
}

// Import initializeApp from Firebase. In test environments the firebase package
// may not be installed, so we ignore the missing type error.
// @ts-ignore - firebase package may be absent during tests
import { initializeApp } from 'firebase/app';

// Initialize the Firebase app using public configuration
export const firebaseApp = initializeApp({
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET')
});

