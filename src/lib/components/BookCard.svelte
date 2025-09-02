<script lang="ts">
  import type { Book } from '$lib/types';
  import { lazyImage } from '$lib/actions/progressiveImage';
  import { FALLBACK_IMAGES } from '$lib/services/imageLoading';

  export let book: Book;

  $: statusColor = {
    'published': 'bg-green-100 text-green-800',
    'coming-soon': 'bg-blue-100 text-blue-800', 
    'writing': 'bg-yellow-100 text-yellow-800'
  }[book.status];

  $: statusText = {
    'published': 'Available Now',
    'coming-soon': 'Coming Soon',
    'writing': 'In Progress'
  }[book.status];

  $: genreBadge = book.genre === 'epic' 
    ? 'bg-red-100 text-red-800' 
    : 'bg-blue-100 text-blue-800';

  $: genreText = book.genre === 'epic' ? 'Epic Fantasy' : 'Christian Fiction';

</script>

<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
  <div class="aspect-w-3 aspect-h-4 bg-gray-200">
    <img
      alt="Cover of {book.title}"
      class="w-full h-80 object-cover"
      use:lazyImage={{ src: book.cover, fallback: FALLBACK_IMAGES.BOOK_COVER }}
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
    
    <h3 class="text-xl font-bold text-gray-900 mb-2">
      {book.title}
    </h3>
    
    <p class="text-gray-600 mb-4 line-clamp-3">
      {book.description}
    </p>
    
    {#if book.publishDate}
      <p class="text-sm text-gray-500 mb-4">
        Expected: {new Date(book.publishDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })}
      </p>
    {/if}
    
    {#if book.buyLinks && book.status === 'published'}
      <div class="flex gap-3">
        {#if book.buyLinks.amazon}
          <a href={book.buyLinks.amazon} target="_blank" rel="noopener noreferrer" 
             class="btn-primary text-sm py-2 px-4">
            Amazon
          </a>
        {/if}
        {#if book.buyLinks.barnes}
          <a href={book.buyLinks.barnes} target="_blank" rel="noopener noreferrer"
             class="btn-secondary text-sm py-2 px-4">
            Barnes & Noble
          </a>
        {/if}
      </div>
    {:else}
      <button class="btn-secondary text-sm py-2 px-4 opacity-50 cursor-not-allowed" disabled>
        {statusText}
      </button>
    {/if}
  </div>
</div>