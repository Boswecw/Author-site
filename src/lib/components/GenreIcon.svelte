<script lang="ts">
  import { FIREBASE_IMAGES } from '$lib/services/imageLoading';
  
  export let genre: 'faith' | 'epic' = 'faith';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let src: string = '';
  export let alt: string = '';
  
  // Add aria-hidden as an optional prop
  let ariaHidden: boolean | undefined = undefined;
  export { ariaHidden as 'aria-hidden' };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  $: iconSrc = src || (genre === 'faith' ? FIREBASE_IMAGES.ICONS.CHRISTIAN_FICTION : FIREBASE_IMAGES.ICONS.EPIC_FANTASY);
  $: iconAlt = alt || `${genre === 'faith' ? 'Christian Fiction' : 'Epic Fantasy'} genre icon`;
  $: sizeClass = sizeClasses[size];
</script>

<div class="flex justify-center mb-4">
  {#if iconSrc}
    <img
      src={iconSrc}
      alt={iconAlt}
      class={`${sizeClass} object-contain`}
      aria-hidden={ariaHidden}
      loading="lazy"
      decoding="async"
    />
  {:else}
    <!-- Fallback SVG icon -->
    <div class={`${sizeClass} flex items-center justify-center rounded-full`} 
         class:bg-blue-600={genre === 'faith'}
         class:bg-red-600={genre === 'epic'}
         aria-hidden={ariaHidden}>
      {#if genre === 'faith'}
        <!-- Cross icon for Christian Fiction -->
        <svg class="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10C20 11.1 19.1 12 18 12H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V12H6C4.9 12 4 11.1 4 10C4 8.9 4.9 8 6 8H10V4C10 2.9 10.9 2 12 2Z"/>
        </svg>
      {:else}
        <!-- Sword icon for Epic Fantasy -->
        <svg class="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.92 5H5L6.5 6.5L8 5H6.92M19 3L6 16L7.5 17.5L8.5 16.5L9.5 17.5L11 16L13 18L21 10V3H19M19 5.41L13 11.41L11.59 10L17.59 4L19 5.41Z"/>
        </svg>
      {/if}
    </div>
  {/if}
</div>