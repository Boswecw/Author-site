<!-- src/lib/components/ReliableImage.svelte - COMPLETE FIX -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { normalizeFirebaseUrl } from '$lib/utils/urls';
  import { toBase64UnicodeSafe } from '$lib/utils/image';
  import { browser } from '$app/environment';
  
  // Props
  export let src: string | null | undefined = null;
  export let alt: string = '';
  export let className: string = '';
  export let width: number | string | undefined = undefined;
  export let height: number | string | undefined = undefined;
  export let loading: 'eager' | 'lazy' = 'lazy';
  export let fallbackType: 'book' | 'author' | 'logo' = 'book';
  
  // State
  let imgElement: HTMLImageElement;
  let isLoading = true;
  let hasError = false;
  let currentSrc = '';
  
  // Create simple fallback SVG
  function createFallback(type: 'book' | 'author' | 'logo'): string {
    const dimensions = type === 'book' ? '300 400' : '300 300';
    const text = type === 'book' ? 'BOOK' : type === 'author' ? 'AUTHOR' : 'CB';
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.split(' ')[0]}" height="${dimensions.split(' ')[1]}" viewBox="0 0 ${dimensions}">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" fill="#6b7280">${text}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${toBase64UnicodeSafe(svg)}`;
  }
  
  // Reactive statements
  $: cleanSrc = normalizeFirebaseUrl(src) ?? src ?? null;
  $: fallbackSrc = createFallback(fallbackType);
  
  // Load image when src changes
  $: if (cleanSrc && cleanSrc !== currentSrc) {
    loadImage(cleanSrc);
  }
  
  function loadImage(url: string) {
    if (!browser || !url) {
      handleError();
      return;
    }

    isLoading = true;
    hasError = false;
    currentSrc = url;

    const img = new Image();
    
    // Set CORS for Firebase images
    if (url.includes('firebasestorage.googleapis.com')) {
      img.crossOrigin = 'anonymous';
    }

    // Timeout to prevent hanging
    const timeout = setTimeout(() => {
      img.onload = img.onerror = null;
      handleError();
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      isLoading = false;
      hasError = false;
      if (imgElement) {
        imgElement.src = url;
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      handleError();
    };

    img.src = url;
  }

  function handleError() {
    console.warn('[ReliableImage] Failed to load', currentSrc);
    isLoading = false;
    hasError = true;
    if (imgElement) imgElement.src = fallbackSrc;
  }

  function handleImgError() {
    handleError();
  }

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
    style={`${width ? `width: ${typeof width === 'number' ? width + 'px' : width};` : ''}${height ? ` height: ${typeof height === 'number' ? height + 'px' : height};` : ''}`}
  >
    <span class="text-gray-400 text-sm">Loading...</span>
  </div>
{:else}
  <!-- Actual image -->
  <img
    bind:this={imgElement}
    src={hasError ? fallbackSrc : (cleanSrc || fallbackSrc)}
    {alt}
    class={className}
    class:opacity-75={hasError}
    {width}
    {height}
    {loading}
    decoding="async"
    on:error={handleImgError}
  />
{/if}

<!-- Error indicator for debugging -->
{#if hasError && process.env.NODE_ENV === 'development'}
  <div class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
    Fallback
  </div>
{/if}