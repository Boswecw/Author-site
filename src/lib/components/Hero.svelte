<!-- src/lib/components/Hero.svelte -->
<script lang="ts">
  export let title = 'Epic Fantasy Born from Real Experience';
  export let subtitle =
    'From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and Faith.';
  export let ctaText = 'Read Latest Book';
  export let ctaLink = '/books';

  // choose which icon to show
  export let genre: 'faith' | 'epic' = 'faith';

  
const ICON_FAITH =
  'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d';

const ICON_EPIC =
  'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025';


  $: iconUrl = genre === 'epic' ? ICON_EPIC : ICON_FAITH;
  $: iconAlt = genre === 'epic' ? 'Epic Fantasy Writer Icon' : 'Christian Fiction Writer Icon';

  // book cover: pass a full URL from the parent when you render <Hero ...>
  export let bookCover: string | null = null;

  let iconFailed = false;
  let coverFailed = false;

  function handleIconError() {
    iconFailed = true;
    // console.warn('Icon failed to load:', iconUrl);
  }
  function handleCoverError() {
    coverFailed = true;
    // console.warn('Book cover failed to load:', bookCover);
  }
</script>

<section class="fire-gradient text-white pt-10 pb-20 lg:pt-16 lg:pb-28 relative overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="text-center mb-10">
      {#if !iconFailed}
        <img
          src={iconUrl}
          alt={iconAlt}
          class="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-2xl ember-glow mx-auto"
          loading="eager"
          decoding="async"
          referrerpolicy="no-referrer"
          crossorigin="anonymous"
          on:error={handleIconError}
        />
      {:else}
        <span
          class="inline-flex items-center justify-center w-40 h-40 md:w-56 md:h-56 rounded-full bg-white/10 border border-white/20 mx-auto text-lg"
          title="Icon failed to load"
        >
          {iconAlt}
        </span>
      {/if}
    </div>

    <div class="grid lg:grid-cols-2 gap-10 items-center">
      <div class="text-center lg:text-left">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">{title}</h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">{subtitle}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a href={ctaLink} class="btn-primary ember-glow">{ctaText}</a>
          <a href="/about" class="btn-secondary !bg-white/10 !text-white hover:!bg-white/20 border border-white/30">
            Learn My Story
          </a>
        </div>
      </div>

      {#if bookCover}
        <div class="flex justify-center lg:justify-end">
          {#if !coverFailed}
            <img
              src={bookCover}
              alt={`Featured book cover: ${title}`}
              class="w-64 md:w-80 lg:w-96 h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
              loading="eager"
              decoding="async"
              referrerpolicy="no-referrer"
              crossorigin="anonymous"
              on:error={handleCoverError}
            />
          {:else}
            <div
              class="w-64 md:w-80 lg:w-96 h-96 rounded-lg border border-white/30 bg-white/5 grid place-items-center text-white/80"
              title="Cover failed to load"
            >
              Cover unavailable
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>
