<script lang="ts">
  import BookCard from '$lib/components/BookCard.svelte';
  import { books } from '$lib/data/books';
  import type { Book } from '$lib/types';

  // Segment by genre
  const faithBooks = books.filter((b) => b.genre === 'faith');
  const epicBooks  = books.filter((b) => b.genre === 'epic');

  // Group by status
  const byStatus = (arr: Book[]) => ({
    upcoming: arr.filter((b) => b.status === 'upcoming'),
    published: arr.filter((b) => b.status === 'published')
  });

  const faith = byStatus(faithBooks);
  const epic  = byStatus(epicBooks);

  // Tiny mapper → Book → BookCard props
  function toCardProps(b: Book) {
    return {
      title: b.title,
      // @ts-expect-error not all books have subtitle
      subtitle: (b as any).subtitle,
      description: b.description,
      status: b.status,
      isbn: b.isbn,
      format: b.format,
      coverSrc: b.cover
    };
  }

  function handleNotify(email: string) {
    console.log('notify:', email);
  }
</script>

<svelte:head>
  <title>Books by Charles W. Boswell — Christian Fiction & Epic Fantasy</title>
  <meta
    name="description"
    content="Explore Charles W. Boswell’s Christian faith-based fiction and epic fantasy—stories of courage, redemption, and fire."
  />
</svelte:head>

<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">My Books</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Stories of courage, faith, and fire—told across Christian fiction and epic fantasy.
      </p>
    </div>

    <!-- Faith-Based Christian Fiction -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        Christian Faith-Based Fiction
      </h2>
      <p class="text-gray-600 text-center mb-8">
        Real-world crises, hope, and redemption in contemporary settings.
      </p>

      {#if faith.published.length}
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Available Now</h3>
        <div
          class="grid gap-8 sm:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]"
        >
          {#each faith.published as book}
            <BookCard {...toCardProps(book)} onNotify={handleNotify} />
          {/each}
        </div>
      {/if}

      {#if faith.upcoming.length}
        <h3 class="text-xl font-semibold text-gray-900 mt-10 mb-4">Coming Soon</h3>
        <div
          class="grid gap-8 sm:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]"
        >
          {#each faith.upcoming as book}
            <BookCard {...toCardProps(book)} onNotify={handleNotify} />
          {/each}
        </div>
      {/if}

      {#if !faith.published.length && !faith.upcoming.length}
        <p class="text-center text-gray-600">
          New faith-based titles are in development.
        </p>
      {/if}
    </div>

    <!-- Epic Fantasy -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-2 text-center">Epic Fantasy</h2>
      <p class="text-gray-600 text-center mb-8">
        Secondary worlds, elemental magic, and battles against encroaching darkness.
      </p>

      {#if epic.published.length}
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Available Now</h3>
        <div
          class="grid gap-8 sm:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]"
        >
          {#each epic.published as book}
            <BookCard {...toCardProps(book)} onNotify={handleNotify} />
          {/each}
        </div>
      {/if}

      {#if epic.upcoming.length}
        <h3 class="text-xl font-semibold text-gray-900 mt-10 mb-4">Coming Soon</h3>
        <div
          class="grid gap-8 sm:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]"
        >
          {#each epic.upcoming as book}
            <BookCard {...toCardProps(book)} onNotify={handleNotify} />
          {/each}
        </div>
      {/if}

      {#if !epic.published.length && !epic.upcoming.length}
        <p class="text-center text-gray-600">
          Epic fantasy titles are in development.
        </p>
      {/if}
    </div>

    <!-- Newsletter CTA -->
    <div
      class="bg-white rounded-lg shadow-lg p-8 text-center max-w-2xl mx-auto"
    >
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Never Miss a Release</h3>
      <p class="text-gray-600 mb-6">
        Be first to hear about new books, exclusive previews, and behind-the-scenes
        notes from firefighting and service.
      </p>
      <a href="/contact" class="btn-primary">Join My Newsletter</a>
    </div>
  </div>
</section>
