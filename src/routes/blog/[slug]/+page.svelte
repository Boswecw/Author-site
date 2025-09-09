<script lang="ts">
  import type { PageData } from './$types';
  import { createImageFallback } from '$lib/utils/image';

  export let data: PageData;
  const { post } = data;

  // ✅ SIMPLIFIED: Server already built complete URL, just use it with fallback
  function getImageUrl(heroImage: string | null | undefined, title: string): string {
    if (heroImage && typeof heroImage === 'string' && heroImage.trim()) {
      return heroImage.trim();
    }
    return createImageFallback(title.substring(0, 10), 'book');
  }

  function handleImageError(event: Event) {
    const img = event.currentTarget as HTMLImageElement;
    img.style.opacity = '0.6';
    img.src = createImageFallback(post?.title?.substring(0, 10) ?? 'POST', 'book');
    console.warn('[Blog/slug] Failed to load image:', img.dataset.originalSrc || 'unknown');
  }
</script>

<svelte:head>
  <title>{post.title} — Charles W. Boswell</title>
  {#if post.excerpt}
    <meta name="description" content={post.excerpt} />
  {/if}
</svelte:head>

<article class="pt-28 pb-16 bg-white">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{post.title}</h1>

    {#if post.publishDate}
      <p class="text-sm text-gray-500 mb-6">
        {new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    {/if}

    {#if post.heroImage}
      <!-- ✅ SIMPLIFIED: Use server-built URL directly -->
      <div class="aspect-[16/9] bg-gray-50 flex items-center justify-center overflow-hidden rounded-xl mb-8">
        <img
          src={getImageUrl(post.heroImage, post.title)}
          alt={post.title}
          class="max-w-full max-h-full object-contain transition-opacity duration-300"
          loading="lazy"
          decoding="async"
          data-original-src={post.heroImage}
          on:error={handleImageError}
        />
      </div>
    {/if}

    <!-- Render compiled Markdown from the server -->
    <div class="prose max-w-none">
      {@html post.contentHtml}
    </div>

    {#if post.tags?.length}
      <div class="mt-8 flex gap-2 flex-wrap">
        {#each post.tags as tag}
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {tag}
          </span>
        {/each}
      </div>
    {/if}
  </div>
</article>