<script lang="ts">
  import GenreIcon from './GenreIcon.svelte';
  import { createImageFallback } from '$lib/utils/image';
  import { normalizeFirebaseUrl } from '$lib/utils/urls'; // ✅ make sure this exists

  export let title = 'Epic Fantasy Born from Real Experience';
  export let subtitle =
    'From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and Faith.';
  export let ctaText = 'Read Latest Book';
  export let ctaLink = '/books';
  export let genre: 'faith' | 'epic' | 'sci-fi' = 'faith';
  export let bookCover: string | null = null;

  // Normalize genre so we always have a safe value
  $: safeGenre =
    genre === 'epic' ? 'epic' :
    genre === 'sci-fi' ? 'sci-fi' :
    'faith';

  // Background gradients by genre
  $: gradientClass =
    safeGenre === 'epic'
      ? 'bg-gradient-to-br from-red-900 via-red-700 to-orange-600'
      : safeGenre === 'sci-fi'
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-700'
      : 'bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-600';

  // CTA button style by genre
  $: ctaStyle =
    safeGenre === 'epic'
      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
      : safeGenre === 'sci-fi'
      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';

  // Normalize Firebase covers (handles firebasestorage.app → appspot.com, etc.)
  $: coverSrc = bookCover ? normalizeFirebaseUrl(bookCover) : null;

  function dimOrFallback(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    if (!img.dataset._logged) {
      console.warn('[Hero cover] failed to load:', img.src);
      img.dataset._logged = '1';
    }
    img.src = createImageFallback('Cover Unavailable');
    img.style.opacity = '1';
  }
</script>
