<script lang="ts">
  export let data: {
    posts: Array<{ slug: string; title: string; excerpt?: string; publishDate?: string; tags?: string[]; readTime?: string }>;
    allCategories: string[];
    selectedTag: string;
  };

  // Click handlers update the URL query (?tag=…) so it’s shareable
  function setTag(tag: string) {
    const url = new URL(window.location.href);
    if (tag === 'All') url.searchParams.delete('tag');
    else url.searchParams.set('tag', tag);
    history.replaceState({}, '', url);
    // naive client-side filter (optional) — or rely solely on server load via goto
    location.reload(); // simplest; or use `goto(url, { replaceState: true })` if you prefer SPA feel
  }
</script>

<svelte:head>
  <title>Blog & Updates - Charles W. Boswell</title>
  <meta name="description" content="Writing insights, behind-the-scenes stories, and updates from Charles W. Boswell." />
</svelte:head>

<section class="py-20 bg-gray-50">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Blog & Updates</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Writing insights, behind-the-scenes stories, and lessons learned from the fireline to fiction.
      </p>
    </div>

    <!-- Category Filter -->
    <div class="mb-12">
      <div class="flex flex-wrap gap-2 justify-center">
        {#each data.allCategories as category}
          <button
            on:click={() => setTag(category)}
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              {data.selectedTag === category ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600'}
              shadow-sm border border-gray-200">
            {category}
          </button>
        {/each}
      </div>
    </div>

    <!-- Blog Posts -->
    <div class="space-y-8">
      {#each data.posts as post}
        <article class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="p-8">
            <div class="flex flex-wrap gap-2 mb-4">
              {#each post.tags ?? [] as tag}
                <a href={`?tag=${encodeURIComponent(tag)}`} class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{tag}</a>
              {/each}
            </div>

            <h2 class="text-2xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
              <a href={`/blog/${post.slug}`} class="no-underline">{post.title}</a>
            </h2>

            {#if post.excerpt}
              <p class="text-gray-600 text-lg leading-relaxed mb-6">{post.excerpt}</p>
            {/if}

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                {#if post.publishDate}
                  <time class="text-sm text-gray-500">
                    {new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                {/if}
                {#if post.readTime}<span class="text-sm text-gray-500">{post.readTime}</span>{/if}
              </div>

              <a href={`/blog/${post.slug}`} class="text-red-600 font-semibold hover:text-red-700 transition-colors inline-flex items-center">
                Read More
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>

    {#if data.posts.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-500">No posts found in this category. Check back soon for new content!</p>
      </div>
    {/if}
  </div>
</section>
