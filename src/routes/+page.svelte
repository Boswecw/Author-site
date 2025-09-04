<!-- src/routes/+page.svelte - FIXED GENRE TYPE ISSUE -->
<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import BookCard from '$lib/components/BookCard.svelte';
  import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
  import type { PageData } from './$types';
  import type { Book } from '$lib/types';
  import { onMount } from 'svelte';

  // CRITICAL FIX: Properly typed data export
  export let data: PageData;

  // ✅ FIXED: Use correct Firebase Storage URLs and status values with proper typing
  const FALLBACK_FEATURED: Book = {
    id: 'faith-in-a-firestorm',
    title: 'Faith in a Firestorm',
    description: "A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.",
    cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
    genre: 'faith',  // Explicit typing
    status: 'published'
  };

  const FALLBACK_UPCOMING: Book[] = [
    {
      id: 'conviction-in-a-flood',
      title: 'Conviction in a Flood',
      description: 'A companion novel exploring faith and resilience when rising waters test a community\'s resolve.',
      cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2026-03-15'
    },
    {
      id: 'hurricane-eve',
      title: 'Hurricane Eve',
      description: 'The third installment of the Faith & Calamity series—a storm that shatters records and faith itself.',
      cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334',
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2026-09-15'
    },
    {
      id: 'faith-of-the-hunter',
      title: 'The Faith of the Hunter',
      description: 'David Paczer, thrust into a brutal medieval world where faith and survival collide.',
      cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/TheFaithoftheHuntercover.png?alt=media&token=ac09e3b1-7cee-4df3-bc9e-dcbcf14a482f',
      genre: 'epic',
      status: 'coming-soon',
      publishDate: '2026-09-01'
    }
  ];

  // CRITICAL FIX: Safe data access with proper type casting and fallbacks
  $: featuredBook = (data?.featured || FALLBACK_FEATURED) as Book;
  $: upcomingBooks = (data?.upcoming?.length ? data.upcoming : FALLBACK_UPCOMING) as Book[];

  // Loading state for progressive enhancement
  let componentsReady = false;

  onMount(() => {
    // Allow components to render after mount
    componentsReady = true;
  });
</script>

<svelte:head>
  <title>Charles Boswell — Navy Veteran & Fantasy Author</title>
  <meta
    name="description"
    content="From U.S. Navy service to wildland firefighting to epic fantasy novels. Discover Charles Boswell's journey and explore his latest releases."
  />
</svelte:head>

<main class="min-h-screen">
  <!-- Hero Section - FIXED GENRE TYPE -->
  <Hero
    title={featuredBook?.title || 'Charles Boswell'}
    subtitle={featuredBook?.description || 'Navy veteran, firefighter, and fantasy author'}
    ctaText="Explore Books"
    ctaLink="/books"
    genre={featuredBook?.genre || 'faith'}
    bookCover={featuredBook?.cover}
  />

  <!-- Upcoming Books Section -->
  <section class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Upcoming Releases</h2>
        <p class="text-lg text-gray-600">New adventures coming soon</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each upcomingBooks as book (book.id)}
          <BookCard {book} />
        {/each}
      </div>
    </div>
  </section>

  <!-- Newsletter Signup -->
  <section class="py-16 bg-white">
    <div class="max-w-4xl mx-auto px-4">
      <NewsletterSignup />
    </div>
  </section>
</main>