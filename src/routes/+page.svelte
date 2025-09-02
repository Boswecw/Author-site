<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import BookCard from '$lib/components/BookCard.svelte';
  import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
  import { IMAGES } from '$lib/utils/image';
  import type { Book } from '$lib/types';

  // Data from +page.server.ts
  export let data: {
    featured: {
      id: string;
      title: string;
      description?: string | null;
      cover?: string | null;
      genre?: 'faith' | 'epic' | string | null;
      status?: string | null;
      publishDate?: string | null;
    } | null;
    upcoming: Array<{
      id: string;
      title: string;
      description?: string | null;
      cover?: string | null;
      genre?: string | null;
      status?: string | null;
      publishDate?: string | null;
    }>;
  };

  // ----- Local fallbacks (used only if server returns empty) -----
  const fallbackFeatured: Book = {
    id: 'faith-in-firestorm',
    title: 'Faith in a Firestorm',
    description:
      "A Navy chaplain's faith is tested when supernatural forces threaten his crew during a dangerous rescue mission.",
    cover: IMAGES.BOOKS.FAITH_in_a_FIRESTORM,
    genre: 'faith',
    status: 'published'
  };

  const fallbackUpcoming: Book[] = [
    {
      id: 'conviction-flood',
      title: 'Conviction in a Flood',
      description: 'When ancient waters rise, a community must unite to survive the impossible.',
      cover: IMAGES.BOOKS.CONVICTION_FLOOD,
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2025-06-01'
    },
    {
      id: 'hurricane-eve',
      title: 'Hurricane Eve',
      description: 'A storm unlike any other tests the limits of human resilience and divine protection.',
      cover: IMAGES.BOOKS.HURRICANE_EVE,
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2025-09-01'
    },
    {
      id: 'hunters-faith',
      title: "Hunter's Faith Adventure",
      description: 'An epic journey through mystical lands where faith becomes the ultimate weapon.',
      cover: IMAGES.BOOKS.HUNTERS_FAITH,
      genre: 'epic',
      status: 'writing'
    }
  ];

  // Choose server data if present, otherwise fallbacks
  const featuredBook = data.featured ?? fallbackFeatured;
  const upcomingBooks: Book[] = (data.upcoming?.length ? data.upcoming : fallbackUpcoming) as Book[];

  // Safe image error handler
  function dimOnError(e: Event) {
    (e.currentTarget as HTMLImageElement).style.opacity = '0.7';
  }
</script>

<svelte:head>
  <title>Charles Boswell — Navy Veteran & Fantasy Author</title>
  <meta
    name="description"
    content="From U.S. Navy service to wildland firefighting to epic fantasy novels. Stories of courage, brotherhood, and faith forged in fire."
  />
  <meta property="og:title" content="Charles W. Boswell — Navy Veteran & Fantasy Author" />
  <meta
    property="og:description"
    content="Epic fantasy and Christian fiction born from real military and firefighting experience."
  />
  <meta property="og:type" content="website" />
</svelte:head>

<!-- Hero Section -->
<Hero
  title={featuredBook.title}
  subtitle={featuredBook.description ?? "A Navy chaplain's faith tested by supernatural forces during a dangerous rescue mission."}
  bookCover={featuredBook.cover ?? null}
  genre={(featuredBook.genre as 'faith' | 'epic') ?? 'faith'}
  ctaText="Get the Book"
  ctaLink={`/books/${featuredBook.id}`}
/>

<!-- About Preview -->
<section class="section-padding bg-gray-50">
  <div class="container-width">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <img
          src={IMAGES.AUTHOR_FIREFIGHTER}
          alt="Charles W. Boswell in firefighter gear"
          class="rounded-lg shadow-xl w-full h-96 object-cover"
          on:error={dimOnError}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div>
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Stories Forged in Fire</h2>
        <p class="text-lg text-gray-600 mb-6">
          From serving aboard Navy ships to battling wildfires across the American West,
          my experiences have shaped every story I tell. Sixteen years of firefighting
          and military service provide the authentic foundation for tales of courage,
          brotherhood, and unwavering faith.
        </p>
        <div class="flex flex-wrap gap-4 mb-8">
          <div class="flex items-center text-sm font-medium text-gray-700">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            U.S. Navy Veteran
          </div>
          <div class="flex items-center text-sm font-medium text-gray-700">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            16 Years Wildland Firefighting
          </div>
          <div class="flex items-center text-sm font-medium text-gray-700">
            <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Fantasy Author
          </div>
        </div>
        <a href="/about" class="btn-primary">Read My Full Story</a>
      </div>
    </div>
  </div>
</section>

<!-- Upcoming Books -->
<section class="section-padding">
  <div class="container-width">
    <div class="text-center mb-12">
      <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Upcoming Books</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        New stories of faith, courage, and elemental magic are on their way.
        Each book draws from real experiences to create authentic tales of heroism.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each upcomingBooks as book (book.id)}
        <BookCard {book} />
      {/each}
    </div>
  </div>
</section>

<!-- Newsletter Signup -->
<NewsletterSignup />
