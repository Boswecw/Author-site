// src/lib/services/imageLoading.ts
import { browser } from '$app/environment';

/**
 * CRITICAL FIX: Firebase Storage URLs with proper typing
 */
export const FIREBASE_IMAGES = {
	BOOKS: {
		FAITH_IN_A_FIRESTORM:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
		CONVICTION_IN_A_FLOOD:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Conviction_in_a_Flood.png?alt=media&token=0e509deb-cc0f-4f2d-9852-d7fab2f28741',
		HURRICANE_EVE:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Hurrican_Eve.png?alt=media&token=cac22f0d-d0c8-4965-b6be-d743a3968148',
		THE_FAITH_OF_THE_HUNTER:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/The_Faith_of_the_Hunter.png?alt=media&token=17825380-c90b-41d3-b16e-dc04cac14a69',
		HEART_OF_THE_STORM:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Heart_of_the_Storm.png?alt=media&token=a289b1cc-87c1-402c-a920-00e895ddf4cd',
		SYMBIOGENESIS:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Symbiogenesis.png?alt=media&token=f9a763d8-bc7e-49d5-8bb2-afe2596ac023'
	},
	AUTHOR: {
		PORTRAIT:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBoswell.jpg?alt=media&token=1ba4211f-b06c-49c3-9ef9-96e75fccc8e0',
		FIREFIGHTER:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
		NAVY: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Navy1993.JPG?alt=media&token=c1be8697-f87e-404b-b6df-8d3d856f2140',
		AUGUST_25:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58'
	},
	ICONS: {
		SIGNATURE_LOGO:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
		CHRISTIAN_FICTION:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
		EPIC_FANTASY:
			'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025'
	}
} as const;

/**
 * CRITICAL FIX: Generate fallback images safely
 */
function generateFallbackImage(type: 'book' | 'avatar' | 'logo', text: string): string {
	if (!browser) {
		return `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial" font-size="24" fill="#6b7280">Loading...</text></svg>')}`;
	}

	try {
		const colors = {
			book: { bg: '#dc2626', text: '#ffffff' },
			avatar: { bg: '#059669', text: '#ffffff' },
			logo: { bg: '#7c3aed', text: '#ffffff' }
		};

		const { bg, text: textColor } = colors[type];
		const dimensions = type === 'book' ? { w: 300, h: 400 } : { w: 200, h: 200 };

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">
      <rect width="100%" height="100%" fill="${bg}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">${text}</text>
    </svg>`;

		return `data:image/svg+xml;base64,${btoa(svg)}`;
	} catch (error) {
		console.warn('[generateFallbackImage] Error:', error);
		return '';
	}
}

/**
 * CRITICAL FIX: Export FALLBACK_IMAGES that your components expect
 */
export const FALLBACK_IMAGES = {
	get BOOK_COVER() {
		return generateFallbackImage('book', 'BOOK');
	},
	get AUTHOR_PHOTO() {
		return generateFallbackImage('avatar', 'AUTHOR');
	},
	get LOGO() {
		return generateFallbackImage('logo', 'CB');
	}
} as const;

/**
 * Re-export the progressive image functionality from actions
 * This maintains backward compatibility if other files import from here
 */
export { progressiveImage, imagePreloader } from '$lib/actions/progressiveImage';
export { normalizeFirebaseUrl } from '$lib/utils/urls';
