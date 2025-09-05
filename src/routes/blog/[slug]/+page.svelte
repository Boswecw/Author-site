<script lang="ts">
  import { createImageFallback } from '$lib/services/authorImages';
  import { normalizeFirebaseUrl } from '$lib/utils/urls';

  type Post = {
    slug: string;
    title: string;
    excerpt?: string;
    heroImage?: string;
    publishDate?: string | null;
    tags?: string[];
    genre?: 'faith' | 'epic';
    contentHtml: string;
  };
  
  export let data: { post: Post };

  // ✅ SIMPLIFIED: Use direct image handling without complex progressive loading
  $: normalizedHeroImage = normalizeFirebaseUrl(data.post.heroImage) ?? data.post.heroImage;
  $: fallbackImage = createImageFallback(data.post.title, 'book');

  function handleImageError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    console.warn('Blog hero image failed:', img.src);
    img.src = fallbackImage;
  }
</script>

<svelte:head>
  <title>{data.post.title} — Charles W. Boswell</title>
  {#if data.post.excerpt}
    <meta name="description" content={data.post.excerpt} />
  {/if}
</svelte:head>

<article class="prose dark:prose-invert max-w-3xl mx-auto px-4 py-10">
  <h1 class="!mb-2">{data.post.title}</h1>
  {#if data.post.publishDate}
    <p class="text-sm text-gray-500 mb-4">
      <time datetime={data.post.publishDate}>
        {new Date(data.post.publishDate).toLocaleDateString()}
      </time>
      {#if data.post.tags?.length} · {data.post.tags.join(' · ')}{/if}
    </p>
  {/if}

  {#if normalizedHeroImage}
    <img
      src={normalizedHeroImage}
      alt={data.post.title}
      class="rounded-lg my-4 w-full h-auto"
      loading="lazy"
      decoding="async"
      on:error={handleImageError}
    />
  {/if}

  <div class="mt-4">
    {@html data.post.contentHtml}
  </div>
</article>