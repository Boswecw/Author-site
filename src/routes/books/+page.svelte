<!-- src/routes/books/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { createImageFallback } from '$lib/services/authorImages';

  export let data: PageData;
  const IS_DEV = import.meta.env.DEV; // ✅ works in Svelte/Vite

  const norm = (g?: string | null) => (g ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const coverSrc = (book: any) => book.cover ?? createImageFallback(book.title, 'book');

  $: books = Array.isArray(data?.books) ? data.books : [];
  $: faithBooks = books.filter((b) => norm(b.genre) === 'faith');
  $: epicBooks  = books.filter((b) => norm(b.genre) === 'epic');
  $: sciFiBooks = books.filter((b) => ['sci-fi','scifi'].includes(norm(b.genre)));
</script>

{#if import.meta.env.DEV}
  <pre class="hidden">
    {JSON.stringify(data?.books?.map(b => ({ id:b.id, genre:b.genre })), null, 2)}
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

  <!-- Faith -->
  {#if faithBooks.length}
    <section>
      <h2 class="flex items-center text-2xl font-bold text-gray-900 mb-6">
        {#if data?.genreIcons?.faith}
          <img src={data.genreIcons.faith} alt="Faith icon" class="h-8 w-8 mr-2" />
        {:else}
          <span class="mr-2">✝️</span>
        {/if}
        Faith Fiction
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each faithBooks as book}
          <a href={`/books/${book.id}`} class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow block">
            <div class="aspect-[3/4] overflow-hidden">
              <img src={coverSrc(book)} alt={`${book.title} - Book cover`} class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
              <p class="text-gray-600 mb-4">{book.description}</p>
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{book.genre}</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{book.status || 'Upcoming'}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Epic -->
  {#if epicBooks.length}
    <section>
      <h2 class="flex items-center text-2xl font-bold text-gray-900 mb-6">
        {#if data?.genreIcons?.epic}
          <img src={data.genreIcons.epic} alt="Epic icon" class="h-8 w-8 mr-2" />
        {:else}
          <span class="mr-2">🗡️</span>
        {/if}
        Epic Fantasy
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each epicBooks as book}
          <a href={`/books/${book.id}`} class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow block">
            <div class="aspect-[3/4] overflow-hidden">
              <img src={coverSrc(book)} alt={`${book.title} - Book cover`} class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
              <p class="text-gray-600 mb-4">{book.description}</p>
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{book.genre}</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{book.status || 'Upcoming'}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Sci-Fi -->
  {#if sciFiBooks.length}
    <section>
      <h2 class="flex items-center text-2xl font-bold text-gray-900 mb-6">
        {#if data?.genreIcons?.['sci-fi']}
          <img src={data.genreIcons['sci-fi']} alt="Sci-Fi icon" class="h-8 w-8 mr-2" />
        {:else}
          <span class="mr-2">🚀</span>
        {/if}
        Sci-Fi
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each sciFiBooks as book}
          <a href={`/books/${book.id}`} class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow block">
            <div class="aspect-[3/4] overflow-hidden">
              <img src={coverSrc(book)} alt={`${book.title} - Book cover`} class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
              <p class="text-gray-600 mb-4">{book.description}</p>
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">{book.genre}</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{book.status || 'Upcoming'}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  {#if !faithBooks.length && !epicBooks.length && !sciFiBooks.length}
    <div class="text-center py-12">
      <p class="text-xl text-gray-600">Books coming soon! Check back for updates.</p>
      <a href="/contact" class="mt-4 inline-block text-blue-600 hover:underline">Contact me for updates →</a>
    </div>
  {/if}
</div>
