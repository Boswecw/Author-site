// src/lib/data/books.ts
import type { Book } from '../types.js';

export const books: Book[] = [
  {
    id: 'faith-firestorm-epub',
    title: 'Faith in a FireStorm',
    cover:
      'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith%20in%20a%20FireStorm%20Cover.png?alt=media&token=96a07f8e-b0f6-47b4-bcba-84f581a475da',
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
    cover:
      'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
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
    cover:
      'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334',
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
    cover:
      "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/20250831_2300_Hunter's%20Faith%20Adventure_simple_compose_01k41kc9cge95t9xhrte18arrn.png?alt=media&token=4182a745-4591-44ee-aa7f-1619db3bd895",
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
    cover:
      'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Heart%20of%20the%20Storm_%20Elf%20and%20Wolf.png?alt=media&token=5376fbb7-b0e4-4595-abc8-6ec96be68005',
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
