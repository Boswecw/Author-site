<script lang="ts">
  import type { Book } from '$lib/types';
  export let book: Book;

  // Safe checks to prevent undefined errors
  $: isPublished = book?.status === 'published';
  $: pub = book?.publishDate ? 
    new Date(book.publishDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long'
    }) : 'TBD';

  let emailInput = '';
  let notificationSent = false;

  function handleNotification() {
    if (!emailInput) return;
    notificationSent = true;
    emailInput = '';
    setTimeout(() => notificationSent = false, 3000);
  }
</script>

{#if book}
<article class="grid gap-4 md:grid-cols-[140px,1fr] bg-white rounded-2xl shadow p-5">
  <figure class="relative overflow-hidden rounded-xl">
    <img
      src={book.cover}
      alt={`Cover of ${book.title}`}
      width="300"
      height="450"
      loading="lazy"
      decoding="async"
      class="w-full h-auto object-cover"
      style="aspect-ratio: 2 / 3;"
    />
  </figure>

  <div class="min-w-0">
    <h3 class="text-xl font-semibold">{book.title}</h3>

    <p class="mt-2 text-gray-700 leading-relaxed break-words hyphens-auto">
      {book.description}
    </p>

    <p class="mt-2 text-sm text-gray-500">
      <strong>Status:</strong> {isPublished ? 'Available' : `Coming ${pub}`}
      {#if book.isbn} • ISBN: {book.isbn}{/if}
      {#if book.format} • {book.format}{/if}
    </p>

    <!-- Action Section -->
    <div class="mt-4">
      {#if isPublished && book.buyLinks && Object.keys(book.buyLinks).length > 0}
        <div class="flex gap-2 flex-wrap">
          {#each Object.entries(book.buyLinks) as [platform, url]}
            {#if url}
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary !py-1 !px-3 !text-sm"
              >
                {platform}
              </a>
            {/if}
          {/each}
        </div>
      {:else}
        {#if notificationSent}
          <div class="bg-green-50 border border-green-200 rounded p-2 text-center">
            <p class="text-green-700 text-sm">✓ You'll be notified when {book.title} is released!</p>
          </div>
        {:else}
          <form on:submit|preventDefault={handleNotification} class="flex gap-2">
            <input 
              bind:value={emailInput}
              class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500" 
              type="email" 
              placeholder="Get release email..." 
              required 
            />
            <button 
              class="btn-primary !py-1 !px-3 !text-sm" 
              type="submit"
              disabled={!emailInput}
            >
              Notify Me
            </button>
          </form>
        {/if}
      {/if}
    </div>
  </div>
</article>
{:else}
<div class="bg-gray-100 rounded p-4 text-center">
  <p class="text-gray-500">Book information not available</p>
</div>
{/if}