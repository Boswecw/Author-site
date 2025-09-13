// src/lib/server/placeholderData.ts - Fixed TypeScript compliance
import type { BookDoc } from '$lib/types';

// ✅ FIXED: Complete BookDoc objects with all required properties
export const placeholderBooks: BookDoc[] = [
  {
    // ✅ FIX: Remove 'id' property to avoid conflicts with MongoDB _id
    title: 'Faith in a Firestorm',
    description: 'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
    cover: 'Faith_in_a_FireStorm.png',
    genre: 'faith',
    status: 'upcoming', // ✅ FIX: Use valid BookStatus instead of 'featured'
    publishDate: '2025-04-01',
    isbn: null,
    format: 'EPUB', // ✅ ADD: Required field
    pages: 320,
    buyLinks: {
      amazon: 'https://amazon.com/dp/B0CQJ2XYZ1'
    },
    featured: true, // ✅ ADD: Use featured as boolean property
    links: {}
  },
  {
    title: 'Conviction in a Flood',
    description: 'When flood waters rise, so must faith. A story of resilience in the face of natural disaster.',
    cover: 'Conviction_in_a_Flood.png',
    genre: 'faith',
    status: 'upcoming',
    publishDate: '2025-08-01',
    isbn: null,
    format: 'EPUB', // ✅ ADD: Required field
    pages: 300,
    buyLinks: {},
    featured: false,
    links: {}
  },
  {
    title: 'Hurricane Eve',
    description: 'A gripping tale of survival and faith during one of nature\'s most powerful storms.',
    cover: 'Hurricane_Eve.png',
    genre: 'faith',
    status: 'upcoming',
    publishDate: '2025-11-01',
    isbn: null,
    format: 'EPUB', // ✅ ADD: Required field
    pages: null,
    buyLinks: {},
    featured: false,
    links: {}
  },
  {
    title: 'Symbiogenesis',
    description: 'A sci-fi exploration of biological cooperation and evolution on an alien world.',
    cover: 'Symbiogenesis.png',
    genre: 'sci-fi',
    status: 'draft', // ✅ FIX: Use valid BookStatus
    publishDate: '2026-03-01',
    isbn: null,
    format: 'EPUB',
    pages: null,
    buyLinks: {},
    featured: false,
    links: {}
  }
];