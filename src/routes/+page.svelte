// src/routes/+page.svelte - FIXED FALLBACK DATA
<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import BookCard from '$lib/components/BookCard.svelte';
  import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
  import type { PageData } from './$types';
  import type { Book } from '$lib/types';
  import { onMount } from 'svelte';

  // CRITICAL FIX: Properly typed data export
  export let data: PageData;

  // ✅ FIXED: Use correct Firebase Storage URLs and status values
  const FALLBACK_FEATURED: Book = {
    id: 'faith-in-a-firestorm',
    title: 'Faith in a Firestorm',
    description: "A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.",
    cover: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
    genre: 'faith',
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
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2026-09-01'
    }
  ];

  // CRITICAL FIX: Safe data access with proper fallbacks
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
    content="From U.S. Navy service to wildland firefighting to epic fantasy novels. Stories of courage, brotherhood, and faith forged in fire."
  />
  <meta property="og:title" content="Charles W. Boswell — Navy Veteran & Fantasy Author" />
  <meta
    property="og:description"
    content="Epic fantasy and Christian fiction born from real military and firefighting experience."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://charlesboswell.com" />
</svelte:head>

<!-- Hero Section -->
<Hero
  title={featuredBook.title}
  subtitle={featuredBook.description ?? ''}
  ctaText="Read Latest Book"
  ctaLink="/books"
  genre={featuredBook.genre}
  bookCover={featuredBook.cover}
/>

<!-- Upcoming Books Section -->
<section class="py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upcoming Releases</h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        New stories are always brewing. Here's what's next in the forge of faith and fantasy.
      </p>
    </div>

    {#if componentsReady}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each upcomingBooks as book}
          <BookCard {book} />
        {/each}
      </div>
    {:else}
      <!-- Loading skeleton -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each Array(3) as _}
          <div class="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div class="w-full h-80 bg-gray-300"></div>
            <div class="p-6">
              <div class="h-6 bg-gray-300 rounded mb-2"></div>
              <div class="h-4 bg-gray-300 rounded mb-4"></div>
              <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="text-center mt-12">
      <a
        href="/books"
        class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
      >
        View All Books
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </a>
    </div>
  </div>
</section>

<!-- Newsletter Section -->
<NewsletterSignup />

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>