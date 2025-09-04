<script lang="ts">
  // Props
  export let src: string;
  export let alt: string = '';
  export let genre: 'faith' | 'epic' | 'sci-fi' = 'faith';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  // Classic Svelte (no runes)
  let showFallback = false;

  // Size classes
  $: sizeClasses =
    size === 'sm' ? 'w-8 h-8'
    : size === 'lg' ? 'w-20 h-20'
    : 'w-12 h-12'; // default md

  function handleError() {
    showFallback = true;
  }

  // Fallback label + colors by genre
  $: fallbackLabel =
    genre === 'epic' ? 'EPIC' :
    genre === 'sci-fi' ? 'SCI-FI' :
    'FAITH';

  $: fallbackClass =
    genre === 'epic'
      ? 'bg-indigo-700 text-white'
      : genre === 'sci-fi'
      ? 'bg-purple-700 text-white'
      : 'bg-amber-600 text-white';
</script>
