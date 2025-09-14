<!-- src/lib/components/ReliableImage.svelte - FIXED for Svelte 5 with loading prop -->
<!-- @component
### Props
- `! alt` **unknown**
- `! className` **unknown**
- `! fallbackText` **unknown**
- `! fallbackType` **unknown** = `book`
- `! loading` **unknown** = `'lazy' // ✅ FIXED: Added missing loading prop`

no description yet
-->
<script lang="ts">
  import { createFallbackImage } from '$lib/utils/image';
  import type { ImageProps } from '$lib/types';

  // ✅ FIXED: Use $props() instead of export let for Svelte 5
  let {
    src,
    alt = '',
    className = '',
    fallbackText = '',
    fallbackType = 'book',
    loading = 'lazy'  // ✅ FIXED: Added missing loading prop
  }: ImageProps = $props();

  // Use server-built URLs directly with fallback
  function getImageUrl(): string {
    if (src && typeof src === 'string' && src.trim()) {
      return src.trim();
    }
    
    const text = fallbackText || alt || fallbackType.toUpperCase();
    return createFallbackImage(text.substring(0, 10), fallbackType);
  }

  // Error handler
  function handleError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    const fallbackSrc = createFallbackImage(
      (fallbackText || alt || fallbackType.toUpperCase()).substring(0, 10), 
      fallbackType
    );
    
    img.src = fallbackSrc;
    img.style.opacity = '0.8';
    console.warn('[ReliableImage] Failed to load image:', src);
  }
</script>

<img
  src={getImageUrl()}
  {alt}
  {loading}
  class={className}
  decoding="async"
  onerror={handleError}
/>