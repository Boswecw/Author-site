import { FIREBASE_IMAGES } from '$lib/services/imageLoading';
import { normalizeFirebaseUrl } from '$lib/utils/urls';

const SCI_FI_ICON = normalizeFirebaseUrl('https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/sci-fi-icon.png?alt=media&token=b26abe91-c816-41e4-ab95-086080369bd1')!;
const DEFAULT_ICON = normalizeFirebaseUrl('https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/default-icon.png?alt=media')!;

export const GENRE_ICON_URLS: Record<string, string> = {
  faith: FIREBASE_IMAGES.ICONS.CHRISTIAN_FICTION,
  epic: FIREBASE_IMAGES.ICONS.EPIC_FANTASY,
  'sci-fi': SCI_FI_ICON,
  default: DEFAULT_ICON
};
