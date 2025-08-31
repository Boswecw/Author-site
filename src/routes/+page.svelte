<script lang="ts">
    import Hero from '$lib/components/Hero.svelte';
    import BookCard from '$lib/components/BookCard.svelte';
    import { books } from '$lib/data/books'; // no extension
    const featuredBooks = books.slice(0, 3);
  </script>
  
  <svelte:head>
    <title>Charles W. Boswell — Epic Fantasy Writer | Home</title>
    <meta name="description" content="Navy veteran turned wildland firefighter, now crafting epic fantasy tales inspired by real-world courage and brotherhood. Discover my latest books." />
  </svelte:head>
  
  <Hero />
  
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Books</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Fantasy novels that blend military precision with elemental magic,
          inspired by years of service and firefighting.
        </p>
      </div>
  
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each featuredBooks as book}
          <BookCard {book} />
        {/each}
      </div>
  
      <div class="text-center mt-12">
        <a href="/books" class="btn-primary">View All Books</a>
      </div>
    </div>
  </section>
  
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">From Frontlines to Fiction</h2>
          <p class="text-lg text-gray-600 mb-6">
            My journey from Navy service to 16 years of wildland firefighting has given me
            unique insight into courage, brotherhood, and the power of the elements.
          </p>
          <p class="text-lg text-gray-600 mb-8">
            Each story combines military precision with elemental magic—fantasy with the depth of real experience.
          </p>
          <a href="/about" class="btn-primary">Read My Full Story</a>
        </div>
        <div class="flex justify-center">
          <img
            src="/api/placeholder/500/600"
            alt="Author in firefighting gear"
            class="rounded-lg shadow-xl w-full max-w-md"
          />
        </div>
      </div>
    </div>
  </section>
  