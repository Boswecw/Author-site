<!-- src/lib/components/BookCard.svelte - FIXED VERSION -->
<script lang="ts">
  import type { Book } from '$lib/types';
  import { createImageFallback, imageLoader } from '$lib/utils/image';
  import { normalizeFirebaseUrl } from '$lib/utils/urls';
  import { onMount } from 'svelte';

  export let book: Book;
  
  let imageElement: HTMLImageElement;
  let imageLoaded = false;
  let imageError = false;
  let isLoading = true;

  // ✅ FIXED: Better URL handling
  $: coverUrl = normalizeFirebaseUrl(book.cover) ?? book.cover;
  $: fallbackSrc = createImageFallback(book.title, 'book');
  
  onMount(() => {
    if (coverUrl) {
      // Preload the image
      imageLoader.load(coverUrl).then((result) => {
        if (result && imageElement) {
          imageElement.src = result;
          imageLoaded = true;
          imageError = false;
        } else {
          imageError = true;
          if (imageElement) {
            imageElement.src = fallbackSrc;
          }
        }
        isLoading = false;
      }).catch(() => {
        imageError = true;
        if (imageElement) {
          imageElement.src = fallbackSrc;
        }
        isLoading = false;
      });
    } else {
      // No cover URL, use fallback immediately
      isLoading = false;
      imageError = true;
    }
  });

  function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
    isLoading = false;
  }

  function handleImageError() {
    imageError = true;
    imageLoaded = false;
    isLoading = false;
    if (imageElement) {
      imageElement.src = fallbackSrc;
    }
  }
</script>

<div class="relative group">
  <!-- Loading State -->
  {#if isLoading}
    <div class="w-full h-80 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <div class="text-gray-400 text-sm">Loading...</div>
    </div>
  {:else}
    <!-- Image -->
    <img
      bind:this={imageElement}
      src={coverUrl || fallbackSrc}
      alt={`Cover of ${book.title}`}
      class="w-full h-80 object-cover rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl"
      class:opacity-75={imageError}
      loading="lazy"
      decoding="async"
      on:load={handleImageLoad}
      on:error={handleImageError}
    />
    
    <!-- Error indicator -->
    {#if imageError}
      <div class="absolute inset-0 bg-red-900 bg-opacity-20 rounded-lg flex items-center justify-center">
        <div class="text-white text-xs bg-red-800 px-2 py-1 rounded">
          Cover Unavailable
        </div>
      </div>
    {/if}
  {/if}
  
  <!-- Book Info Overlay -->
  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <h3 class="text-white font-bold text-lg mb-1">{book.title}</h3>
    {#if book.description}
      <p class="text-gray-200 text-sm line-clamp-2">{book.description}</p>
    {/if}
    {#if book.status === 'coming-soon' && book.publishDate}
      <p class="text-orange-300 text-xs mt-2">
        Coming {new Date(book.publishDate).toLocaleDateString()}
      </p>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>