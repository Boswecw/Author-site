<!-- src/lib/components/Navigation.svelte - FIXED VERSION -->
<script lang="ts">
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { buildImageUrl } from '$lib/utils/firebase'; // ✅ Import central util

  let mobileMenuOpen = false;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Books', href: '/books' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ] as const;

  // --- Logo handling (filename OR full URL) ---
  export let logo: string | null = 'Signaturelogo.png';

  // ✅ FIXED: Use central buildImageUrl instead of local function
  $: logoSrc =
    typeof logo === 'string' && logo.trim()
      ? (logo.includes('/') || logo.startsWith('http'))
        ? logo.trim()
        : buildImageUrl(logo.trim(), 'icons') // ✅ Use icons/ folder for logos
      : null;

  function closeMenu() {
    mobileMenuOpen = false;
  }

  function onLogoError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    const span = document.createElement('span');
    span.textContent = 'CB';
    span.className =
      'inline-flex items-center justify-center h-14 w-14 rounded bg-[var(--accent-100)] text-[var(--primary-700)] font-semibold';
    img.replaceWith(span);
  }

  // Current path (normalized)
  $: pathname = normalizePath(browser ? $page.url.pathname : '/');

  function normalizePath(p: string) {
    if (!p) return '/';
    return p !== '/' ? p.replace(/\/+$/, '') : '/';
  }

  // Highlight current section (Home exact, others include subpaths)
  function isActive(href: string) {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  onMount(() => afterNavigate(() => (mobileMenuOpen = false)));
</script>

<header
  class="sticky top-0 z-[100] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200"
  style="--nav-h: 64px;"
>
  <div class="w-full h-16 px-3 md:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
    <!-- Left: Brand -->
    <a href="/" class="flex items-center gap-3 min-w-0" aria-label="Charles Boswell - Home">
      {#if logoSrc}
        <img
          src={logoSrc}
          alt="Charles Boswell signature logo"
          width="56"
          height="56"
          class="h-14 w-14 object-contain drop-shadow-sm"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          on:error={onLogoError}
        />
      {:else}
        <span class="inline-flex items-center justify-center h-14 w-14 rounded bg-[var(--accent-100)] text-[var(--primary-700)] font-semibold">
          CB
        </span>
      {/if}
      <span class="brand-name text-xl md:text-2xl tracking-wide text-[color:var(--primary-700)] truncate">
        Charles Boswell
      </span>
    </a>

    <div></div>

    <!-- Right: Links (desktop) -->
    <nav aria-label="Primary" class="hidden md:flex justify-end items-center gap-2">
      {#each navigation as l}
        <a
          href={l.href}
          class="nav-link"
          class:active={isActive(l.href)}
          aria-current={isActive(l.href) ? 'page' : undefined}
          data-sveltekit-preload-data
        >
          {l.name}
        </a>
      {/each}
    </nav>

    <!-- Mobile menu -->
    <details class="md:hidden justify-self-end" bind:open={mobileMenuOpen}>
      <summary
        class="list-none cursor-pointer p-2 rounded-md hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        ☰
      </summary>

      <div
        class="absolute right-3 w-52 rounded-lg border border-gray-200 bg-white shadow-lg p-2 space-y-1"
        style="top: var(--nav-h);"
      >
        {#each navigation as l}
          <a
            href={l.href}
            class="nav-link w-full"
            class:active={isActive(l.href)}
            on:click={closeMenu}
            aria-current={isActive(l.href) ? 'page' : undefined}
            data-sveltekit-preload-data
          >
            {l.name}
          </a>
        {/each}
      </div>
    </details>
  </div>
</header>