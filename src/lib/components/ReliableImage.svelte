<!-- src/lib/components/ReliableImage.svelte - DIRECT URL FIX -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { resolveFirebaseImage, createFallbackImage } from '$lib/utils/image';

  // Props
  export let src: string | null | undefined = null;
  export let alt: string = '';
  export let className: string = '';
  export let width: string | number | undefined = undefined;
  export let height: string | number | undefined = undefined;
  export let loading: 'lazy' | 'eager' = 'lazy';
  export let fallbackType: 'book' | 'avatar' | 'logo' = 'book';
  export let fallbackText: string = 'Loading';

  // State
  let isLoading = true;
  let hasError = false;
  let resolvedSrc: string | null = null;
  let currentSrc: string | null = null;

  // Create fallback image
  $: fallbackSrc = createFallbackImage(fallbackText, fallbackType);

  // Dynamic styles for loading placeholder
  $: placeholderStyle = [
    width ? `width: ${typeof width === 'number' ? width + 'px' : width};` : '',
    height ? `height: ${typeof height === 'number' ? height + 'px' : height};` : ''
  ].filter(Boolean).join(' ');

  // Handle src changes
  $: if (browser && src !== currentSrc) {
    currentSrc = src;
    loadImage(src);
  }

  async function loadImage(imageSrc: string | null | undefined) {
    if (!browser) return;

    if (!imageSrc) {
      handleNoSource();
      return;
    }

    isLoading = true;
    hasError = false;

    try {
      // ✅ KEY FIX: If it's already a Firebase Storage URL, use it directly
      if (imageSrc.includes('firebasestorage.googleapis.com')) {
        console.log('[ReliableImage] Using direct Firebase URL:', imageSrc);
        resolvedSrc = imageSrc;
        isLoading = false;
        hasError = false;
        return;
      }

      // ✅ Only resolve if it's NOT already a full URL
      if (/^https?:\/\//i.test(imageSrc)) {
        console.log('[ReliableImage] Using direct URL:', imageSrc);
        resolvedSrc = imageSrc;
        isLoading = false;
        hasError = false;
        return;
      }

      // Only try to resolve Firebase paths (not full URLs)
      console.log('[ReliableImage] Resolving Firebase path:', imageSrc);
      const resolved = await resolveFirebaseImage(imageSrc);
      
      if (resolved) {
        resolvedSrc = resolved;
        isLoading = false;
        hasError = false;
      } else {
        throw new Error('Failed to resolve image');
      }
    } catch (error) {
      console.warn('[ReliableImage] Load error:', imageSrc, error);
      handleError();
    }
  }

  function handleImageError() {
    console.warn('[ReliableImage] Image error event:', src);
    handleError();
  }

  function handleError() {
    hasError = true;
    isLoading = false;
    resolvedSrc = fallbackSrc;
  }

  function handleNoSource() {
    isLoading = false;
    hasError = true;
    resolvedSrc = fallbackSrc;
  }

  onMount(() => {
    if (src) {
      loadImage(src);
    } else {
      handleNoSource();
    }
  });
</script>

{#if isLoading}
  <div 
    class={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
    style={placeholderStyle}
    role="img"
    aria-label="Loading image..."
  >
    <span class="text-gray-400 text-sm select-none">Loading...</span>
  </div>
{:else}
  <img
    src={resolvedSrc || fallbackSrc}
    {alt}
    class={className}
    class:opacity-75={hasError}
    {width}
    {height}
    {loading}
    decoding="async"
    on:error={handleImageError}
  />
{/if}

{#if hasError && browser}
  <div class="sr-only">
    Image failed to load: {src}
  </div>
{/if}