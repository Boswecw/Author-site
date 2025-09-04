<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import BookCard from '$lib/components/BookCard.svelte';
  import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
  import type { PageData } from './$types';
  import type { Book } from '$lib/types';
  import { onMount } from 'svelte';

  // Properly typed data export
  export let data: PageData;

  // Fallback data constants (used if server returns empty)
  const FALLBACK_FEATURED: Book = {
    id: 'faith-in-a-firestorm',
    title: 'Faith in a Firestorm',
    description:
      "A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.",
    cover:
      'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith_in_a_FireStorm.png?alt=media&token=33d6bfa5-d3ff-4a4c-8d9b-a185282cacc3',
    genre: 'faith',
    status: 'featured'
  };

  const FALLBACK_UPCOMING: Book[] = [
    {
      id: 'conviction-in-a-flood',
      title: 'Conviction in a Flood',
      description:
        "A companion novel exploring faith and resilience when rising waters test a community's resolve.",
      cover:
        'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
      genre: 'faith',
      status: 'upcoming',
      publishDate: '2026-03-15'
    },
    {
      id: 'hurricane-eve',
      title: 'Hurricane Eve',
      description:
        'The third installment of the Faith & Calamity series—a storm that shatters records and faith itself.',
      cover:
        'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334',
      genre: 'faith',
      status: 'upcoming',
      publishDate: '2026-09-15'
    },
    {
      id: 'faith-of-the-hunter',
      title: 'The Faith of the Hunter',
      description:
        'David Paczer, thrust into a brutal medieval world where faith and survival collide.',
      cover:
        'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/TheFaithoftheHuntercover.png?alt=media&token=ac09e3b1-7cee-4df3-bc9e-dcbcf14a482f',
      genre: 'faith',
      status: 'upcoming',
      publishDate: '2026-09-01'
    }
  ];

  // Safe data access with proper fallbacks
  $: featuredBook = (data?.featured || FALLBACK_FEATURED) as Book;
  $: upcomingBooks = (data?.upcoming?.length ? data.upcoming : FALLBACK_UPCOMING) as Book[];

  // Loading state for progressive enhancement
  let componentsReady = false;
  onMount(() => {
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
  {#if featuredBook?.cover}
    <meta property="og:image" content={featuredBook.cover} />
  {/if}
</svelte:head>

<!-- Hero Section -->
<Hero
  title="Epic Fantasy Born from Real Experience"
  subtitle="From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and faith."
  ctaText="Read Latest Book"
  ctaLink="/books"
  genre={featuredBook?.genre === 'epic' ? 'epic' : 'faith'}
  bookCover={featuredBook?.cover || null}
/>

<!-- Featured Book Section -->
{#if componentsReady && featuredBook}
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Release</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the newest addition to the collection—where faith meets adventure in the face of impossible odds.
        </p>
      </div>

      <div class="max-w-4xl mx-auto transform hover:scale-[1.02] transition-transform duration-300">
        <BookCard book={featuredBook} featured />
      </div>
    </div>
  </section>
{/if}

<!-- Upcoming Books Section -->
{#if componentsReady && upcomingBooks.length > 0}
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Get ready for new adventures. These upcoming releases will expand the universe of faith-driven fantasy.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each upcomingBooks as book (book.id)}
          <div class="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <BookCard {book} />
          </div>
        {/each}
      </div>

      <div class="text-center mt-12">
        <a
          href="/books"
          class="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          View All Books
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  </section>
{/if}

<!-- Author Highlight Section -->
<section class="py-20 bg-gray-900 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl md:text-4xl font-bold mb-6">From Service to Stories</h2>
        <p class="text-xl text-gray-300 mb-6">
          Sixteen years as a U.S. Navy veteran and wildland firefighter have shaped every page I write.
          My novels blend real-world experience with epic fantasy, creating stories where courage isn't just heroic—it's necessary for survival.
        </p>
        <p class="text-lg text-gray-300 mb-8">
          Whether battling wildfires or supernatural forces, my characters face the same truth:
          faith and brotherhood are the only things that can carry you through the impossible.
        </p>
        <a
          href="/about"
          class="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Learn My Story
        </a>
      </div>
      <div class="flex justify-center lg:justify-end">
        <div class="bg-red-800/20 rounded-lg p-8 border border-red-700/30">
          <div class="space-y-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 7 7 0 11-10 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">16 Years</h3>
                <p class="text-gray-300">U.S. Navy Service</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Wildland</h3>
                <p class="text-gray-300">Firefighter Experience</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Epic Fantasy</h3>
                <p class="text-gray-300">Faith-Driven Novels</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Newsletter Signup Section -->
{#if componentsReady}
  <NewsletterSignup />
{/if}
