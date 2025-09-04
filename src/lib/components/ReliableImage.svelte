<!-- src/lib/components/ReliableImage.svelte - COMPLETE IMAGE FIX -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { normalizeFirebaseUrl } from '$lib/utils/urls';
  import { createImageFallback } from '$lib/utils/image';
  
  // Props
  export let src: string | null | undefined = null;
  export let alt: string = '';
  export let className: string = '';
  export let width: number | string | undefined = undefined;
  export let height: number | string | undefined = undefined;
  export let loading: 'eager' | 'lazy' = 'lazy';
  export let fallbackText: string = 'Image Unavailable';
  export let fallbackType: 'book' | 'avatar' | 'logo' = 'book';
  
  // State
  let imgElement: HTMLImageElement;
  let currentSrc = '';
  let isLoading = true;
  let hasError = false;
  let isVisible = false;
  
  // Reactive statements
  $: cleanSrc = normalizeFirebaseUrl(src) ?? src ?? null;
  $: fallbackSrc = createImageFallback(fallbackText, fallbackType);
  
  // Handle src changes
  $: if (cleanSrc && cleanSrc !== currentSrc) {
    loadImage(cleanSrc);
  }
  
  /**
   * Load image with proper error handling
   */
  function loadImage(url: string) {
    if (!url) {
      handleError();
      return;
    }

    isLoading = true;
    hasError = false;
    currentSrc = url;

    // Create image element for preloading
    const img = new Image();
    
    // Set CORS for Firebase images
    if (url.includes('firebasestorage.googleapis.com')) {
      img.crossOrigin = 'anonymous';
    }

    // Timeout handling
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      handleError();
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      handleSuccess(url);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      handleError();
    };

    img.src = url;
  }

  /**
   * Handle successful image load
   */
  function handleSuccess(url: string) {
    isLoading = false;
    hasError = false;
    
    if (imgElement) {
      imgElement.src = url;
    }
  }

  /**
   * Handle image load error
   */
  function handleError() {
    isLoading = false;
    hasError = true;
    
    if (imgElement) {
      imgElement.src = fallbackSrc;
    }
  }

  /**
   * Handle img element events
   */
  function handleImgLoad() {
    isLoading = false;
    isVisible = true;
  }

  function handleImgError() {
    if (!hasError) { // Only if not already handled
      handleError();
    }
  }

  // Initialize on mount
  onMount(() => {
    if (cleanSrc) {
      loadImage(cleanSrc);
    } else {
      handleError();
    }
  });
</script>

<!-- Loading placeholder -->
{#if isLoading && !hasError}
  <div 
    class={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
    style={`${width ? `width: ${typeof width === 'number' ? width + 'px' : width};` : ''}${height ? `height: ${typeof height === 'number' ? height + 'px' : height};` : ''}`}
  >
    <div class="text-gray-400 text-sm">Loading...</div>
  </div>
{:else}
  <!-- Actual image -->
  <img
    bind:this={imgElement}
    src={hasError ? fallbackSrc : (cleanSrc || fallbackSrc)}
    alt={alt}
    class={className}
    class:opacity-75={hasError}
    width={width}
    height={height}
    loading={loading}
    decoding="async"
    on:load={handleImgLoad}
    on:error={handleImgError}
  />
{/if}

<!-- Error indicator overlay for fallback images -->
{#if hasError && isVisible}
  <div class="absolute inset-0 flex items-end justify-end p-2 pointer-events-none">
    <div class="bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
      Fallback
    </div>
  </div>
{/if}