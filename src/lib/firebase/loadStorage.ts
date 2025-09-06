// src/lib/firebase/loadStorage.ts
export const loadStorage = async () => await import('firebase/storage');

// usage
const { getStorage, ref, getDownloadURL } = await loadStorage();
