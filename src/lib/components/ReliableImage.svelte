<!-- src/lib/components/ReliableImage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    // FIXED: Import from correct path (image.ts not images.ts)
    import { normalizeFirebaseUrl } from '$lib/utils/urls';
    
    export let src: string | null | undefined;
    export let alt: string = '';
    export let className: string = '';
    export let width: number | string | undefined = undefined;
    export let height: number | string | undefined = undefined;
    export let loading: 'eager' | 'lazy' = 'lazy';
    export let fallbackText: string = 'Image Unavailable';
    
    let imgElement: HTMLImageElement;
    let currentSrc = '';
    let isLoading = true;
    let hasError = false;
    let isVisible = false;
    
    // FIXED: Use the existing normalizeFirebaseUrl function
    $: cleanSrc = normalizeFirebaseUrl(src);
    
    // Create fallback inline (no import conflicts)
    $: fallbackSrc = createFallback(fallbackText, 
      typeof width === 'number' ? width : 300,
      typeof height === 'number' ? height : 400
    );
    
    // Simple fallback creator (no conflicts)
    function createFallback(text: string, w = 300, h = 400): string {
      const svg = `
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#7a1c1c" rx="8"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                font-family="serif" font-size="16" font-weight="600" fill="white">
            ${text}
          </text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    
    onMount(() => {
      if (!cleanSrc) {
        currentSrc = fallbackSrc;
        isLoading = false;
        hasError = true;
        return;
      }
      
      loadImage();
    });
    
    async function loadImage() {
      if (!cleanSrc) return;
      
      isLoading = true;
      hasError = false;
      
      try {
        // Create a new image element for testing
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        
        // Wait for load or error
        const result = await new Promise<boolean>((resolve) => {
          testImg.onload = () => resolve(true);
          testImg.onerror = () => resolve(false);
          testImg.src = cleanSrc;
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(false), 10000);
        });
        
        if (result) {
          currentSrc = cleanSrc;
          isLoading = false;
          hasError = false;
        } else {
          throw new Error('Failed to load image');
        }
      } catch (error) {
        console.warn('[ReliableImage] Load failed:', cleanSrc, error);
        currentSrc = fallbackSrc;
        isLoading = false;
        hasError = true;
      }
    }
    
    function handleLoad() {
      isLoading = false;
      isVisible = true;
    }
    
    function handleError() {
      if (currentSrc !== fallbackSrc) {
        console.warn('[ReliableImage] Image error, switching to fallback:', currentSrc);
        currentSrc = fallbackSrc;
        hasError = true;
      }
      isLoading = false;
      isVisible = true;
    }
  </script>
  
  <img
    bind:this={imgElement}
    src={currentSrc}
    {alt}
    class={`${className} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${isLoading ? 'animate-pulse' : ''}`}
    {width}
    {height}
    {loading}
    on:load={handleLoad}
    on:error={handleError}
    style={isLoading ? 'background-color: #f3f4f6;' : ''}
  />