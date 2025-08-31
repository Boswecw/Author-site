// src/lib/data/books.ts
import type { Book } from '../types.js';

export const books: Book[] = [
  {
    id: 'faith-firestorm-epub',
    title: 'Faith in a FireStorm',
    cover: '/images/books/faith-in-a-firestorm-cover.jpg',
    description:
      'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
    status: 'upcoming',
    publishDate: '2025-09-01',
    isbn: '9798869393326',
    format: 'EPUB',
    buyLinks: {
      // Fill these once live:
      // amazon: 'https://…',
      // barnesNoble: 'https://…',
      // appleBooks: 'https://…',
      // kobo: 'https://…',
      // googlePlay: 'https://…'
    }
  }
];
