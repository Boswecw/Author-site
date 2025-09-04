// src/lib/data/books.ts
import type { Book } from '../types.js';

export const books: Book[] = [
  {
    id: 'faith-firestorm-epub',
    title: 'Faith in a FireStorm',
    cover: 'books/Faith_in_a_FireStorm.png',
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
    cover: 'books/Conviction_in_a_Flood Cover.png',
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
    cover: 'books/Hurricane_Eve Cover.png',
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
    cover: 'books/TheFaithoftheHuntercover.png',
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
    cover: 'books/Heart_of_the_Storm_Elf_and_Wolf.png',
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
