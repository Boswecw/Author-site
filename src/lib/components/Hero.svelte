<script lang="ts">
  import GenreIcon from './GenreIcon.svelte';

  export let title = 'Epic Fantasy Born from Real Experience';
  export let subtitle = 'From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and Faith.';
  export let ctaText = 'Read Latest Book';
  export let ctaLink = '/books';
  export let genre: 'faith' | 'epic' = 'faith';
  export let bookCover: string | null = null;

  // Dynamic styling based on genre
  $: gradientClass = genre === 'epic'
    ? 'bg-gradient-to-br from-red-900 via-red-700 to-orange-600'
    : 'bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-600';

  $: ctaStyle = genre === 'epic'
    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';
</script>

<section class="text-white pt-10 pb-20 lg:pt-16 lg:pb-28 relative overflow-hidden {gradientClass}">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

    <!-- Genre Icon -->
    <div class="text-center mb-10">
      <GenreIcon {genre} size="large" />
    </div>

    <div class="grid lg:grid-cols-2 gap-10 items-center">
      <div class="text-center lg:text-left">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          {title}
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
          {subtitle}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a
            href={ctaLink}
            class="px-8 py-4 rounded-lg font-semibold text-white shadow-lg transform hover:scale-105 transition-all duration-200 {ctaStyle}"
          >
            {ctaText}
          </a>
          <a
            href="/about"
            class="px-8 py-4 rounded-lg font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/30 transform hover:scale-105 transition-all duration-200"
          >
            Learn My Story
          </a>
        </div>
      </div>

      {#if bookCover}
        <div class="flex justify-center lg:justify-end">
          <img
            src={bookCover}
            alt={`Featured book cover: ${title}`}
            class="w-64 md:w-80 lg:w-96 h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
            loading="eager"
            onerror="this.style.opacity='0.5';"
          />
        </div>
      {/if}
    </div>
  </div>
</section>

