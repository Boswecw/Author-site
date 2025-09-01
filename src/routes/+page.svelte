<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import BookCard from '$lib/components/BookCard.svelte';
  import type { BookDoc } from '$lib/server/books';

  export let data: {
    featured: BookDoc | null;
    upcoming: BookDoc[];
  };

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
      coverSrc: b.cover
    };
  }
</script>

{#if data.featured}
  <Hero
    title={data.featured.title}
    subtitle={data.featured.description}
    bookCover={data.featured.cover}
    ctaText="View Book"
    ctaLink={`/books/${data.featured.id}`}
    genre={data.featured.genre}
  />
{:else}
  <Hero />
{/if}

<!-- Upcoming Books -->
<section class="mt-12 max-w-6xl mx-auto px-4 sm:px-6">
  <h2 class="text-2xl font-bold mb-6 text-gray-900">Upcoming Books</h2>
  <div class="grid gap-6 sm:gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
    {#each data.upcoming as b}
      <BookCard {...toCardProps(b)} />
    {/each}
  </div>
</section>

<!-- About Author with Fire Gear Photo -->
<section class="py-20 bg-white mt-16">
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
        <img
          src="https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05"
          alt="Charles Boswell in firefighting gear"
          class="rounded-lg shadow-xl w-full max-w-md"
          width="640"
          height="800"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</section>
