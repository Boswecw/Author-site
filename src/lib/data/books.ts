// src/lib/data/books.ts
import type { Book } from '../types.js';

export const books: Book[] = [
  {
    id: 'faith-firestorm-epub',
    title: 'Faith in a FireStorm',
    cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith%20in%20a%20FireStorm%20Cover.png?alt=media&token=96a07f8e-b0f6-47b4-bcba-84f581a475da',
    description: 'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns. Follow characters who must rely on their faith and each other as they battle nature\'s most destructive force.',
    status: 'upcoming',
    publishDate: '2025-09-01',
    isbn: '9798869393326',
    format: 'EPUB',
    buyLinks: {
      // Links will be added once published
      // amazon: 'https://amazon.com/...',
      // barnesNoble: 'https://barnesandnoble.com/...',
      // appleBooks: 'https://books.apple.com/...',
      // kobo: 'https://kobo.com/...',
      // googlePlay: 'https://play.google.com/...'
    }
  },
  {
    id: 'conviction-in-a-flood-epub',
    title: 'Conviction in a Flood',
    cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
    description: 'A companion novel exploring faith and resilience when rising waters test a community\'s resolve—where conviction must hold fast against the flood.',
    status: 'upcoming',
    publishDate: '2026-03-15',
    format: 'EPUB',
    buyLinks: {}
  }
];