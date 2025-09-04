<!-- src/routes/+page.svelte - SIMPLE TEST VERSION -->
<script lang="ts">
  import ReliableImage from '$lib/components/ReliableImage.svelte';
  import { FIREBASE_IMAGES } from '$lib/services/imageLoading';
  
  export let data;
  
  // Test data if none from server
  $: featured = data?.featured || null;
  $: upcoming = data?.upcoming || [];
  
  console.log('[Homepage] Featured:', featured);
  console.log('[Homepage] Upcoming:', upcoming.length);
</script>

<svelte:head>
  <title>Charles Boswell - Fantasy Author</title>
  <meta name="description" content="Navy veteran, wildland firefighter, and fantasy novelist. Discover epic tales forged from real-world experience." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-r from-stone-900 to-brand-charcoal text-brand-cream min-h-screen flex items-center">
  <div class="container mx-auto px-4 py-16">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      
      <!-- Hero Content -->
      <div class="space-y-6">
        <h1 class="text-5xl lg:text-7xl font-bold leading-tight">
          <span class="text-brand-gold">Charles</span><br />
          <span class="text-brand-cream">Boswell</span>
        </h1>
        
        <p class="text-xl lg:text-2xl text-brand-cream/80 leading-relaxed">
          Navy veteran, wildland firefighter, and fantasy novelist.<br />
          <span class="text-brand-gold font-medium">Discover epic tales forged from real-world experience.</span>
        </p>
        
        <div class="flex flex-wrap gap-4 pt-4">
          <a 
            href="/books" 
            class="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Explore Books
          </a>
          <a 
            href="/about" 
            class="border border-brand-cream hover:bg-brand-cream/10 text-brand-cream font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            About Charles
          </a>
        </div>
      </div>
      
      <!-- Featured Book -->
      <div class="flex justify-center lg:justify-end">
        {#if featured}
          <div class="max-w-sm">
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div class="mb-4">
                <ReliableImage
                  src={featured.cover}
                  alt={featured.title}
                  className="w-full h-auto rounded-lg shadow-lg max-w-xs mx-auto"
                  fallbackType="book"
                  loading="eager"
                />
              </div>
              <h3 class="text-xl font-bold text-brand-cream mb-2">{featured.title}</h3>
              {#if featured.description}
                <p class="text-brand-cream/70 text-sm leading-relaxed">
                  {featured.description}
                </p>
              {/if}
              <div class="mt-4">
                <a 
                  href="/books/{featured.id}" 
                  class="inline-block text-brand-gold hover:text-brand-gold/80 font-medium text-sm transition-colors"
                >
                  Read More →
                </a>
              </div>
            </div>
          </div>
        {:else}
          <!-- Fallback if no featured book -->
          <div class="max-w-sm">
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div class="mb-4">
                <ReliableImage
                  src={FIREBASE_IMAGES.BOOKS.FAITH_IN_A_FIRESTORM}
                  alt="Faith in a Firestorm"
                  className="w-full h-auto rounded-lg shadow-lg max-w-xs mx-auto"
                  fallbackType="book"
                  loading="eager"
                />
              </div>
              <h3 class="text-xl font-bold text-brand-cream mb-2">Faith in a Firestorm</h3>
              <p class="text-brand-cream/70 text-sm leading-relaxed">
                A faith-forward wildfire drama inspired by 16 years on the line—courage, family, and grace when everything burns.
              </p>
              <div class="mt-4">
                <a 
                  href="/books" 
                  class="inline-block text-brand-gold hover:text-brand-gold/80 font-medium text-sm transition-colors"
                >
                  Explore Books →
                </a>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- Upcoming Books Section -->
{#if upcoming.length > 0}
  <section class="py-16 bg-brand-cream">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl lg:text-4xl font-bold text-brand-charcoal text-center mb-12">
          Upcoming Releases
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each upcoming.slice(0, 6) as book}
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div class="aspect-[3/4] overflow-hidden">
                <ReliableImage
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  fallbackType="book"
                />
              </div>
              <div class="p-4">
                <h3 class="text-lg font-bold text-brand-charcoal mb-2">{book.title}</h3>
                {#if book.description}
                  <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                    {book.description}
                  </p>
                {/if}
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500 uppercase tracking-wide">
                    {book.genre || 'Faith'}
                  </span>
                  {#if book.publishDate}
                    <span class="text-xs text-gray-500">
                      {new Date(book.publishDate).getFullYear()}
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="text-center mt-12">
          <a 
            href="/books" 
            class="inline-block bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-cream font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            View All Books
          </a>
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
