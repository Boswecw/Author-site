<!-- src/lib/components/BookCover.svelte -->
<script lang="ts">
  export let src: string | null;
  export let alt = '';
  export let aspectRatio: '2/3' | '3/4' | 'auto' = '2/3'; // Book cover ratios
  export let className = '';

  function createFallback(text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" 
            font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        ${text || 'Book Cover'}
      </text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  function handleError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    img.src = createFallback(alt || 'Cover');
  }

  $: fallbackSrc = createFallback(alt || 'Cover');
</script>

<div 
  class="book-cover-container {className}"
  style:aspect-ratio={aspectRatio}
>
  <img
    src={src || fallbackSrc}
    {alt}
    loading="lazy"
    decoding="async"
    class="book-cover-image"
    on:error={handleError}
  />
</div>

<style>
  .book-cover-container {
    position: relative;
    width: 100%;
    background: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    /* Center the image */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book-cover-image {
    /* ✅ PERFECT: Shows full image without cropping */
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    
    /* Smooth loading */
    transition: opacity 0.3s ease;
  }

  /* Responsive aspect ratios */
  @media (max-width: 640px) {
    .book-cover-container {
      aspect-ratio: 2/3; /* Standard book ratio on mobile */
    }
  }
</style>