<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { marked } from 'marked'; // ensure installed: npm i marked
  // If you have these utilities elsewhere, keep imports; otherwise stub/inline:
  // import { resolveHeroImage, calculateReadTime } from '$lib/utils/blog';

  const props = $props<{ data: PageData }>();
  const data = $derived(props.data);

  const post = $derived(data.post);
  const error = $derived(data.error);

  // Helpers (inline if not imported)
  function resolveHeroImage(src?: string | null): string | null {
    return src && src.trim() ? src : null;
  }
  function calculateReadTime(md: string): number {
    // ~200wpm; strip code fences crudely
    const text = md.replace(/```[\s\S]*?```/g, '').replace(/[#>*_\-`]/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  // Derived values (replace legacy $:)
  const htmlContent = $derived(() =>
    post?.contentMarkdown ? marked(post.contentMarkdown) as string : ''
  );

  const pageTitle = $derived(() =>
    post?.title ? `${post.title} - Charles Boswell` : 'Post - Charles Boswell'
  );

  const metaDescription = $derived(() =>
    post?.excerpt ||
    (post?.title ? `Read "${post.title}" by Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter.` :
      'Post by Charles Boswell.')
  );

  const heroImageUrl = $derived(() => resolveHeroImage(post?.heroImage));
  const readTime = $derived(() => calculateReadTime(post?.contentMarkdown || ''));

  const structuredData = $derived(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: metaDescription,
      datePublished: post.publishDate,
      dateModified: post.updatedAt ?? post.publishDate,
      author: { '@type': 'Person', name: 'Charles W. Boswell' },
      image: heroImageUrl ? [heroImageUrl] : undefined,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://your-domain.com/blog/${post.slug}` }
    };
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />

  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={metaDescription} />
  {#if heroImageUrl}<meta property="og:image" content={heroImageUrl} />{/if}
  <meta property="og:type" content="article" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={metaDescription} />
  {#if heroImageUrl}<meta name="twitter:image" content={heroImageUrl} />{/if}

  {#if structuredData}
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  {/if}
</svelte:head>

<main class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-12">
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h3 class="text-lg font-medium text-red-800">Unable to Load Post</h3>
        <p class="text-red-700 mt-1">{error}</p>
      </div>
    {:else if post}
      <article class="prose lg:prose-lg max-w-none">
        <header class="mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div class="text-gray-600 text-sm flex items-center gap-3">
            {#if post.publishDate}
              <time>{new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            {/if}
            <span>•</span>
            <span>{readTime} min read</span>
            {#if post.tags?.length}
              <span>•</span>
              <span>
                {#each post.tags as tag, i}
                  <a href={`/blog?tag=${encodeURIComponent(tag)}`} class="text-red-600 hover:text-red-800">{tag}</a>{i < post.tags.length - 1 ? ', ' : ''}
                {/each}
              </span>
            {/if}
          </div>
        </header>

        {#if heroImageUrl}
          <img src={heroImageUrl} alt={post.title} class="w-full rounded-xl border border-gray-200 shadow mb-8" loading="lazy" decoding="async" />
        {/if}

        <!-- Rendered content -->
       <div class="prose prose-gray max-w-none">
  {@html htmlContent}
</div>

        <footer class="mt-12 pt-8 border-t border-gray-200">
          <a href="/blog" class="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium group transition-colors">
            <svg class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Blog
          </a>
        </footer>
      </article>
    {:else}
      <p class="text-gray-600">Post not found.</p>
    {/if}
  </div>
</main>
