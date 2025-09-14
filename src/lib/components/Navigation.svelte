<!-- src/lib/components/Navigation.svelte - MINIMAL VERSION FOR TESTING -->
<!-- @component
no description yet
-->
<script>
  let mobileMenuOpen = false;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Books', href: '/books' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ];

  function toggleMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="bg-white border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900">
          Charles Boswell
        </a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
          >
            {item.name}
          </a>
        {/each}
      </nav>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          type="button"
          class="text-gray-400 hover:text-gray-500 p-2"
          on:click={toggleMenu}
        >
          <span class="sr-only">Open menu</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden bg-white border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        {#each navigation as item}
          <a
            href={item.href}
            class="text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
            on:click={closeMenu}
          >
            {item.name}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</header>