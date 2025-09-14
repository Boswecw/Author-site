<!-- src/routes/blog/[slug]/+page.svelte - Fixed with proper runes -->
<script lang="ts">
  import { marked } from 'marked';
  import { browser } from '$app/environment';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  const { post } = data;
  
  // Configure marked for security and styling
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  // ✅ FIXED: Convert $: to $derived
  const htmlContent = $derived(
    post?.contentMarkdown ? (marked(post.contentMarkdown) as string) : ''
  );
  
  // Format date for display
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
  
  // Calculate estimated read time - FIXED VERSION
  function calculateReadTime(content: string | null | undefined): string {
    if (!content || typeof content !== 'string') return '';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount === 0) return '';
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }
  
  // Resolve hero image URL
  function resolveHeroImage(ref?: string | null): string | null {
    if (!ref) return null;
    const s = ref.trim();
    if (!s) return null;
    
    // Full URLs pass through
    if (/^https?:\/\//i.test(s)) return s;
    
    // Firebase Storage URLs for blog images
    if (s.includes('/')) {
      return `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/${encodeURIComponent(s)}?alt=media`;
    }
    
    return `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/books%2F${encodeURIComponent(s)}?alt=media`;
  }
  
  // ✅ FIXED: All derived values
  const pageTitle = $derived(`${post.title} - Charles Boswell`);
  const metaDescription = $derived(post.excerpt || `Read "${post.title}" by Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter.`);
  const heroImageUrl = $derived(resolveHeroImage(post.heroImage));
  const readTimeText = $derived(calculateReadTime(post.contentMarkdown));
  const formattedDate = $derived(formatDate(post.publishDate || post.publishedAt));
  
  // Schema.org structured data for SEO
  const structuredData = $derived({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || '',
    "author": {
      "@type": "Person",
      "name": "Charles Boswell",
      "url": "https://author-site-w26m.onrender.com/about"
    },
    "publisher": {
      "@type": "Person",
      "name": "Charles Boswell"
    },
    "datePublished": post.publishedAt || post.publishDate,
    "dateModified": post.publishedAt || post.publishDate,
    "url": `https://author-site-w26m.onrender.com/blog/${post.slug}`,
    "image": heroImageUrl,
    "keywords": post.tags?.join(', ') || '',
    "genre": post.genre || 'Writing'
  });
  
  // Social sharing functions
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
    if (browser) {
      const url = `https://author-site-w26m.onrender.com/blog/${post.slug}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        prompt('Copy this link:', url);
      });
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />
  
  <!-- Open Graph -->
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://author-site-w26m.onrender.com/blog/{post.slug}" />
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
  <link rel="canonical" href="https://author-site-w26m.onrender.com/blog/{post.slug}" />
</svelte:head>

<main class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  {#if heroImageUrl}
    <div class="relative h-96 md:h-[500px] overflow-hidden bg-gray-900">
      <img 
        src={heroImageUrl} 
        alt={post.title}
        class="w-full h-full object-cover opacity-80"
        loading="eager"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
          <div class="flex items-center text-white/90 text-sm space-x-4">
            {#if formattedDate}
              <time>{formattedDate}</time>
            {/if}
            {#if readTimeText}
              <span>{readTimeText}</span>
            {/if}
            {#if post.tags && post.tags.length > 0}
              <div class="flex items-center space-x-2">
                {#each post.tags as tag}
                  <span class="bg-white/20 text-white px-2 py-1 rounded-full text-xs">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- No Hero Image Header -->
    <div class="bg-white border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div class="flex items-center text-gray-600 text-sm space-x-4">
          {#if formattedDate}
            <time>{formattedDate}</time>
          {/if}
          {#if readTimeText}
            <span>{readTimeText}</span>
          {/if}
          {#if post.tags && post.tags.length > 0}
            <div class="flex items-center space-x-2">
              {#each post.tags as tag}
                <a 
                  href="/blog?tag={encodeURIComponent(tag)}"
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
    <article class="prose prose-lg max-w-none">
      {#if htmlContent}
        {@html htmlContent}
      {:else if post.excerpt}
        <p class="text-gray-700 leading-relaxed text-lg">{post.excerpt}</p>
      {:else}
        <p class="text-gray-500 italic">Content not available</p>
      {/if}
    </article>

    <!-- Sharing and Navigation -->
    <div class="mt-12 pt-8 border-t border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <!-- Social Sharing -->
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700">Share:</span>
          <button 
            onclick={shareOnTwitter}
            class="text-blue-500 hover:text-blue-700 transition-colors"
            aria-label="Share on Twitter"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
            </svg>
          </button>
          <button 
            onclick={shareOnFacebook}
            class="text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Share on Facebook"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button 
            onclick={copyLink}
            class="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Copy link"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>

        <!-- Back to Blog -->
        <a 
          href="/blog"
          class="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Blog
        </a>
      </div>
    </div>
  </div>
</main>