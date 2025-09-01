<script lang="ts">
  import BookCard from '$lib/components/BookCard.svelte';
  import { books } from '$lib/data/books';
  
  $: publishedBooks = books.filter(book => book.status === 'published');
  $: upcomingBooks = books.filter(book => book.status === 'upcoming');
</script>

<svelte:head>
  <title>Books by Charles W. Boswell - Epic Fantasy Novels</title>
  <meta name="description" content="Discover epic fantasy novels that blend military precision with elemental magic, inspired by real Navy and firefighting experience." />
</svelte:head>

<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">My Books</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Epic fantasy novels that combine military strategy with elemental magic, 
        inspired by years of service and real-world courage.
      </p>
    </div>

    <!-- Upcoming Books -->
    {#if upcomingBooks.length > 0}
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Coming Soon</h2>
        <div class="grid gap-8 max-w-4xl mx-auto">
          {#each upcomingBooks as book}
            <BookCard {book} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Published Books -->
    {#if publishedBooks.length > 0}
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Available Now</h2>
        <div class="grid gap-8 max-w-4xl mx-auto">
          {#each publishedBooks as book}
            <BookCard {book} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center mb-16">
        <div class="bg-white rounded-lg shadow-lg p-12">
          <div class="text-6xl mb-6">📚</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">More Books Coming Soon</h2>
          <p class="text-gray-600 mb-6">
            I'm currently working on exciting new fantasy novels. Stay tuned for updates!
          </p>
          <a href="/contact" class="btn-primary">
            Get Notified of New Releases
          </a>
        </div>
      </div>
    {/if}

    <!-- Series Information (if applicable) -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">About My Writing</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Authentic Experience</h3>
          <p class="text-gray-600">
            Every battle scene, every moment of brotherhood is grounded in real military and firefighting experience.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Elemental Magic</h3>
          <p class="text-gray-600">
            Magic systems that reflect the unpredictable, dangerous nature of the elements I've worked with.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Brotherhood & Honor</h3>
          <p class="text-gray-600">
            Stories that explore the deep bonds forged in crisis and the codes that guide true warriors.
          </p>
        </div>
      </div>
    </div>

    <!-- Newsletter Signup CTA -->
    <div class="bg-white rounded-lg shadow-lg p-8 text-center max-w-2xl mx-auto">
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Never Miss a Release</h3>
      <p class="text-gray-600 mb-6">
        Be the first to know about new books, exclusive previews, and special offers. 
        Plus, get behind-the-scenes stories from my firefighting and military days.
      </p>
      <a href="/contact" class="btn-primary">
        Join My Newsletter
      </a>
    </div>
  </div>
</section>