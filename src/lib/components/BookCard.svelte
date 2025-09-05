<!-- src/lib/components/BookCard.svelte -->
<script lang="ts">
  import type { Book } from '$lib/types';
  import { resolveCover } from '$lib/services/imageService';
  import { createImageFallback } from '$lib/utils/image';
  import { onMount } from 'svelte';

  export let book: Book;
  export let width = 200;
  export let height = 300;

  let coverUrl: string | null = null;
  let imageLoaded = false;
  let imageError = false;

  // Resolve once on mount…
  onMount(async () => {
    coverUrl = await resolveCover(book.cover ?? null);
    // console.debug('[BookCard] resolved on mount:', { id: book.id, cover: book.cover, coverUrl });
  });

  // …and whenever the book.cover changes
  $: (async () => {
    if (typeof book?.cover === 'string') {
      const u = await resolveCover(book.cover);
      if (u !== coverUrl) coverUrl = u;
    } else {
      coverUrl = null;
    }
  })();

  // Fallback SVG (sized by the container)
  $: fallbackUrl = createImageFallback(book.title || 'BOOK', 'book');

  function handleLoad() {
    imageLoaded = true;
    imageError = false;
  }

  function handleError(e: Event) {
    imageError = true;
    imageLoaded = false;
    // swap to fallback immediately
    const img = e.currentTarget as HTMLImageElement;
    img.src = fallbackUrl;
  }
</script>

<div class="book-card" style="width:{width}px;">
  <div class="image-container" style="height:{height}px;">
    <!-- Always render an <img>: real cover if available, else fallback -->
    <img
      src={coverUrl || fallbackUrl}
      alt={`${book.title} - Book cover`}
      on:load={handleLoad}
      on:error={handleError}
      class:loaded={imageLoaded && !imageError}
      class:fallback={imageError || !coverUrl}
      loading="lazy"
      decoding="async"
    />
  </div>

  <div class="book-info">
    <h3>{book.title}</h3>
    {#if book.description}
      <p>{book.description}</p>
    {/if}
  </div>
</div>

<style>
  .book-card {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,.1);
    transition: transform .2s ease;
    background: #fff;
  }
  .book-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,.15);
  }
  .image-container {
    position: relative;
    overflow: hidden;
    background: #f3f4f6;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity .3s ease;
  }
  img.loaded {
    opacity: 1;
  }
  img.fallback {
    opacity: .85;
    filter: saturate(.9);
  }
  .book-info {
    padding: 15px;
  }
  .book-info h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  .book-info p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
</style>
