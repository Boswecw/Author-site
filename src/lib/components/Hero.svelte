<!-- ===== src/lib/components/Hero.svelte ===== -->
<script lang="ts">
  export let title: string =
    "Epic Fantasy Born from Real Experience";
  export let subtitle: string =
    "From Navy decks to wildfire frontlines, now crafting tales of courage, brotherhood, and Faith.";
  // Default to your Firebase cover, but still allow override via prop
  export let bookCover: string =
    "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Faith%20in%20a%20FireStorm%20Cover.png?alt=media&token=96a07f8e-b0f6-47b4-bcba-84f581a475da";
  export let ctaText: string = "Read Latest Book";
  export let ctaLink: string = "/books";

  // Site icon from Firebase
  const iconUrl =
    "https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/Charle_Boswell_Christian_Fiction_icon.png?alt=media&token=ee498640-61e5-4a6f-8410-9684bb1624d1";
</script>

<section class="fire-gradient text-white py-20 lg:py-32 relative overflow-hidden">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
    <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <pattern id="flame-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10,18 C6,16 6,8 10,2 C14,8 14,16 10,18 Z" fill="currentColor" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#flame-pattern)" />
    </svg>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <!-- Centered Website Icon -->
    <div class="text-center mb-12">
      <div class="inline-block relative">
        <div class="absolute -inset-2 fire-gradient rounded-full blur opacity-30 animate-pulse"></div>
        <img
          src={iconUrl}
          alt="Charles Boswell Christian Fiction Icon"
          class="relative w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl ember-glow mx-auto"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-12 items-center">
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
          <a
            href="/about"
            class="btn-secondary !bg-white/10 !text-white hover:!bg-white/20 border border-white/30"
          >
            Learn My Story
          </a>
        </div>
      </div>

      <div class="flex justify-center lg:justify-end">
        <div class="relative">
          <div class="absolute -inset-4 fire-gradient rounded-lg blur opacity-25 animate-pulse"></div>
          <img
            src={bookCover}
            alt="Featured book cover: Faith in a FireStorm"
            class="relative w-64 md:w-80 lg:w-96 h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </div>
</section>
