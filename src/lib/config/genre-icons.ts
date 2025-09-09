// src/lib/config/genre-icons.ts - FIXED VERSION
import { FIREBASE_IMAGES } from '$lib/services/authorImages';
import { buildIconUrl } from '$lib/utils/firebase'; // ✅ Use central util

// ✅ FIXED: Use central buildIconUrl for icons/ subfolder
const SCI_FI_ICON = buildIconUrl('sci-fi-icon.png');   // → icons/sci-fi-icon.png
const DEFAULT_ICON = buildIconUrl('default-icon.png'); // → icons/default-icon.png

export const GENRE_ICON_URLS: Record<string, string> = {
  faith: FIREBASE_IMAGES.ICONS.CHRISTIAN_FICTION,    // Already has icons/ path
  epic: FIREBASE_IMAGES.ICONS.EPIC_FANTASY,          // Already has icons/ path  
  'sci-fi': SCI_FI_ICON,                            // ✅ Now uses icons/ folder
  default: DEFAULT_ICON                              // ✅ Now uses icons/ folder
};