<!-- src/routes/+layout.svelte - FIXED: Ensure Header is properly rendered -->
<script lang="ts">
  // ✅ CRITICAL: Import CSS first
  import '../app.css';
  
  import Header from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  // ✅ FIX: Guard against undefined $page.url during hydration
  $: pathname = browser && $page?.url?.pathname ? $page.url.pathname : '/';

  function getPageTitle(pathname: string): string {
    switch (pathname) {
      case '/': return 'Charles Boswell - Fantasy Author';
      case '/about': return 'About - Charles Boswell';
      case '/books': return 'Books - Charles Boswell';
      case '/blog': return 'Blog - Charles Boswell';
      case '/contact': return 'Contact - Charles Boswell';
      default: return 'Charles Boswell - Fantasy Author';
    }
  }

  function getPageDescription(pathname: string): string {
    switch (pathname) {
      case '/':
        return 'Navy veteran, wildland firefighter, and fantasy novelist. Discover epic tales forged from real-world experience.';
      case '/about':
        return 'Learn about Charles Boswell\'s journey from U.S. Navy service to wildland firefighting to becoming a fantasy novelist.';
      case '/books':
        return 'Explore Charles Boswell\'s fantasy novels and upcoming releases.';
      case '/blog':
        return 'Read Charles Boswell\'s latest thoughts on writing, firefighting, military service, and the craft of storytelling.';
      case '/contact':
        return 'Get in touch with Charles Boswell and subscribe to his newsletter for updates on new releases and adventures.';
      default:
        return 'Navy veteran, wildland firefighter, and fantasy novelist. Discover epic tales forged from real-world experience.';
    }
  }
</script>

<svelte:head>
  <title>{getPageTitle(pathname)}</title>
  <meta name="description" content={getPageDescription(pathname)} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;500;600&family=Orbitron:wght@400;500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="layout-container">
  <!-- ✅ FIXED: Ensure Header component is actually rendered -->
  <Header />
  
  <main>
    <slot />
  </main>
  
  <Footer />
</div>