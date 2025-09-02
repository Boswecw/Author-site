<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Hero from '$lib/components/Hero.svelte';
  import BookCard from '$lib/components/BookCard.svelte';
  import { imageService, APP_IMAGES, FALLBACK_IMAGES } from '$lib/services/imageLoading';
  import type { BookDoc } from '$lib/server/books';

  export let data: {
    featured: BookDoc | null;
    upcoming: BookDoc[];
  };

  // Preload critical images on mount
  onMount(() => {
    const criticalImages = [
      APP_IMAGES.SIGNATURE_LOGO,
      APP_IMAGES.ICONS.FAITH,
      APP_IMAGES.ICONS.EPIC,
      APP_IMAGES.FIREFIGHTER_PHOTO
    ];

    if (data.featured?.cover) {
      criticalImages.push(data.featured.cover);
    }

    // Preload in background with progress tracking
    imageService.preloadImages(criticalImages, (loaded, total) => {
      console.log(`Preloaded ${loaded}/${total} critical images`);
    });
  });

  function toCardProps(b: BookDoc) {
    return {
      title: b.title,
      description: b.description,
      status: b.publishDate
        ? `Coming ${new Date(b.publishDate).toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
          })}`
        : 'Coming Soon',
      isbn: b.isbn,
      format: b.format,
      coverSrc: imageService.normalizeFirebaseUrl(b.cover) || b.cover
    };
  }

  // Fix the cover URL if needed
  $: featuredCover = data.featured?.cover ? imageService.normalizeFirebaseUrl(data.featured.cover) : null;
</script>

<svelte:head>
  <title>Charles W. Boswell — Navy Veteran & Fantasy Author</title>
  <meta name="description" content="From U.S. Navy service to wildland firefighting to epic fantasy novels. Stories of courage, brotherhood, and faith forged in fire." />
  
  <!-- Preload critical images -->
  <link rel="preload" href={APP_IMAGES.SIGNATURE_LOGO} as="image" />
  <link rel="preload" href={APP_IMAGES.ICONS.FAITH} as="image" />
  {#if featuredCover}
    <link rel="preload" href={featuredCover} as="image" />
  {/if}
</svelte:head>

{#if data.featured}
  <Hero
    title={data.featured.title}
    subtitle={data.featured.description}
    bookCover={featuredCover}
    ctaText="View Book Details"
    ctaLink={`/books/${data.featured.id}`}
    genre={data.featured.genre}
  />
{:else}
  <Hero />
{/if}

<!-- Upcoming Books -->
<section class="py-16 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Upcoming Books</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        New stories of faith, courage, and elemental magic are on their way.
      </p>
    </div>
    
    {#if data.upcoming.length > 0}
      <div class="grid gap-6 sm:gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        {#each data.upcoming as book}
          <BookCard {...toCardProps(book)} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">More Books Coming Soon</h3>
        <p class="text-gray-600 max-w-md mx-auto">
          I'm working on new stories that blend real-world experience with fantasy adventure.
        </p>
      </div>
    {/if}
  </div>
</section>

<!-- About Author with Fire Gear Photo -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          From Frontlines to Fiction
        </h2>
        <p class="text-lg text-gray-600 mb-6">
          My journey from Navy service to 16 years of wildland firefighting has
          given me unique insight into courage, brotherhood, and the power of
          faith under fire.
        </p>
        <p class="text-lg text-gray-600 mb-8">
          Each story combines Christian conviction with elemental trials —
          fantasy with the depth of lived experience.
        </p>
        <a href="/about" class="btn-primary">Read My Full Story</a>
      </div>
      
      <div class="flex justify-center">
        <div class="relative">
          <!-- Show fallback immediately -->
          <img
            src={FALLBACK_IMAGES.AUTHOR_PHOTO}
            alt="Charles Boswell in firefighting gear"
            class="rounded-lg shadow-xl w-full max-w-md"
            width="640"
            height="800"
          />
          
          <!-- Load real image on top -->
          <img
            src={imageService.normalizeFirebaseUrl(APP_IMAGES.FIREFIGHTER_PHOTO)}
            alt="Charles Boswell in firefighting gear"
            class="absolute inset-0 rounded-lg shadow-xl w-full max-w-md transition-opacity duration-500 opacity-0"
            width="640"
            height="800"
            loading="lazy"
            on:load={(e) => e.currentTarget.classList.replace('opacity-0', 'opacity-100')}
            on:error={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Newsletter Signup -->
<section class="py-16 bg-gradient-to-r from-red-50 to-orange-50">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Stay Connected</h2>
    <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
      Get exclusive updates on new releases, behind-the-scenes stories from the fireline,
      and insights into the writing process.
    </p>
    
    <div class="inline-flex flex-col sm:flex-row gap-4 items-center">
      <a href="/contact" class="btn-primary">
        Join My Newsletter
      </a>
      <span class="text-sm text-gray-500">
        No spam, unsubscribe anytime
      </span>
    </div>
  </div>
</section>