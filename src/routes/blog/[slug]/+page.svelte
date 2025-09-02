<script lang="ts">
  import { progressiveImage } from '$lib/actions/progressiveImage';
  import { FALLBACK_IMAGES } from '$lib/services/imageLoading';

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

  {#if data.post.heroImage}
    <img
      src={data.post.heroImage}
      alt={data.post.title}
      class="rounded-lg my-4"
      loading="lazy"
      decoding="async"
      use:progressiveImage={{ fallback: FALLBACK_IMAGES.BOOK_COVER }}
    />
  {/if}

  <div class="mt-4">
    {@html data.post.contentHtml}
  </div>
</article>
