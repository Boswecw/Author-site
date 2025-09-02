<script lang="ts">
  export let data: {
    posts: Array<{
      slug: string;
      title: string;
      excerpt?: string;
      heroImage?: string;
      publishDate?: string;
      tags: string[];
      genre?: string;
      contentHtml?: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    tag: string;
    tags: string[];
    __debug?: Record<string, unknown>;
  };

  function fmt(date?: string) {
    return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  }
</script>

<svelte:head>
  <title>Blog — Charles Boswell</title>
  <meta name="description" content="Read insights on writing, military service, firefighting, and the intersection of faith and fantasy from author Charles W. Boswell." />
</svelte:head>

<section class="pt-28 pb-20 bg-white scroll-mt-28">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">From the Fire Line</h1>
      <p class="text-lg text-gray-600">
        Insights on writing, faith, service, and the real experiences that shape my fantasy worlds.
      </p>
    </div>

    <!-- Posts -->
    <div class="grid gap-10">
      {#each data.posts as post}
        <article class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition">
          {#if post.heroImage}
            <a href={`/blog/${post.slug}`} class="block">
              <img
                src={post.heroImage}
                alt={post.title}
                class="w-full h-56 object-cover"
                loading="lazy"
                decoding="async"
              />
            </a>
          {/if}

          <div class="p-6 lg:p-8">
            <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
              {#if post.publishDate}
                <time datetime={post.publishDate}>{fmt(post.publishDate)}</time>
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

            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h2>

            {#if post.excerpt}
              <p class="text-lg text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
            {/if}

            <a href={`/blog/${post.slug}`} class="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors">
              Read Full Post
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>
      {/each}
    </div>

    <!-- Coming Soon Message -->
    <div class="mt-16 text-center bg-gray-50 rounded-xl p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">More Stories Coming Soon</h2>
      <p class="text-lg text-gray-600 mb-6">
        I'm regularly sharing insights about writing, military life, firefighting, and the creative process. Subscribe to stay updated with new posts.
      </p>
      <a href="/contact" class="btn-primary">Subscribe for Updates</a>
    </div>
  </div>
</section>
