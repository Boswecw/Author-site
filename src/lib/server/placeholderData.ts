import type { BookDoc } from '$lib/types/book';

// CRITICAL: Use correct Firebase Storage paths (remove spaces from filenames)
export const placeholderBooks: BookDoc[] = [
  {
    id: 'faith-in-a-firestorm',
    title: 'Faith in a Firestorm',
    description: 'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
    cover: 'Faith_in_a_FireStorm.png',  // Correct: no spaces
    genre: 'faith',
    status: 'featured',
    publishDate: '2025-04-01'
  },
  {
    id: 'conviction-in-a-flood',
    title: 'Conviction in a Flood',
    description: 'When flood waters rise, so must faith. A story of resilience in the face of natural disaster.',
    cover: 'Conviction_in_a_Flood_Cover.png',  // Fixed: use underscores instead of spaces
    genre: 'faith',
    status: 'upcoming',
    publishDate: '2025-08-01'
  },
  {
    id: 'hurricane-eve',
    title: 'Hurricane Eve',
    description: 'A gripping tale of survival and faith during one of nature\'s most powerful storms.',
    cover: 'Hurricane_Eve.png',  // Fixed: use underscores instead of spaces
    genre: 'faith',
    status: 'upcoming',
    publishDate: '2025-11-01'
  }
];