<!-- src/routes/blog/[slug]/+page.svelte - UPDATED with improved hero layout -->
<script lang="ts">
  import { marked } from 'marked';
  import { browser } from '$app/environment';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { post } = data;

  // Configure marked
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // ✅ Derived values (typed so svelte-check is happy)
  let htmlContent: string = $derived(
    post?.contentMarkdown ? (marked(post.contentMarkdown) as string) : ''
  );

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

  function calculateReadTime(content: string | null | undefined): string {
    if (!content || typeof content !== 'string') return '';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount === 0) return '';
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }

  function resolveHeroImage(ref?: string | null): string | null {
    if (!ref) return null;
    const s = ref.trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s; // Already a full URL
    if (s.includes('/')) {
      // Path in bucket
      return `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/${encodeURIComponent(
        s
      )}?alt=media`;
    }
    // Fallback: books folder
    return `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/books%2F${encodeURIComponent(
      s
    )}?alt=media`;
  }

  let pageTitle: string = $derived(`${post.title} - Charles Boswell`);
  let metaDescription: string = $derived(
    post.excerpt ||
      `Read "${post.title}" by Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter.`
  );
  let heroImageUrl: string | null = $derived(resolveHeroImage(post.heroImage));
  let readTimeText: string = $derived(calculateReadTime(post.contentMarkdown));
  let formattedDate: string = $derived(formatDate(post.publishDate || post.publishedAt));

  let structuredData: Record<string, any> = $derived({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    author: {
      '@type': 'Person',
      name: 'Charles Boswell',
      url: 'https://author-site-w26m.onrender.com/about'
    },
    publisher: {
      '@type': 'Person',
      name: 'Charles Boswell'
    },
    datePublished: post.publishedAt || post.publishDate,
    dateModified: post.publishedAt || post.publishDate,
    url: `https://author-site-w26m.onrender.com/blog/${post.slug}`,
    image: heroImageUrl || undefined,
    keywords: post.tags?.join(', ') || '',
    genre: post.genre || 'Writing'
  });

  // Social sharing (executed only in browser on click)
  function shareOnTwitter() {
    const url = encodeURIComponent(`https://author-site-w26m.onrender.com/blog/${post.slug}`);
    const text = encodeURIComponent(`"${post.title}" by Charles Boswell`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }
  function shareOnFacebook() {
    const url = encodeURIComponent(`https://author-site-w26m.onrender.com/blog/${post.slug}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }
  function copyLink() {
    if (!browser) return;
    const url = `https://author-site-w26m.onrender.com/blog/${post.slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => {
        // Fallback prompt if clipboard API not available
        // eslint-disable-next-line no-alert
        prompt('Copy this link:', url);
      });
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />

  <!-- Open Graph -->
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={`https://author-site-w26m.onrender.com/blog/${post.slug}`} />
  {#if heroImageUrl}
    <meta property="og:image" content={heroImageUrl} />
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={metaDescription} />
  {#if heroImageUrl}
    <meta name="twitter:image" content={heroImageUrl} />
  {/if}

  <!-- Article specific meta -->
  {#if post.publishedAt || post.publishDate}
    <meta property="article:published_time" content={post.publishedAt || post.publishDate} />
  {/if}
  <meta property="article:author" content="Charles Boswell" />
  {#if post.tags}
    {#each post.tags as tag}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`}

  <!-- Canonical URL -->
  <link rel="canonical" href={`https://author-site-w26m.onrender.com/blog/${post.slug}`} />
</svelte:head>

<main class="min-h-screen bg-gray-50">
  <!-- UPDATED Hero Section - Fixed layout for book covers -->
  {#if heroImageUrl}
    <!-- Enhanced Hero with Proper Book Cover Display -->
    <div class="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div class="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          <!-- Book Cover Display (shows full cover without cropping) -->
          <div class="flex-shrink-0">
            <div class="w-64 md:w-80 aspect-[2/3] bg-white/10 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
              <img
                src={heroImageUrl}
                alt={post.title}
                class="w-full h-full object-contain bg-white/5"
                loading="eager"
              />
            </div>
          </div>
          
          <!-- Content Overlay -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <!-- Meta Info with Icons -->
            <div class="flex flex-wrap items-center justify-center md:justify-start text-white/90 text-sm space-x-6 mb-6">
              {#if formattedDate}
                <time class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                  </svg>
                  {formattedDate}
                </time>
              {/if}
              
              {#if readTimeText}
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                  </svg>
                  {readTimeText}
                </span>
              {/if}
            </div>
            
            <!-- Tags -->
            {#if post.tags && post.tags.length > 0}
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                {#each post.tags as tag}
                  <a
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    class="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-all duration-200"
                  >
                    {tag}
                  </a>
                {/each}
              </div>
            {/if}

            <!-- Excerpt Preview -->
            {#if post.excerpt}
              <p class="text-white/80 text-lg leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Decorative background elements -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  {:else}
    <!-- No Hero Image Header (unchanged) -->
    <div class="bg-white border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div class="flex items-center text-gray-600 text-sm space-x-4">
          {#if formattedDate}<time>{formattedDate}</time>{/if}
          {#if readTimeText}<span>{readTimeText}</span>{/if}
          {#if post.tags && post.tags.length > 0}
            <div class="flex items-center space-x-2">
              {#each post.tags as tag}
                <a
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  class="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs hover:bg-red-200 transition-colors"
                >
                  {tag}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Article Content -->
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <article class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-800">
      {#if htmlContent}
        {@html htmlContent}
      {:else if post.excerpt}
        <p class="text-gray-700 leading-relaxed text-lg">{post.excerpt}</p>
      {:else}
        <p class="text-gray-500 italic">Content not available</p>
      {/if}
    </article>

    <!-- Enhanced Sharing and Navigation -->
    <div class="mt-12 pt-8 border-t border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <!-- Social Sharing -->
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700">Share this post:</span>
          <button
            on:click={shareOnTwitter}
            class="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
            aria-label="Share on Twitter"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
              />
            </svg>
            <span class="text-xs">Tweet</span>
          </button>
          <button
            on:click={shareOnFacebook}
            class="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
            aria-label="Share on Facebook"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-xs">Share</span>
          </button>
          <button
            on:click={copyLink}
            class="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-md"
            aria-label="Copy link"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span class="text-xs">Copy</span>
          </button>
        </div>

        <!-- Back to Blog -->
        <a
          href="/blog"
          class="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </a>
      </div>
    </div>
  </div>
</main>