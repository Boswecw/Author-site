<script lang="ts">
  import BookCard from '$lib/components/BookCard.svelte';
  import { books } from '$lib/data/books.js';
  
  const publishedBooks = books.filter(book => book.status === 'published');
  const upcomingBooks = books.filter(book => book.status === 'upcoming');
</script>

<svelte:head>
  <title>Books by Author Name - Epic Fantasy Novels</title>
  <meta name="description" content="Discover epic fantasy novels that blend military precision with elemental magic, inspired by real Navy and firefighting experience." />
</svelte:head>

<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">My Books</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Epic fantasy novels that combine military strategy with elemental magic, 
        inspired by years of service and real-world courage.
      </p>
    </div>

    <!-- Published Books -->
    {#if publishedBooks.length > 0}
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Available Now</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each publishedBooks as book}
            <BookCard {book} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Upcoming Books -->
    {#if upcomingBooks.length > 0}
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Coming Soon</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each upcomingBooks as book}
            <BookCard {book} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Newsletter Signup CTA -->
    <div class="bg-white rounded-lg shadow-lg p-8 mt-16 text-center">
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Never Miss a Release</h3>
      <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
        Be the first to know about new books, exclusive previews, and special offers. 
        Plus, get behind-the-scenes stories from my firefighting and military days.
      </p>
      <a href="/contact" class="btn-primary">
        Join My Newsletter
      </a>
    </div>
  </div>
</section>