<!-- src/routes/books/+page.svelte - QUICK TYPE FIX -->
<script lang="ts">
  import type { PageData } from './$types';
  import BookCard from '$lib/components/BookCard.svelte';
  import type { Book } from '$lib/types';

  export let data: PageData;

  // Quick fix for the type error - ensure links are properly typed
  const mockBook: Book = {
    id: 'test',
    title: 'Test Book',
    description: 'Test description',
    cover: null,
    genre: 'faith',
    status: 'published',
    links: {
      amazon: 'https://amazon.com/dp/B0CQJ2XYZ1',
      barnes: null,  // This is now allowed due to our type fix
      other: null    // This is now allowed due to our type fix
    }
  };

  $: books = data.books || [];
  $: publishedBooks = books.filter(book => book.status === 'published');
  $: upcomingBooks = books.filter(book => book.status === 'coming-soon');
</script>

<svelte:head>
  <title>Books - Charles Boswell</title>
  <meta name="description" content="Explore Charles Boswell's fantasy novels, faith-based fiction, and upcoming releases." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Books</h1>
      <p class="text-xl text-gray-600">
        Explore my fantasy novels and faith-based fiction
      </p>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 py-12">
    
    <!-- Published Books -->
    {#if publishedBooks.length > 0}
      <section class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Available Now</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {#each publishedBooks as book (book.id)}
            <BookCard {book} />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Upcoming Books -->
    {#if upcomingBooks.length > 0}
      <section>
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Coming Soon</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {#each upcomingBooks as book (book.id)}
            <BookCard {book} />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Empty State -->
    {#if books.length === 0}
      <div class="text-center py-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">No books found</h2>
        <p class="text-gray-600">Check back soon for new releases!</p>
      </div>
    {/if}
  </div>
</div>