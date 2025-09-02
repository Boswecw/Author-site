<script lang="ts">
  import { progressiveImage } from '$lib/actions/progressiveImage';
  import { FALLBACK_IMAGES } from '$lib/services/imageLoading';

  type Post = {
    slug: string;
    title: string;
    excerpt?: string;
    heroImage?: string;
    publishDate?: string;
    tags?: string[];
    genre?: 'faith' | 'epic';
    contentHtml: string; // provided by load()
  };

  type DataShape = {
    posts: Post[];
    page: number;
    pageSize: number;
    total: number;
    tag: string;
    tags: string[];
    __debug?: { db: string; found: number };
  };

  export let data: DataShape;

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const enc = (s: string) => encodeURIComponent(s);

  const tagHref = (t: string | 'All') =>
    t === 'All' ? '/blog' : `/blog?tag=${enc(t)}`;

  const pageHref = (p: number) => {
    const tagPart = data.tag && data.tag !== 'All' ? `&tag=${enc(data.tag)}` : '';
    return `/blog?page=${p}${tagPart}`;
  };

  const prevHref = data.page > 1 ? pageHref(data.page - 1) : undefined;
  const nextHref = data.page < totalPages ? pageHref(data.page + 1) : undefined;

  const tagBtnClass = (t: string | 'All') =>
    `px-3 py-1 rounded border transition ${
      data.tag === t ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'
    }`;
</script>

<section class="max-w-3xl mx-auto px-4 py-10">
  <header class="mb-8">
    <h1 class="text-3xl font-bold">Blog</h1>

    {#if data.__debug}
      <p class="mt-2 text-xs opacity-60">
        DB: {data.__debug.db} — posts found: {data.__debug.found}
      </p>
    {/if}

    {#if data.tags?.length}
      <div class="mt-4 flex flex-wrap gap-2">
        <a href={tagHref('All')} class={tagBtnClass('All')}>All</a>
        {#each data.tags as t}
          <a href={tagHref(t)} class={tagBtnClass(t)}>{t}</a>
        {/each}
      </div>
    {/if}
  </header>

  {#if !data.posts?.length}
    <p class="text-gray-500 mt-8">No published posts found.</p>
  {:else}
    <div class="space-y-12">
      {#each data.posts as post}
        <article class="prose dark:prose-invert max-w-none">
          <h2 class="!mt-0">
            <a href={`/blog/${post.slug}`} class="no-underline hover:underline">{post.title}</a>
          </h2>

          {#if post.publishDate}
            <p class="text-sm text-gray-500">
              <time datetime={post.publishDate}>
                {new Date(post.publishDate).toLocaleDateString()}
              </time>
              {#if post.tags?.length} · {post.tags.join(' · ')}{/if}
            </p>
          {/if}

          {#if post.heroImage}
            <img
              src={post.heroImage}
              alt={post.title}
              class="rounded-lg my-4"
              loading="lazy"
              decoding="async"
              use:progressiveImage={{ fallback: FALLBACK_IMAGES.BOOK_COVER }}
            />
          {/if}

          <!-- Safe server-rendered HTML -->
          <div class="mt-4">
            {@html post.contentHtml}
          </div>

          <p class="mt-4">
            <a href={`/blog/${post.slug}`} class="text-blue-600 hover:underline">
              Read more →
            </a>
          </p>
        </article>
      {/each}
    </div>
  {/if}

  {#if totalPages > 1}
    <nav class="mt-10 flex items-center justify-between">
      <a
        class="px-4 py-2 border rounded disabled:opacity-50"
        aria-disabled={data.page <= 1}
        href={prevHref}
        >← Prev</a
      >
      <span>Page {data.page} of {totalPages}</span>
      <a
        class="px-4 py-2 border rounded disabled:opacity-50"
        aria-disabled={data.page >= totalPages}
        href={nextHref}
        >Next →</a
      >
    </nav>
  {/if}
</section>
