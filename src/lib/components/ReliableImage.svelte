<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { resolveFirebaseImage, createFallbackImage } from '$lib/utils/imageResolver';

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
  let imgElement: HTMLImageElement;

  // Create fallback image
  $: fallbackSrc = createFallbackImage(fallbackText, fallbackType);

  // Resolve image when src changes
  $: if (browser && src && src !== resolvedSrc) {
    loadImage(src);
  }

  async function loadImage(imageSrc: string) {
    if (!browser) return;

    isLoading = true;
    hasError = false;

    try {
      // Try to resolve Firebase image
      const resolved = await resolveFirebaseImage(imageSrc);
      
      if (resolved) {
        // Test if the resolved URL actually loads
        await new Promise<void>((resolve, reject) => {
          const testImg = new Image();
          testImg.onload = () => resolve();
          testImg.onerror = () => reject(new Error('Image failed to load'));
          testImg.src = resolved;
        });

        resolvedSrc = resolved;
        isLoading = false;
      } else {
        throw new Error('Failed to resolve image');
      }
    } catch (error) {
      console.warn('[ReliableImage] Load error:', imageSrc, error);
      hasError = true;
      isLoading = false;
      resolvedSrc = fallbackSrc;
    }
  }

  function handleImageError() {
    console.warn('[ReliableImage] Image error event:', src);
    hasError = true;
    isLoading = false;
    resolvedSrc = fallbackSrc;
  }

  onMount(() => {
    if (src) {
      loadImage(src);
    } else {
      isLoading = false;
      hasError = true;
      resolvedSrc = fallbackSrc;
    }
  });
</script>

{#if isLoading}
  <div 
    class={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
    style={`${width ? `width: ${typeof width === 'number' ? width + 'px' : width};` : ''}${height ? ` height: ${typeof height === 'number' ? height + 'px' : height};` : ''}`}
  >
    <span class="text-gray-400 text-sm">Loading...</span>
  </div>
{:else}
  <img
    bind:this={imgElement}
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