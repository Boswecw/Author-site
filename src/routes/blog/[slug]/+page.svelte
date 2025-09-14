<!-- src/routes/blog/[slug]/+page.svelte -->
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
  
  // Convert markdown to HTML
  $: htmlContent = post.contentMarkdown ? marked(post.contentMarkdown) : '';
  
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
  
  // Calculate estimated read time
  function calculateReadTime(content: string): string {
    if (!content) return '';
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }
  
  // Resolve hero image URL (using your existing Firebase logic)
  function resolveHeroImage(ref?: string | null): string | null {
    if (!ref) return null;
    const s = ref.trim();
    if (!s) return null;
    
    // Full URLs pass through
    if (/^https?:\/\//i.test(s)) return s;
    
    // Firebase Storage URLs for blog images
    if (s.includes('/')) {
      // e.g., "posts/hero.webp" -> Firebase URL
      return `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/${encodeURIComponent(s)}?alt=media`;
    }
    
    // Default to books folder if no path specified
    return `https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.firebasestorage.app/o/books%2F${encodeURIComponent(s)}?alt=media`;
  }
  
  // Build page title and meta description
  $: pageTitle = `${post.title} - Charles Boswell`;
  $: metaDescription = post.excerpt || `Read "${post.title}" by Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter.`;
  $: heroImageUrl = resolveHeroImage(post.heroImage);
  $: readTime = calculateReadTime(post.contentMarkdown || '');
  
  // Schema.org structured data for SEO
  $: structuredData = {
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
  };
  
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
        // Fallback for older browsers
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
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      <!-- Hero Content -->
      <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div class="container mx-auto max-w-4xl">
          <h1 class="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          {#if post.excerpt}
            <p class="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Article Content -->
  <article class="container mx-auto px-4 py-12 max-w-4xl">
    <!-- Header (for posts without hero image) -->
    {#if !heroImageUrl}
      <header class="mb-12 text-center">
        <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        
        {#if post.excerpt}
          <p class="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {post.excerpt}
          </p>
        {/if}
      </header>
    {/if}

    <!-- Article Meta -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-gray-200">
      <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600">
        {#if post.publishDate || post.publishedAt}
          <div class="flex items-center">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <time>{formatDate(post.publishedAt || post.publishDate)}</time>
          </div>
        {/if}
        
        {#if readTime}
          <div class="flex items-center">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{readTime}</span>
          </div>
        {/if}
        
        <div class="flex items-center">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span>Charles Boswell</span>
        </div>
      </div>
      
      <!-- Social Sharing -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600">Share:</span>
        
        <button
          onclick={shareOnTwitter}
          class="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Share on Twitter"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </button>
        
        <button
          onclick={shareOnFacebook}
          class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Share on Facebook"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        
        <button
          onclick={copyLink}
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="Copy link"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Article Content -->
    <div class="prose prose-lg prose-gray max-w-none">
      {#if htmlContent}
        {@html htmlContent}
      {:else}
        <p class="text-gray-500 italic">No content available.</p>
      {/if}
    </div>

    <!-- Tags -->
    {#if post.tags && post.tags.length > 0}
      <div class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex items-center flex-wrap gap-3">
          <span class="text-sm font-medium text-gray-600">Tags:</span>
          {#each post.tags as tag}
            <a 
              href="/blog?tag={encodeURIComponent(tag)}"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            >
              {tag}
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Navigation -->
    <nav class="mt-16 pt-8 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <a 
          href="/blog" 
          class="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium group transition-colors"
        >
          <svg class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          All Blog Posts
        </a>
        
        <a 
          href="/" 
          class="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium group transition-colors"
        >
          Home
          <svg class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </nav>
  </article>

  <!-- Author Bio Section -->
  <section class="bg-white border-t border-gray-200">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="flex-shrink-0">
          <!-- Author image placeholder - replace with actual author image -->
          <div class="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        
        <div class="flex-1 text-center md:text-left">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Charles Boswell</h3>
          <p class="text-gray-600 leading-relaxed">
            Navy veteran, wildland firefighter, and fantasy novelist. Charles draws from his real-world experiences to craft epic tales that explore themes of faith, courage, and perseverance in the face of adversity.
          </p>
          <div class="mt-4">
            <a 
              href="/about" 
              class="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
            >
              Learn more about Charles
              <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>