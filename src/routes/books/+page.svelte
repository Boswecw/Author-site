<!-- src/routes/books/+page.svelte -->
<script lang="ts">
  import BookCard from '$lib/components/BookCard.svelte';
  import { IMAGES } from '$lib/utils/image';
  import type { Book } from '$lib/types';
  import type { PageData } from './$types';

  export let data: PageData;

  const fallbackBooks: Book[] = [
    {
      id: 'faith-in-a-firestorm',
      title: 'Faith in a Firestorm',
      description:
        'A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.',
      cover: IMAGES.BOOKS.FAITH_IN_A_FIRESTORM,
      genre: 'faith',
      status: 'featured',
      buyLinks: {
        amazon: 'https://amazon.com/dp/B0CQJ2XYZ1',
        barnes: null,
        other: null
      },
      pages: 197,
      isbn: '9798869393326'
    },
    {
      id: 'conviction-in-a-flood',
      title: 'Conviction in a Flood',
      description:
        "A companion novel exploring faith and resilience when rising waters test a community's resolve.",
      cover: IMAGES.BOOKS.CONVICTION_IN_A_FLOOD,
      genre: 'faith',
      status: 'upcoming',
      publishDate: '2026-03-15',
      pages: null
    },
    {
      id: 'hurricane-eve',
      title: 'Hurricane Eve',
      description:
        'The third installment of the Faith & Calamity series—a storm that shatters records and faith itself.',
      cover: IMAGES.BOOKS.HURRICANE_EVE,
      genre: 'faith',
      status: 'upcoming',
      publishDate: '2026-09-15',
      pages: null
    },
    {
      id: 'the-faith-of-the-hunter',
      title: 'The Faith of the Hunter',
      description:
        "David Paczer, thrust into a brutal medieval world where the Church's armies force conversion by sword.",
      cover: IMAGES.BOOKS.THE_FAITH_OF_THE_HUNTER,
      genre: 'faith',
      status: 'upcoming',
      publishDate: '2026-09-01',
      pages: null
    },
    {
      id: 'heart-of-the-storm',
      title: 'Heart of the Storm',
      description:
        'An epic fantasy of corruption, rebirth, and resilience when worlds collide.',
      cover: IMAGES.BOOKS.HEART_OF_THE_STORM,
      genre: 'epic',
      status: 'upcoming',
      publishDate: '2027-03-01',
      pages: null
    }
  ];

  // Use server data if present; otherwise fallback
  $: books = (data?.books?.length ? data.books : fallbackBooks) as Book[];

  let selectedGenre: 'all' | 'faith' | 'epic' = 'all';
  let selectedStatus: 'all' | 'featured' | 'published' | 'upcoming' = 'all';

  $: filteredBooks = books.filter((book) => {
    const genreMatch = selectedGenre === 'all' || book.genre === selectedGenre;
    const statusMatch = selectedStatus === 'all' || book.status === selectedStatus;
    return genreMatch && statusMatch;
  });

  $: availableStatuses = [...new Set(books.map((b) => b.status).filter(Boolean))];
</script>

<svelte:head>
  <title>Books by Charles W. Boswell — Christian & Epic Fantasy</title>
  <meta
    name="description"
    content="Explore Charles W. Boswell's Christian and epic fantasy novels — covers, descriptions, and release info."
  />
</svelte:head>

<section class="pt-28 pb-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">My Books</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Stories of courage, faith, and brotherhood forged from real military and firefighting experiences.
      </p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-6 justify-center mb-12">
      <div class="flex items-center space-x-3">
        <label for="genre-filter" class="text-sm font-semibold text-gray-700">Genre:</label>
        <select
          id="genre-filter"
          bind:value={selectedGenre}
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
        >
          <option value="all">All Genres</option>
          <option value="faith">Christian Fiction</option>
          <option value="epic">Epic Fantasy</option>
        </select>
      </div>

      <div class="flex items-center space-x-3">
        <label for="status-filter" class="text-sm font-semibold text-gray-700">Status:</label>
        <select
          id="status-filter"
          bind:value={selectedStatus}
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="featured">Featured</option>
          <option value="published">Published</option>
          <option value="upcoming">Coming Soon</option>
        </select>
      </div>
    </div>

    <!-- Books Grid -->
    {#if filteredBooks.length > 0}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {#each filteredBooks as book (book.id)}
          <div class="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <BookCard {book} featured={book.status === 'featured'} />
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No Books Found</h2>
        <p class="text-lg text-gray-600 mb-6">No books match your current filter selection.</p>
        <button
          on:click={() => { selectedGenre = 'all'; selectedStatus = 'all'; }}
          class="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Clear All Filters
        </button>
      </div>
    {/if}

    <!-- Newsletter CTA -->
    <div class="mt-20 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 lg:p-12 text-center border border-red-100">
      <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Stay Updated</h2>
      <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Be the first to know when new books are released and get exclusive behind-the-scenes content from the writing journey.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/contact"
          class="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Join My Newsletter
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
        <a
          href="/about"
          class="inline-flex items-center px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-50 border border-red-200 transition-colors duration-200"
        >
          Learn My Story
        </a>
      </div>
    </div>
  </div>
</section>
