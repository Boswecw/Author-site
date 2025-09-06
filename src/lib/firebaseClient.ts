// src/lib/firebaseClient.ts
import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET, // keep whatever you already set
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID
};

// ✅ Initialize once
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ✅ Default storage from config
export const storageDefault = getStorage(app);

// ✅ Explicit alternates (try both domains)
export const storageFirebasestorage = getStorage(app, 'gs://endless-fire-467204-n2.firebasestorage.app');
export const storageAppspot = getStorage(app, 'gs://endless-fire-467204-n2.appspot.com');
