<script lang="ts">
  import type { PageData } from './$types';

  // CRITICAL FIX: Export data prop
  export let data: PageData;

  // CRITICAL FIX: Error handler function to avoid TypeScript in template
  function handleImageError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    img.style.opacity = '0.6';
    console.warn('[Blog] Failed to load image:', img.src);
  }
</script>

<svelte:head>
  <title>Blog — Charles W. Boswell</title>
  <meta name="description" content="Read Charles Boswell's latest thoughts on writing, firefighting, military service, and the craft of storytelling." />
</svelte:head>

<section class="pt-28 pb-20 bg-white">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center mb-16">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Blog & Updates</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Stories from the frontlines of writing, firefighting, and life. Insights into the craft, the journey, and the adventures that shape every page.
      </p>
    </header>

    {#if data.posts?.length}
      <!-- Posts Grid -->
      <div class="grid gap-10">
        {#each data.posts as post (post.slug)}
          <article class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {#if post.heroImage}
              <a href="/blog/{post.slug}" class="block">
                <img
                  src={post.heroImage}
                  alt={post.title}
                  class="w-full h-56 object-cover transition-opacity duration-300"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  crossorigin="anonymous"
                  on:error={handleImageError}
                />
              </a>
            {/if}

            <div class="p-6 lg:p-8">
              <!-- Post Meta -->
              <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                {#if post.publishDate}
                  <time datetime={post.publishDate}>
                    {new Date(post.publishDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                {/if}

                {#if post.tags?.length}
                  <span>•</span>
                  <div class="flex flex-wrap gap-2">
                    {#each post.tags as tag}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {tag}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- Post Title -->
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors duration-200">
                <a href="/blog/{post.slug}" class="hover:underline">
                  {post.title}
                </a>
              </h2>

              <!-- Post Excerpt -->
              {#if post.excerpt}
                <p class="text-lg text-gray-600 mb-6 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              {/if}

              <!-- Read More Link -->
              <a
                href="/blog/{post.slug}"
                class="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors duration-200 group"
              >
                Read Full Post
                <svg 
                  class="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>
        {/each}
      </div>

      <!-- Pagination (if needed) -->
      {#if data.total && data.pageSize && data.total > data.pageSize}
        <nav class="flex justify-center items-center space-x-4 mt-12" aria-label="Blog pagination">
          {#if data.page > 1}
            <a 
              href="/blog?page={data.page - 1}" 
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Previous
            </a>
          {/if}
          
          <span class="text-gray-600">
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          
          {#if data.page < Math.ceil(data.total / data.pageSize)}
            <a 
              href="/blog?page={data.page + 1}" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Next
            </a>
          {/if}
        </nav>
      {/if}
    {:else}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
        <p class="text-gray-600 max-w-md mx-auto">
          Check back soon for stories, insights, and updates from the writing journey.
        </p>
      </div>
    {/if}
  </div>
</section>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>