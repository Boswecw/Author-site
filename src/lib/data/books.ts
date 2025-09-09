// src/lib/data/placeholderBooks.ts - FIXED: Corrected Hurricane Eve filename
import type { BookDoc } from '$lib/types/index';

export const placeholderBooks: BookDoc[] = [
  {
    id: 'faith-in-a-firestorm',
    title: 'Faith in a Firestorm',
    description:
      "A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns. Follow characters who must rely on their faith and each other as they battle nature's most destructive force.",
    cover: 'Faith_in_a_FireStorm.png',
    genre: 'faith',
    status: 'published',
    publishDate: '2025-09-01',
    isbn: '9798869393326',
    format: 'EPUB',
    pages: 197,
    buyLinks: { amazon: 'https://amazon.com/dp/B0CQJ2XYZ1' },
    featured: true
  },
  {
    id: 'conviction-in-a-flood',
    title: 'Conviction in a Flood',
    description:
      "A companion novel exploring faith and resilience when rising waters test a community's resolve—where conviction must hold fast against the flood.",
    cover: 'Conviction_in_a_Flood.png',
    genre: 'faith',
    status: 'draft',
    publishDate: '2026-03-15',
    isbn: null,
    format: 'EPUB',
    pages: null,
    buyLinks: {},
    featured: false
  },
  {
    id: 'hurricane-eve',
    title: 'Hurricane Eve',
    description:
      "They said nothing could be worse than Katrina. They were wrong. In the third installment of the Faith & Calamity series, Jake Allen faces a storm that shatters records—and faith itself. As levees break and communities drown, survival demands both courage and unshakable belief.",
    cover: 'Hurricane_Eve.png', // ✅ FIXED: Added missing 'e' in Hurricane
    genre: 'faith',
    status: 'draft',
    publishDate: '2026-09-15',
    isbn: null,
    format: 'EPUB',
    pages: null,
    buyLinks: {},
    featured: false
  },
  {
    id: 'faith-of-the-hunter',
    title: 'The Faith of the Hunter',
    description:
      "David Paczer, a modern bow designer and avid hunter, is thrust back to a brutal medieval world where the Church's armies force conversion by sword. With only his faith, skills, and an odd feline companion, David must survive, protect the innocent, and discover God's purpose in a land at war.",
    cover: 'The_Faith_of_the_Hunter.png',
    genre: 'faith',
    status: 'coming-soon',
    publishDate: '2026-09-01',
    isbn: null,
    format: 'EPUB',
    pages: null,
    buyLinks: {},
    featured: false
  },
  {
    id: 'heart-of-the-storm',
    title: 'Heart of the Storm',
    description:
      'An epic fantasy of corruption, rebirth, and resilience. When a forbidden ritual tears open a breach between worlds, a young survivor named Rowetha and an aged war hero rejuvenated by a mysterious potion must face a rising darkness that wears the faces of the people they love. Ancient guardians, eldritch corruption, and the storm of destiny converge in a tale of sacrifice and hope.',
    cover: 'Heart_of_the_Storm.png',
    genre: 'epic',
    status: 'coming-soon',
    publishDate: '2027-03-01',
    isbn: null,
    format: 'EPUB',
    pages: null,
    buyLinks: {},
    featured: false
  },
  {
    id: 'symbiogenesis-gunnach-protocol',
    title: 'Symbiogenesis: Gunnach Protocol',
    description:
      'On the swamp world of Virex-9, Lieutenant Jake Gunnach stumbles into a fate worse than death — forced symbiosis with an ancient alien strategist preserved in living ink. Together they face a planet that breathes like a predator, predators that hunt like machines, and ruins whispering of a fallen empire.',
    cover: 'Symbiogenesis.png',
    genre: 'sci-fi',
    status: 'draft',
    publishDate: null,
    isbn: null,
    format: 'EPUB',
    pages: null,
    buyLinks: {},
    featured: false
  }
];