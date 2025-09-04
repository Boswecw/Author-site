<!-- src/lib/components/BookCard.svelte -->
<script lang="ts">
  import type { Book } from '$lib/types';
  import { createImageFallback } from '$lib/utils/image';
  import { normalizeFirebaseUrl } from '$lib/utils/urls';

  // Required
  export let book: Book;

  // Optional
  export let featured: boolean = false;

  // Normalize the cover URL; fall back to generated placeholder
  $: coverSrc =
    book?.cover
      ? normalizeFirebaseUrl(book.cover) ?? createImageFallback(book.title)
      : createImageFallback(book.title);

  // Status (feature flag takes precedence)
  $: computedStatus = (featured ? 'featured' : (book.status ?? 'upcoming')) as string;

  $: statusColor =
    {
      featured: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      writing: 'bg-purple-100 text-purple-800'
    }[computedStatus] ?? 'bg-gray-100 text-gray-800';

  $: statusText =
    {
      featured: 'Featured',
      published: 'Available Now',
      upcoming: 'Coming Soon',
      writing: 'In Writing'
    }[computedStatus] ?? 'In Progress';

  // Genre badge
  $: genreBadge =
    book.genre === 'epic'
      ? 'bg-red-100 text-red-800'
      : book.genre === 'sci-fi'
      ? 'bg-indigo-100 text-indigo-800'
      : 'bg-blue-100 text-blue-800';

  $: genreText =
    book.genre === 'epic' ? 'Epic Fantasy' :
    book.genre === 'sci-fi' ? 'Science Fiction' :
    'Christian Fiction';

  function handleCoverError(e: Event) {
    (e.currentTarget as HTMLImageElement).src = createImageFallback(book.title);
  }
</script>

<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
  <div class="bg-gray-100">
    <img
      src={coverSrc}
      alt={"Cover of " + book.title}
      class="w-full h-80 object-cover"
      loading="lazy"
      decoding="async"
      on:error={handleCoverError}
    />
  </div>

  <div class="p-6">
    <div class="flex items-center gap-2 mb-3">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {genreBadge}">
        {genreText}
      </span>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusColor}">
        {statusText}
      </span>
    </div>

    <h3 class="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>

    {#if book.description}
      <p class="text-gray-600 mb-4 line-clamp-3">{book.description}</p>
    {/if}

    {#if book.publishDate}
      <p class="text-sm text-gray-500 mb-4">
        {computedStatus === 'upcoming' ? 'Expected: ' : ''}
        {new Date(book.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
      </p>
    {/if}

    {#if book.buyLinks && computedStatus === 'published'}
      <div class="flex gap-3">
        {#if book.buyLinks.amazon}
          <a href={book.buyLinks.amazon} target="_blank" rel="noopener noreferrer" class="btn-primary text-sm py-2 px-4">Amazon</a>
        {/if}
        {#if book.buyLinks.barnes}
          <a href={book.buyLinks.barnes} target="_blank" rel="noopener noreferrer" class="btn-secondary text-sm py-2 px-4">Barnes & Noble</a>
        {/if}
        {#if book.buyLinks.other}
          <a href={book.buyLinks.other} target="_blank" rel="noopener noreferrer" class="btn-secondary text-sm py-2 px-4">Other</a>
        {/if}
      </div>
    {:else}
      <button class="btn-secondary text-sm py-2 px-4 opacity-50 cursor-not-allowed" disabled>{statusText}</button>
    {/if}
  </div>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
