<!-- src/lib/components/Hero.svelte - SIMPLIFIED -->
<script lang="ts">
  import { IMAGES } from '$lib/utils/images';

  export let title = 'Epic Fantasy Born from Real Experience';
  export let subtitle = 'From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and Faith.';
  export let ctaText = 'Read Latest Book';
  export let ctaLink = '/books';
  export let genre: 'faith' | 'epic' = 'faith';
  export let bookCover: string | null = null;

  // Just use the fixed URLs directly
  $: iconUrl = genre === 'epic' ? IMAGES.EPIC_ICON : IMAGES.FAITH_ICON;
  $: iconAlt = genre === 'epic' ? 'Epic Fantasy Writer Icon' : 'Christian Fiction Writer Icon';
</script>

<section class="fire-gradient text-white pt-10 pb-20 lg:pt-16 lg:pb-28 relative overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    
    <!-- Icon - simple approach -->
    <div class="text-center mb-10">
      <img
        src={iconUrl}
        alt={iconAlt}
        class="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-2xl ember-glow mx-auto"
        loading="eager"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      
      <!-- Simple fallback that shows if image fails -->
      <div 
        class="w-40 h-40 md:w-56 md:h-56 rounded-full bg-white/10 border-2 border-white/20 mx-auto shadow-2xl ember-glow items-center justify-center text-white font-bold text-lg hidden"
      >
        {genre === 'epic' ? 'EPIC' : 'FAITH'}
      </div>
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
          <a href={ctaLink} class="btn-primary ember-glow">
            {ctaText}
          </a>
          <a href="/about" class="btn-secondary !bg-white/10 !text-white hover:!bg-white/20 border border-white/30">
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