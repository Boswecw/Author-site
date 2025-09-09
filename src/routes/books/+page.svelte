<!-- src/routes/books/+page.svelte - UPDATED with TypeScript fixes -->
<script lang="ts">
  import type { PageData } from './$types';
  import { createImageFallback } from '$lib/services/authorImages';
  import { dev } from '$app/environment'; // ✅ Use SvelteKit's dev instead of import.meta.env

  export let data: PageData;

  // ✅ Fix: Use SvelteKit's dev variable instead of import.meta.env.DEV
  const IS_DEV = dev;

  const norm = (g?: string | null) => (g ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  
  // ✅ Fix: Add proper typing for book parameter
  interface Book {
    id: string;
    title: string;
    description: string;
    cover: string | null;
    genre: string;
    status: string;
  }
  
  const coverSrc = (book: Book) => book.cover ?? createImageFallback(book.title, 'book');

  $: books = Array.isArray(data?.books) ? data.books : [];
  // ✅ Fix: Add explicit typing for book parameter to avoid implicit 'any'
  $: faithBooks = books.filter((b: Book) => norm(b.genre) === 'faith');
  $: epicBooks = books.filter((b: Book) => norm(b.genre) === 'epic');
  $: sciFiBooks = books.filter((b: Book) => ['sci-fi','scifi'].includes(norm(b.genre)));
</script>

<!-- ✅ Fix: Use SvelteKit's dev variable -->
{#if dev}
  <pre class="hidden">
    {JSON.stringify(data?.books?.map((b: Book) => ({ id: b.id, genre: b.genre })), null, 2)}
  </pre>
{/if}

<svelte:head>
  <title>Books by Charles W. Boswell - Faith, Epic & Sci-Fi Fiction</title>
  <meta name="description" content="Explore Charles W. Boswell's collection of faith-based, epic fantasy, and sci-fi novels—stories forged from Navy and firefighting experiences." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12 space-y-16">
  <div class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">My Books</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Stories of faith, courage, and imagination inspired by real-world experiences in the Navy and
      on the wildfire line.
    </p>
  </div>

  <!-- Faith Fiction Section -->
  {#if faithBooks.length}
    <section>
      <h2 class="flex items-center text-2xl font-bold text-gray-900 mb-6">
        {#if data?.genreIcons?.faith}
          <img src={data.genreIcons.faith} alt="Faith icon" class="h-32 w-32 mr-3" />
        {:else}
          <span class="mr-3">✝️</span>
        {/if}
        Faith Fiction
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each faithBooks as book}
          <a 
            href={`/books/${book.id}`} 
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 block group"
          >
            <!-- Book Cover with proper aspect ratio -->
            <div class="aspect-[2/3] bg-gray-50 flex items-center justify-center overflow-hidden">
              <img 
                src={coverSrc(book)} 
                alt={`${book.title} - Book cover`} 
                class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                loading="lazy" 
              />
            </div>
            <!-- Book Details -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              {#if book.description}
                <p class="text-gray-600 mb-4 line-clamp-3">{book.description}</p>
              {/if}
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {book.genre}
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                  {book.status || 'Upcoming'}
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Epic Fantasy Section -->
  {#if epicBooks.length}
    <section>
      <h2 class="flex items-center text-2xl font-bold text-gray-900 mb-6">
        {#if data?.genreIcons?.epic}
          <img src={data.genreIcons.epic} alt="Epic icon" class="h-32 w-32 mr-3" />
        {:else}
          <span class="mr-3">🗡️</span>
        {/if}
        Epic Fantasy
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each epicBooks as book}
          <a 
            href={`/books/${book.id}`} 
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 block group"
          >
            <!-- Book Cover with proper aspect ratio -->
            <div class="aspect-[2/3] bg-gray-50 flex items-center justify-center overflow-hidden">
              <img 
                src={coverSrc(book)} 
                alt={`${book.title} - Book cover`} 
                class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                loading="lazy" 
              />
            </div>
            <!-- Book Details -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {book.title}
              </h3>
              {#if book.description}
                <p class="text-gray-600 mb-4 line-clamp-3">{book.description}</p>
              {/if}
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                  {book.genre}
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                  {book.status || 'Upcoming'}
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Sci-Fi Section -->
  {#if sciFiBooks.length}
    <section>
      <h2 class="flex items-center text-2xl font-bold text-gray-900 mb-6">
        {#if data?.genreIcons?.['sci-fi']}
          <img src={data.genreIcons['sci-fi']} alt="Sci-Fi icon" class="h-32 w-32 mr-3" />
        {:else}
          <span class="mr-3">🚀</span>
        {/if}
        Sci-Fi
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each sciFiBooks as book}
          <a 
            href={`/books/${book.id}`} 
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 block group"
          >
            <!-- Book Cover with proper aspect ratio -->
            <div class="aspect-[2/3] bg-gray-50 flex items-center justify-center overflow-hidden">
              <img 
                src={coverSrc(book)} 
                alt={`${book.title} - Book cover`} 
                class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                loading="lazy" 
              />
            </div>
            <!-- Book Details -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {book.title}
              </h3>
              {#if book.description}
                <p class="text-gray-600 mb-4 line-clamp-3">{book.description}</p>
              {/if}
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                  {book.genre}
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                  {book.status || 'Upcoming'}
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Empty State -->
  {#if !faithBooks.length && !epicBooks.length && !sciFiBooks.length}
    <div class="text-center py-12">
      <div class="max-w-md mx-auto">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Books Coming Soon!</h3>
        <p class="text-lg text-gray-600 mb-6">
          I'm working on bringing you compelling stories of faith, adventure, and imagination.
        </p>
        <a 
          href="/contact" 
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Get Updates →
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom line-clamp utility for description truncation */
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
  }
</style>