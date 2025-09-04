<!-- src/lib/components/Hero.svelte - FIXED VERSION -->
<script lang="ts">
  import { createImageFallback } from '$lib/utils/image';

  export let title: string;
  export let subtitle: string;
  export let ctaLink: string;
  export let ctaText: string;
  export let genre: 'faith' | 'epic' | 'sci-fi' | null | undefined = null;
  export let bookCover: string | null | undefined = null;

  // Normalize genre so we always have a safe value
  $: safeGenre =
    genre === 'epic'
      ? 'epic'
      : genre === 'sci-fi'
      ? 'sci-fi'
      : 'faith';

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

  // bookCover is now a Firebase Storage path
  $: coverSrc = bookCover;

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

<section class={`relative text-white py-20 overflow-hidden ${gradientClass}`}>
  <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
    {#if coverSrc}
      <div class="w-48 h-72 flex-shrink-0">
        <img
          src={coverSrc}
          alt={`${title} cover`}
          class="w-full h-full object-cover rounded shadow-lg transition-opacity duration-300"
          on:error={dimOrFallback}
        />
      </div>
    {/if}

    <div class="text-center md:text-left">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
      <p class="text-xl mb-8">{subtitle}</p>
      <a
        href={ctaLink}
        class={`inline-block px-8 py-4 rounded-lg font-semibold transition-colors duration-300 ${ctaStyle}`}
      >
        {ctaText}
      </a>
    </div>
  </div>
</section>