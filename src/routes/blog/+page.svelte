<!-- src/routes/blog/+page.svelte - Fixed with proper runes -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { posts, filters, pagination } = data;

  // Local, editable search state (seeded from initial filters)
  let searchInput = $state(filters.search || '');

  // ✅ Derived (function forms; call them in markup)
  const pageTitle = $derived(() => {
    let title = 'Blog - Charles Boswell';
    if (filters.tag) title += ` - ${filters.tag}`;
    if (filters.search) title += ` - Search: ${filters.search}`;
    if (pagination.current > 1) title += ` - Page ${pagination.current}`;
    return title;
  });

  const metaDescription = $derived(() => {
    if (filters.tag)
      return `Blog posts tagged with "${filters.tag}" by Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter.`;
    if (filters.search)
      return `Search results for "${filters.search}" in Charles Boswell's blog.`;
    return `Read Charles Boswell's latest thoughts on writing, firefighting, military service, and the craft of storytelling.`;
  });

  // Some backends don't send `pages`; derive it safely if missing
  const totalPages = $derived(() => {
    const anyPag = pagination as any;
    if (typeof anyPag?.pages === 'number') return Math.max(1, anyPag.pages);
    const total = Number(anyPag?.total ?? anyPag?.totalPosts ?? posts.length) || 1;
    const limit = Number(anyPag?.limit ?? posts.length) || 1; // () to avoid ?? / || mixing warning
    return Math.max(1, Math.ceil(total / limit));
  });

  // Calculate read time for a post
  function calculateReadTime(content?: string): string {
    if (!content) return '';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }

  // Prefer contentMarkdown if present; fall back to excerpt
  function getPostReadSample(p: any): string {
    return (p?.contentMarkdown ?? p?.excerpt ?? '') as string;
  }

  // Format date for display
  function formatDate(dateStr?: string): string {
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

  // Build hrefs without nested template strings (avoids TS "Unexpected token")
  function pageHref(pageNum: number) {
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    if (filters.search) params.set('search', filters.search);
    if (filters.tag) params.set('tag', filters.tag);
    return `/blog?${params.toString()}`;
  }

  // Handle search
  async function handleSearch() {
    const params = new URLSearchParams($page.url.searchParams);
    const q = searchInput.trim();

    if (q) params.set('search', q);
    else params.delete('search');

    // Reset pagination on new search
    params.delete('page');

    await goto(`/blog?${params.toString()}`);
  }

  // Handle tag filtering
  async function handleTagFilter(tag: string) {
    const params = new URLSearchParams();
    params.set('tag', tag);
    await goto(`/blog?${params.toString()}`);
  }

  // Clear all filters
  async function clearFilters() {
    await goto('/blog');
  }
</script>

<svelte:head>
  <!-- ✅ Call derived values (they’re functions) -->
  <title>{pageTitle()}</title>
  <meta name="description" content={metaDescription()} />
  <meta property="og:title" content={pageTitle()} />
  <meta property="og:description" content={metaDescription()} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://author-site-w26m.onrender.com/blog" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={pageTitle()} />
  <meta name="twitter:description" content={metaDescription()} />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://author-site-w26m.onrender.com/blog" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
      <p class="text-xl text-gray-600">
        Thoughts on writing, firefighting, military service, and the craft of storytelling.
      </p>
    </div>
  </div>

  <!-- Search and Filters -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <!-- Search -->
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
            Search Posts
          </label>
          <div class="flex gap-2">
            <input
              id="search"
              type="text"
              bind:value={searchInput}
              placeholder="Search by title, content, or tags..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              onkeydown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onclick={handleSearch}
              class="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <!-- Tag Filter -->
        <div class="sm:w-64">
          <label for="tag-filter" class="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tag
          </label>
          <select
            id="tag-filter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            value={filters.tag || ''}
            onchange={(e) => {
              const target = e.target as HTMLSelectElement;
              if (target.value) {
                handleTagFilter(target.value);
              } else {
                clearFilters();
              }
            }}
          >
            <option value="">All Tags</option>
            <option value="announcement">Announcements</option>
            <option value="faith">Faith</option>
            <option value="ebook">eBooks</option>
            <option value="writing">Writing</option>
            <option value="firefighting">Firefighting</option>
          </select>
        </div>
      </div>

      <!-- Active Filters -->
      {#if filters.search || filters.tag}
        <div class="flex items-center gap-2 mb-4">
          <span class="text-sm font-medium text-gray-700">Active filters:</span>
          {#if filters.search}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: {filters.search}
              <button
                onclick={() => {
                  searchInput = '';
                  handleSearch();
                }}
                class="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="Remove search filter"
              >
                ×
              </button>
            </span>
          {/if}
          {#if filters.tag}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Tag: {filters.tag}
              <button
                onclick={clearFilters}
                class="ml-1 text-green-600 hover:text-green-800"
                aria-label="Remove tag filter"
              >
                ×
              </button>
            </span>
          {/if}
          <button
            onclick={clearFilters}
            class="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear all
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Posts List -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    {#if posts.length > 0}
      <div class="mb-6">
        <p class="text-gray-600">
          Showing {posts.length} of {pagination.total} posts
          {#if pagination.current > 1}
            (Page {pagination.current} of {totalPages()})
          {/if}
        </p>
      </div>

      <div class="space-y-8">
        {#each posts as post (post.slug)}
          <article class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="p-6">
              <header class="mb-4">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  <a
                    href={'/blog/' + post.slug}
                    class="hover:text-red-600 transition-colors"
                  >
                    {post.title}
                  </a>
                </h2>

                <div class="flex items-center text-sm text-gray-600 space-x-4">
                  {#if post.publishDate}
                    <time>{formatDate(post.publishDate)}</time>
                  {/if}
                  <span>{calculateReadTime(getPostReadSample(post))}</span>
                </div>

                {#if post.tags && post.tags.length > 0}
                  <div class="flex items-center flex-wrap gap-2 mt-3">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    {#each post.tags as tag, index}
                      <button
                        onclick={() => handleTagFilter(tag)}
                        class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                      >
                        {tag}
                      </button>
                      {#if index < post.tags.length - 1}
                        <span class="text-gray-400">•</span>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </header>

              {#if post.excerpt}
                <div class="prose prose-gray max-w-none mb-4">
                  <p class="text-gray-700 leading-relaxed line-clamp-3">{post.excerpt}</p>
                </div>
              {/if}

              <div class="mt-6">
                <a
                  href={'/blog/' + post.slug}
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
      {#if totalPages() > 1}
        <div class="mt-12 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            {#if pagination.current > 1}
              <a
                href={pageHref(pagination.current - 1)}
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </a>
            {/if}
            {#if pagination.current < totalPages()}
              <a
                href={pageHref(pagination.current + 1)}
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </a>
            {/if}
          </div>

          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing page <span class="font-medium">{pagination.current}</span> of
                <span class="font-medium">{totalPages()}</span>
                ({pagination.total} total posts)
              </p>
            </div>

            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {#if pagination.current > 1}
                  <a
                    href={pageHref(pagination.current - 1)}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </a>
                {/if}

                {#each Array(totalPages()).fill(0) as _, i}
                  {@const pageNum = i + 1}
                  <a
                    href={pageHref(pageNum)}
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    class:z-10={pageNum === pagination.current}
                    class:bg-red-50={pageNum === pagination.current}
                    class:border-red-500={pageNum === pagination.current}
                    class:text-red-600={pageNum === pagination.current}
                  >
                    {pageNum}
                  </a>
                {/each}

                {#if pagination.current < totalPages()}
                  <a
                    href={pageHref(pagination.current + 1)}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                {/if}
              </nav>
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <!-- Empty State -->
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {#if filters.search || filters.tag}
            Try adjusting your search or filter criteria.
          {:else}
            Check back later for new posts.
          {/if}
        </p>
        {#if filters.search || filters.tag}
          <div class="mt-6">
            <button
              onclick={clearFilters}
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear filters
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Back to Home -->
  <div class="text-center py-8 border-t border-gray-200">
    <a
      href="/"
      class="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
    >
      <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      Back to Home
    </a>
  </div>
</div>

