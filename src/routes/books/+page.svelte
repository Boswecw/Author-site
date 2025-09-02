<script lang="ts">
  import BookCard from '$lib/components/BookCard.svelte';
  import { IMAGES } from '$lib/utils/image';
  import type { Book } from '$lib/types';

  const allBooks: Book[] = [
    {
      id: 'faith-in-firestorm',
      title: 'Faith in a Firestorm',
      description: 'A Navy chaplain\'s faith is tested when supernatural forces threaten his crew during a dangerous rescue mission. Blending military realism with Christian fantasy elements.',
      cover: IMAGES.BOOKS.FAITH_FIRESTORM,
      genre: 'faith',
      status: 'published',
      buyLinks: {
        amazon: 'https://amazon.com/example',
        barnes: 'https://barnesandnoble.com/example'
      },
      pages: 324,
      isbn: '978-1234567890'
    },
    {
      id: 'conviction-flood',
      title: 'Conviction in a Flood',
      description: 'When ancient waters rise and threaten to destroy everything, a small community must unite their faith and courage to survive the impossible.',
      cover: IMAGES.BOOKS.CONVICTION_FLOOD,
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2025-06-01',
      pages: 356
    },
    {
      id: 'hurricane-eve',
      title: 'Hurricane Eve',
      description: 'A storm unlike any other tests the limits of human resilience and divine protection as a family fights to save their community.',
      cover: IMAGES.BOOKS.HURRICANE_EVE,
      genre: 'faith',
      status: 'coming-soon',
      publishDate: '2025-09-01',
      pages: 298
    },
    {
      id: 'hunters-faith',
      title: 'Hunter\'s Faith Adventure',
      description: 'An epic journey through mystical lands where faith becomes the ultimate weapon against dark forces threatening the realm.',
      cover: IMAGES.BOOKS.HUNTERS_FAITH,
      genre: 'epic',
      status: 'writing'
    },
    {
      id: 'heart-of-storm',
      title: 'Heart of the Storm: Elf and Wolf',
      description: 'A tale of unlikely alliance between an elf warrior and a mystical wolf as they battle to restore balance to their war-torn world.',
      cover: IMAGES.BOOKS.HEART_OF_STORM,
      genre: 'epic',
      status: 'writing'
    }
  ];

  let selectedGenre: 'all' | 'faith' | 'epic' = 'all';
  let selectedStatus: 'all' | 'published' | 'coming-soon' | 'writing' = 'all';

  $: filteredBooks = allBooks.filter(book => {
    const genreMatch = selectedGenre === 'all' || book.genre === selectedGenre;
    const statusMatch = selectedStatus === 'all' || book.status === selectedStatus;
    return genreMatch && statusMatch;
  });
</script>

<svelte:head>
  <title>Books by Charles W. Boswell — Christian Fantasy & Epic Fantasy Novels</title>
  <meta name="description" content="Explore Charles W. Boswell's collection of Christian fantasy and epic fantasy novels, featuring military heroes, elemental magic, and themes of faith and courage." />
</svelte:head>

<div class="section-padding">
  <div class="container-width">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">My Books</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Stories of courage, faith, and brotherhood forged from real military and 
        firefighting experiences. Each book blends authentic heroism with imaginative 
        fantasy elements.
      </p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 justify-center mb-12">
      <div class="flex items-center space-x-2">
        <label for="genre-filter" class="text-sm font-medium text-gray-700">Genre:</label>
        <select 
          id="genre-filter"
          bind:value={selectedGenre}
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Genres</option>
          <option value="faith">Christian Fiction</option>
          <option value="epic">Epic Fantasy</option>
        </select>
      </div>

      <div class="flex items-center space-x-2">
        <label for="status-filter" class="text-sm font-medium text-gray-700">Status:</label>
        <select 
          id="status-filter"
          bind:value={selectedStatus}
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="coming-soon">Coming Soon</option>
          <option value="writing">In Progress</option>
        </select>
      </div>
    </div>

    <!-- Books Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each filteredBooks as book}
        <BookCard {book} />
      {/each}
    </div>

    {#if filteredBooks.length === 0}
      <div class="text-center py-16">
        <p class="text-lg text-gray-600">No books match your current filters.</p>
        <button 
          on:click={() => { selectedGenre = 'all'; selectedStatus = 'all'; }}
          class="mt-4 btn-secondary"
        >
          Clear Filters
        </button>
      </div>
    {/if}

    <!-- Newsletter CTA -->
    <div class="mt-20 bg-gray-50 rounded-xl p-8 text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
      <p class="text-lg text-gray-600 mb-6">
        Be the first to know when new books are released and get exclusive behind-the-scenes content.
      </p>
      <a href="/contact" class="btn-primary">
        Join My Newsletter
      </a>
    </div>
  </div>
</div>
