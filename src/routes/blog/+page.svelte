<script lang="ts">
  // put this near the top of +page.svelte
  function fadeImgOnError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    img.style.opacity = '0.6';
  }
</script>

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
            referrerpolicy="no-referrer"
            crossorigin="anonymous"
            on:error={fadeImgOnError}
          />
        </a>
      {/if}

      <div class="p-6 lg:p-8">
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
          {#if post.publishDate}
            <time datetime={post.publishDate}>
              {new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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

        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </h2>

        {#if post.excerpt}
          <p class="text-lg text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
        {/if}

        <a
          href={`/blog/${post.slug}`}
          class="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors"
        >
          Read Full Post
          <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  {/each}
</div>
