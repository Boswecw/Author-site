<!-- src/lib/components/Navigation.svelte - COMPLETELY FIXED -->
<!-- @component
no description yet
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let mobileMenuOpen = false;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Books', href: '/books' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ] as const;

  // Simplified logo handling (avoid Firebase dependency for now)
  export let logo: string | null = null;

  function closeMenu() {
    mobileMenuOpen = false;
  }

  function normalizePath(p: string) {
    if (!p) return '/';
    return p !== '/' ? p.replace(/\/+$/, '') : '/';
  }

  function isActive(href: string) {
    const pathname = normalizePath(browser ? $page.url?.pathname ?? '/' : '/');
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.indexOf(href + '/') === 0;
  }

  onMount(() => afterNavigate(() => (mobileMenuOpen = false)));
</script>

<header class="sticky top-0 z-50 bg-white border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2" data-sveltekit-preload-data>
          <span class="text-xl font-bold text-gray-900">Charles Boswell</span>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="nav-link"
            class:active={isActive(item.href)}
            data-sveltekit-preload-data
          >
            {item.name}
          </a>
        {/each}
      </nav>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          type="button"
          class="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
        >
          <span class="sr-only">Open main menu</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile menu -->
 {#if menuOpen}
  <div class="md:hidden" id="mobile-menu">
    <div class="space-y-1 px-2 pt-2 pb-3">
      <a href="/" class="block px-3 py-2 rounded-md text-base font-medium nav-link">Home</a>
      <a href="/books" class="block px-3 py-2 rounded-md text-base font-medium nav-link">Books</a>
      <a href="/blog" class="block px-3 py-2 rounded-md text-base font-medium nav-link">Blog</a>
      <a href="/about" class="block px-3 py-2 rounded-md text-base font-medium nav-link">About</a>
      <a href="/contact" class="block px-3 py-2 rounded-md text-base font-medium nav-link">Contact</a>
    </div>
  </div>
{/if}
</header>