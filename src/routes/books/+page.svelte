<!-- src/routes/books/+page.svelte -->
<script lang="ts">
  import BookCard from '$lib/components/BookCard.svelte';
  import GenreIcon from '$lib/components/GenreIcon.svelte';
  import GenreBadge from '$lib/components/GenreBadge.svelte';
  import { books } from '$lib/data/books';
  import type { Book } from '$lib/types';

  // Separate by genre
  const faithBooks = books.filter((b) => b.genre === 'faith');
  const epicBooks = books.filter((b) => b.genre === 'epic');

  // Helper function for book card props
  function toCardProps(b: Book) {
    return {
      title: b.title,
      description: b.description,
      status: b.status === 'published' ? 'Available Now' : 
              b.publishDate ? `Coming ${new Date(b.publishDate).toLocaleString('en-US', { month: 'long', year: 'numeric' })}` : 
              'Coming Soon',
      isbn: b.isbn,
      format: b.format,
      coverSrc: b.cover
    };
  }
</script>

<svelte:head>
  <title>Books by Charles W. Boswell — Christian Fiction & Epic Fantasy</title>
  <meta name="description" content="Discover stories of faith and courage across two genres: Christian contemporary fiction and epic fantasy adventures." />
</svelte:head>

<section class="py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Page Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">My Books</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Stories spanning two worlds: contemporary Christian fiction rooted in real experience, 
        and epic fantasy adventures where faith meets fire and steel.
      </p>
    </div>

    <!-- Christian Fiction Section -->
    <div class="mb-20">
      <div class="flex items-center justify-center gap-4 mb-8">
        <GenreIcon genre="faith" size="medium" />
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Christian Fiction</h2>
          <p class="text-gray-600 mt-2">Contemporary stories of faith, courage, and redemption</p>
        </div>
      </div>

      {#if faithBooks.length > 0}
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {#each faithBooks as book}
            <div class="relative">
              <BookCard {...toCardProps(book)} />
              <div class="absolute top-4 right-4">
                <GenreBadge genre="faith" size="small" />
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <GenreIcon genre="faith" size="medium" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">Christian Fiction Coming Soon</h3>
          <p class="mt-2 text-gray-600">New contemporary stories are in development.</p>
        </div>
      {/if}
    </div>

    <!-- Epic Fantasy Section -->
    <div class="mb-20">
      <div class="flex items-center justify-center gap-4 mb-8">
        <GenreIcon genre="epic" size="medium" />
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Epic Fantasy</h2>
          <p class="text-gray-600 mt-2">Secondary worlds where magic meets military precision</p>
        </div>
      </div>

      {#if epicBooks.length > 0}
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {#each epicBooks as book}
            <div class="relative">
              <BookCard {...toCardProps(book)} />
              <div class="absolute top-4 right-4">
                <GenreBadge genre="epic" size="small" />
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <GenreIcon genre="epic" size="medium" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">Epic Fantasy Coming Soon</h3>
          <p class="mt-2 text-gray-600">Secondary world adventures are in development.</p>
        </div>
      {/if}
    </div>

    <!-- Newsletter CTA -->
    <div class="bg-gradient-to-r from-blue-50 via-purple-50 to-red-50 rounded-2xl p-8 text-center">
      <div class="flex justify-center gap-6 mb-6">
        <GenreIcon genre="faith" size="small" />
        <GenreIcon genre="epic" size="small" />
      </div>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Never Miss a Release</h3>
      <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
        Be the first to know about new books in both genres. Get exclusive previews, 
        behind-the-scenes stories, and updates from the frontlines of both worlds.
      </p>
      
      <a href="/contact" class="btn-primary">
        Join My Newsletter
      </a>
    </div>
  </div>
</section>

<style>
  .btn-primary {
    @apply bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200;
  }
</style>