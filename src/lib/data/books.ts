// src/lib/data/books.ts
import type { Book } from '../types.js';
import { IMAGES } from '$lib/services/imageLoading';

export const books: Book[] = [
  {
    id: 'faith-firestorm-epub',
    title: 'Faith in a FireStorm',
    cover: IMAGES.BOOKS.FAITH_IN_A_FIRESTORM,
    description:
      "A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns. Follow characters who must rely on their faith and each other as they battle nature's most destructive force.",
    status: 'upcoming',
    publishDate: '2025-09-01',
    isbn: '9798869393326',
    format: 'EPUB',
    genre: 'faith', // 👈 new field
    buyLinks: {}
  },
  {
    id: 'conviction-in-a-flood-epub',
    title: 'Conviction in a Flood',
    cover: IMAGES.BOOKS.CONVICTION_IN_A_FLOOD,
    description:
      "A companion novel exploring faith and resilience when rising waters test a community's resolve—where conviction must hold fast against the flood.",
    status: 'upcoming',
    publishDate: '2026-03-15',
    format: 'EPUB',
    genre: 'faith',
    buyLinks: {}
  },
  {
    id: 'hurricane-eve-epub',
    title: 'Hurricane Eve',
    cover: IMAGES.BOOKS.HURRICANE_EVE,
    description:
      "They said nothing could be worse than Katrina. They were wrong. In the third installment of the Faith & Calamity series, Jake Allen faces a storm that shatters records—and faith itself. As levees break and communities drown, survival demands both courage and unshakable belief.",
    status: 'upcoming',
    publishDate: '2026-09-15',
    format: 'EPUB',
    isbn: 'TBD',
    genre: 'faith',
    buyLinks: {}
  },
  {
    id: 'faith-of-the-hunter-epub',
    title: 'The Faith of the Hunter',
    cover: IMAGES.BOOKS.THE_FAITH_OF_THE_HUNTER,
    description:
      "David Paczer, a modern bow designer and avid hunter, is thrust back to a brutal medieval world where the Church’s armies force conversion by sword. With only his faith, skills, and an odd feline companion, David must survive, protect the innocent, and discover God’s purpose in a land at war.",
    status: 'upcoming',
    publishDate: '2026-09-01',
    isbn: 'TBD',
    format: 'EPUB',
    genre: 'faith',
    buyLinks: {}
  },
  {
    id: 'heart-of-the-storm-epub',
    title: 'Heart of the Storm',
    cover: IMAGES.BOOKS.HEART_OF_THE_STORM,
    description:
      'An epic fantasy of corruption, rebirth, and resilience. When a forbidden ritual tears open a breach between worlds, a young survivor named Rowetha and an aged war hero rejuvenated by a mysterious potion must face a rising darkness that wears the faces of the people they love. Ancient guardians, eldritch corruption, and the storm of destiny converge in a tale of sacrifice and hope.',
    status: 'upcoming',
    publishDate: '2027-03-01',
    isbn: 'TBD',
    format: 'EPUB',
    genre: 'epic', // 👈 fantasy lane
    buyLinks: {}
  }
];
