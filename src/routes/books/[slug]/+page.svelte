<!-- src/routes/books/[slug]/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { getImageUrl, createImageFallback } from '$lib/services/authorImages';
    import { onMount } from 'svelte';
    
    export let data: PageData;
    
    $: book = data.book;
    $: coverUrl = getImageUrl(book.cover);
    $: fallbackUrl = createImageFallback(book.title, 'book');
    
    let imageLoaded = false;
    let imageError = false;
    
    function handleImageLoad() {
      imageLoaded = true;
    }
    
    function handleImageError() {
      imageError = true;
    }
  </script>
  
  <svelte:head>
    <title>{book.title} by Charles Boswell</title>
    <meta name="description" content={book.description} />
  </svelte:head>
  
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="grid md:grid-cols-2 gap-12 mb-12">
      <!-- Book Cover -->
      <div class="flex justify-center">
        <div class="w-80 h-auto">
          {#if coverUrl && !imageError}
            <img 
              src={coverUrl}
              alt="{book.title} - Book cover"
              class="w-full h-auto rounded-lg shadow-2xl"
              class:opacity-0={!imageLoaded}
              class:opacity-100={imageLoaded}
              on:load={handleImageLoad}
              on:error={handleImageError}
              loading="eager"
            />
          {:else}
            <img 
              src={fallbackUrl}
              alt="{book.title} - Cover coming soon"
              class="w-full h-auto rounded-lg shadow-2xl opacity-80"
            />
          {/if}
        </div>
      </div>
      
      <!-- Book Details -->
      <div class="space-y-6">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p class="text-xl text-gray-600">by Charles Boswell</p>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {book.genre || 'Fiction'}
          </span>
          <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {book.status || 'Upcoming'}
          </span>
        </div>
        
        <p class="text-lg text-gray-700 leading-relaxed">{book.description}</p>
        
        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
          <dl class="space-y-2">
            {#if book.publishDate}
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Release Date:</dt>
                <dd class="text-sm text-gray-900">{new Date(book.publishDate).toLocaleDateString()}</dd>
              </div>
            {/if}
            {#if book.pages}
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Pages:</dt>
                <dd class="text-sm text-gray-900">{book.pages}</dd>
              </div>
            {/if}
            {#if book.format}
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Format:</dt>
                <dd class="text-sm text-gray-900">{book.format}</dd>
              </div>
            {/if}
            {#if book.isbn}
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">ISBN:</dt>
                <dd class="text-sm text-gray-900">{book.isbn}</dd>
              </div>
            {/if}
          </dl>
        </div>
        
        <div class="border-t pt-6">
          {#if book.status === 'published'}
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Get Your Copy</h3>
            <div class="space-y-3">
               {#if book.buyLinks?.amazon}
                <a 
                  href={book.buyLinks.amazon}
                  class="block w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-6 rounded-lg text-center transition-colors"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Buy on Amazon
                </a>
              {/if}
              {#if book.buyLinks?.barnes}
                <a 
                  href={book.buyLinks.barnes}
                  class="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Buy on Barnes & Noble
                </a>
              {/if}
            </div>
          {:else}
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">Coming Soon</h3>
              <p class="text-blue-700">
                This book is currently in development. 
                {#if book.publishDate}
                  Expected release: {new Date(book.publishDate).toLocaleDateString()}.
                {/if}
                <a href="/contact" class="underline hover:no-underline">Contact me</a> for updates!
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Navigation -->
    <div class="text-center border-t pt-8">
      <a 
        href="/books" 
        class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        ← Back to All Books
      </a>
    </div>
  </div>
  
  <style>
    img {
      transition: opacity 0.3s ease;
    }
  </style>