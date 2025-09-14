<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import type { PageData } from './$types';

  // Props (runes)
  const props = $props<{ data: PageData }>();
  const data = $derived(props.data);

  // Expose data as derived
  const posts = $derived(data.posts);
  const tags = $derived(data.tags);
  const pagination = $derived(data.pagination);
  const filters = $derived(data.filters);
  const error = $derived(data.error);

  // Local UI state (do NOT capture filters directly here)
  let searchQuery = $state('');
  let selectedTag = $state('');

  // Sync from filters when loader data changes (navigation), but not on each keystroke
  $effect(() => {
    searchQuery = (filters?.search ?? '').toString();
    selectedTag = (filters?.tag ?? '').toString();
  });

  function handleSearch(event: Event) {
    event.preventDefault();
    if (!browser) return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedTag) params.set('tag', selectedTag);
    params.set('page', '1');

    const queryString = params.toString();
    goto(`/blog${queryString ? `?${queryString}` : ''}`, { replaceState: false });
  }

  function handleTagChange() {
    if (!browser) return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedTag) params.set('tag', selectedTag);
    params.set('page', '1');

    const queryString = params.toString();
    goto(`/blog${queryString ? `?${queryString}` : ''}`, { replaceState: false });
  }

  function clearFilters() {
    if (!browser) return;
    searchQuery = '';
    selectedTag = '';
    goto('/blog', { replaceState: false });
  }

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  function buildPaginationUrl(pageNum: number): string {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.tag) params.set('tag', filters.tag);
    if (pageNum > 1) params.set('page', pageNum.toString());
    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ''}`;
  }

  // Meta
  const pageTitle = $derived(() => {
    let title = 'Blog - Charles Boswell';
    if (filters?.tag) title += ` - ${filters.tag}`;
    if (filters?.search) title += ` - Search: ${filters.search}`;
    if (pagination?.current && pagination.current > 1) title += ` - Page ${pagination.current}`;
    return title;
  });

  const metaDescription = $derived(() => {
    if (filters?.tag) {
      return `Blog posts tagged with "${filters.tag}" by Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter.`;
    }
    if (filters?.search) {
      return `Search results for "${filters.search}" in Charles Boswell's blog.`;
    }
    return "Read Charles Boswell's latest thoughts on writing, firefighting, military service, and the craft of storytelling.";
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<!-- …rest of your template unchanged from my last message… -->


<main class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-12">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Blog
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Thoughts on writing, firefighting, military service, and the craft of storytelling.
      </p>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="flex items-center">
          <svg class="h-6 w-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-lg font-medium text-red-800">Unable to Load Blog Posts</h3>
            <p class="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <form onsubmit={handleSearch} class="flex flex-col md:flex-row gap-4 items-end">
        <!-- Search Input -->
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
            Search Posts
          </label>
          <input
            type="text"
            id="search"
            bind:value={searchQuery}
            placeholder="Search by title, content, or tags..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <!-- Tag Filter -->
        <div class="flex-1">
          <label for="tag" class="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tag
          </label>
          <select
            id="tag"
            bind:value={selectedTag}
            onchange={handleTagChange}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Tags</option>
            {#each tags as tag}
              <option value={tag}>{tag}</option>
            {/each}
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            type="submit"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Search
          </button>

          {#if filters?.search || filters?.tag}
            <button
              type="button"
              onclick={clearFilters}
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Clear
            </button>
          {/if}
        </div>
      </form>

      <!-- Active Filters Display -->
      {#if filters?.search || filters?.tag}
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex flex-wrap gap-2 items-center">
            <span class="text-sm text-gray-600">Active filters:</span>

            {#if filters?.search}
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{filters.search}"
              </span>
            {/if}

            {#if filters?.tag}
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tag: {filters.tag}
              </span>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Results Summary -->
    {#if pagination?.totalPosts > 0}
      <div class="mb-6">
        <p class="text-gray-600">
          Showing {posts.length} of {pagination.totalPosts} post{pagination.totalPosts === 1 ? '' : 's'}
          {#if pagination.current > 1} (page {pagination.current} of {pagination.total}){/if}
        </p>
      </div>
    {/if}

    <!-- Blog Posts Grid -->
    {#if posts.length > 0}
      <div class="grid gap-8 lg:gap-12 mb-12">
        {#each posts as post}
          <article class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-8">
              <!-- Post Header -->
              <header class="mb-4">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  <a
                    href={`/blog/${post.slug}`}
                    class="hover:text-red-600 transition-colors"
                  >
                    {post.title}
                  </a>
                </h2>

                <!-- Post Meta -->
                <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                  {#if post.publishDate}
                    <time class="flex items-center">
                      <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {formatDate(post.publishDate)}
                    </time>
                  {/if}

                  {#if post.tags && post.tags.length > 0}
                    <div class="flex items-center flex-wrap gap-2">
                      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      {#each post.tags as tag, index}
                        <a
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          class="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          {tag}
                        </a>
                        {#if index < post.tags.length - 1}<span class="text-gray-400">•</span>{/if}
                      {/each}
                    </div>
                  {/if}
                </div>
              </header>

              <!-- Post Content -->
              {#if post.excerpt}
                <div class="prose prose-gray max-w-none mb-4">
                  <p class="text-gray-700 leading-relaxed">{post.excerpt}</p>
                </div>
              {/if}

              <!-- Read More Link -->
              <div class="mt-6">
                <a
                  href={`/blog/${post.slug}`}
                  class="inline-flex items-center text-red-600 hover:text-red-800 font-medium group transition-colors"
                >
                  Read full post
                  <svg class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        {/each}
      </div>

      <!-- Pagination -->
      {#if pagination?.total > 1}
        <nav class="flex justify-center" aria-label="Blog pagination">
          <div class="flex items-center space-x-2">
            <!-- Previous Page -->
            {#if pagination?.hasPrevious}
              <a
                href={buildPaginationUrl(pagination.current - 1)}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Previous
              </a>
            {:else}
              <span class="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed">
                Previous
              </span>
            {/if}

            <!-- Page Numbers -->
            {#each Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
              const start = Math.max(1, pagination.current - 2);
              const end = Math.min(pagination.total, start + 4);
              return start + i;
            }).filter(p => p <= pagination.total) as pageNum}
              {#if pageNum === pagination.current}
                <span class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg cursor-default">
                  {pageNum}
                </span>
              {:else}
                <a
                  href={buildPaginationUrl(pageNum)}
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  {pageNum}
                </a>
              {/if}
            {/each}

            <!-- Next Page -->
            {#if pagination?.hasMore}
              <a
                href={buildPaginationUrl(pagination.current + 1)}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Next
              </a>
            {:else}
              <span class="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed">
                Next
              </span>
            {/if}
          </div>
        </nav>
      {/if}

    {:else}
      <!-- Empty State -->
      <div class="text-center py-16">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-2xl font-medium text-gray-900 mb-2">
          {#if filters?.search || filters?.tag}
            No posts found
          {:else}
            No blog posts yet
          {/if}
        </h3>
        <p class="text-gray-600 mb-6">
          {#if filters?.search || filters?.tag}
            Try adjusting your search criteria or clearing the filters.
          {:else}
            Check back soon for new content!
          {/if}
        </p>

        {#if filters?.search || filters?.tag}
          <button
            onclick={clearFilters}
            class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Clear Filters
          </button>
        {/if}
      </div>
    {/if}

    <!-- Back to Home -->
    <div class="text-center mt-16 pt-8 border-t border-gray-200">
      <a
        href="/"
        class="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium group transition-colors"
      >
        <svg class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </a>
    </div>
  </div>
</main>
