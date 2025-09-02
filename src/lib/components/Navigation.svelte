<script lang="ts">
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { IMAGES } from '$lib/utils/image';

  const SIGNATURE_LOGO = IMAGES.SIGNATURE_LOGO;

  let mobileMenuOpen = false;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Books', href: '/books' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ] as const;

  function closeMenu() { mobileMenuOpen = false; }

  // smaller fallback to match reduced logo size
  function onLogoError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    const span = document.createElement('span');
    span.textContent = 'CB';
    span.className =
      'inline-flex items-center justify-center h-14 w-14 rounded bg-[var(--brand-cream)] text-[var(--brand-charcoal)] font-semibold';
    img.replaceWith(span);
  }

  // current path, for active link state
  $: pathname = $page.url.pathname;
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  // auto-close mobile menu after nav
  onMount(() => afterNavigate(() => (mobileMenuOpen = false)));
</script>

<header
  class="sticky top-0 z-[100] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200"
  style="--nav-h: 64px;"
>
  <div class="w-full h-16 px-3 md:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
    <!-- Left: Brand -->
    <a href="/" class="flex items-center gap-3 min-w-0" aria-label="Charles Boswell - Home">
      <img
        src={SIGNATURE_LOGO}
        alt="Charles Boswell signature logo"
        width="56"
        height="56"
        class="h-14 w-14 object-contain drop-shadow-sm"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        on:error={onLogoError}
      />
      <span class="brand-name text-xl md:text-2xl tracking-wide text-[color:var(--stone-900)] truncate">
        Charles Boswell
      </span>
    </a>

    <div></div>

    <!-- Right: Links (desktop) -->
    <nav aria-label="Primary" class="hidden md:flex justify-end items-center gap-6">
      {#each navigation as l}
        <a
          href={l.href}
          aria-current={isActive(l.href) ? 'page' : undefined}
          class={`text-sm font-medium transition-opacity hover:opacity-80 ${isActive(l.href) ? 'text-[var(--brand-gold)]' : 'text-gray-700'}`}
        >
          {l.name}
        </a>
      {/each}
    </nav>

    <!-- Mobile menu (use native details/summary; no redundant role/button hacks) -->
    <details class="md:hidden justify-self-end" bind:open={mobileMenuOpen}>
      <summary
        class="list-none cursor-pointer p-2 rounded-md hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        ☰
      </summary>

      <!-- Dropdown under header using --nav-h -->
      <div
        class="absolute right-3 w-48 rounded-lg border border-gray-200 bg-white shadow-lg p-2 space-y-1"
        style="top: var(--nav-h);"
      >
        {#each navigation as l}
          <a
            href={l.href}
            class={`block px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-50 ${isActive(l.href) ? 'text-[var(--brand-gold)]' : 'text-gray-700'}`}
            on:click={closeMenu}
            aria-current={isActive(l.href) ? 'page' : undefined}
          >
            {l.name}
          </a>
        {/each}
      </div>
    </details>
  </div>
</header>
