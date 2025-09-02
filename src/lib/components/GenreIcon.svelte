<script lang="ts">
  // Props
  export let src: string;
  export let alt: string = '';
  export let genre: 'faith' | 'epic' = 'faith';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  // Classic Svelte (no runes)
  let showFallback = false;

  // Size classes
  $: sizeClasses =
    size === 'sm' ? 'w-8 h-8'
    : size === 'lg' ? 'w-20 h-20'
    : 'w-12 h-12';

  function handleError() {
    showFallback = true;
  }
</script>

{#if !showFallback}
  <img
    src={src}
    alt={alt}
    class="{sizeClasses} rounded-full shadow-lg object-cover"
    loading="lazy"
    on:error={handleError}
  />
{:else}
  <div
    class="{sizeClasses} rounded-full shadow-lg flex items-center justify-center font-semibold
            {genre === 'epic' ? 'bg-indigo-700 text-white' : 'bg-amber-600 text-white'}"
    aria-label="Genre icon fallback"
  >
    {genre === 'epic' ? 'EPIC' : 'FAITH'}
  </div>
{/if}
