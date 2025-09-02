<script lang="ts">
    import { IMAGES } from '$lib/utils/image';

  export let title = 'Epic Fantasy Born from Real Experience';
  export let subtitle = 'From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and faith.';
  export let ctaText = 'Read Latest Book';
  export let ctaLink = '/books';
  export let bookCover: string | null = null;
  export let genre: 'faith' | 'epic' = 'faith';

  $: heroIcon = genre === 'epic' ? IMAGES.EPIC_ICON : IMAGES.FAITH_ICON;
  $: iconAlt = genre === 'epic' ? 'Epic Fantasy Icon' : 'Christian Fiction Icon';

  function handleIconError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    const fallbackText = genre === 'epic' ? 'EPIC' : 'FAITH';
    img.outerHTML = `<div class="w-32 h-32 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold ember-glow">${fallbackText}</div>`;
  }

  function handleBookCoverError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    img.style.opacity = '0.7';
    img.style.filter = 'grayscale(50%)';
  }
</script>

<section class="fire-gradient text-white section-padding relative overflow-hidden">
  <div class="container-width relative">
    <!-- Hero Icon -->
    <div class="text-center mb-12">
      <img
        src={heroIcon}
        alt={iconAlt}
        class="w-32 h-32 mx-auto rounded-full ember-glow object-cover"
        on:error={handleIconError}
      />
    </div>

    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Hero Content -->
      <div class="text-center lg:text-left">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          {title}
        </h1>
        <p class="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
          {subtitle}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a href={ctaLink} class="btn-primary bg-white text-red-600 hover:bg-gray-50">
            {ctaText}
          </a>
          <a href="/about" class="btn-secondary border-white text-white hover:bg-white/10">
            Learn My Story
          </a>
        </div>
      </div>

      <!-- Featured Book Cover -->
      {#if bookCover}
        <div class="flex justify-center lg:justify-end">
          <div class="relative">
            <img
              src={bookCover}
              alt="Featured book cover"
              class="w-64 md:w-80 h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
              on:error={handleBookCoverError}
            />
            <div class="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 rounded-lg"></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>