<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  // SEO and meta data
  $: pageTitle = getPageTitle($page.url.pathname);
  $: pageDescription = getPageDescription($page.url.pathname);
  
  function getPageTitle(pathname: string): string {
    switch (pathname) {
      case '/':
        return 'Charles Boswell - Fantasy Author';
      case '/about':
        return 'About - Charles Boswell';
      case '/books':
        return 'Books - Charles Boswell';
      case '/blog':
        return 'Blog - Charles Boswell';
      case '/contact':
        return 'Contact - Charles Boswell';
      default:
        return 'Charles Boswell - Fantasy Author';
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
  
  // Loading animations
  onMount(() => {
    document.body.classList.add('loaded');
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="twitter:title" content={pageTitle} />
  <meta property="twitter:description" content={pageDescription} />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />
  
  <main class="flex-1 pt-16">
    <slot />
  </main>
  
  <Footer />
</div>

<style>
  :global(body) {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }
  
  :global(body.loaded) {
    opacity: 1;
    transform: translateY(0);
  }
  
  :global(.fade-in) {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  :global(.slide-in-right) {
    animation: slideInRight 0.8s ease-out forwards;
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>