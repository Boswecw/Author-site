<script lang="ts">
  import { page } from '$app/stores';
  
  let mobileMenuOpen = false;
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Books', href: '/books' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ];

  function closeMenu() {
    mobileMenuOpen = false;
  }
</script>

<nav class="bg-white shadow-lg sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0 flex items-center" on:click={closeMenu}>
          <span class="text-2xl font-bold fire-gradient bg-clip-text text-transparent">
            Charles W. Boswell
          </span>
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="px-3 py-2 text-sm font-medium transition-colors duration-200 {
              $page.url.pathname === item.href
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-700 hover:text-red-600'
            }"
          >
            {item.name}
          </a>
        {/each}
      </div>
      
      <!-- Mobile menu button -->
      <div class="md:hidden flex items-center">
        <button
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="text-gray-700 hover:text-red-600 focus:outline-none focus:text-red-600"
          aria-label="Toggle mobile menu"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {#if mobileMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Mobile Navigation -->
  {#if mobileMenuOpen}
    <div class="md:hidden bg-white border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        {#each navigation as item}
          <a
            href={item.href}
            class="block px-3 py-2 text-base font-medium transition-colors duration-200 {
              $page.url.pathname === item.href
                ? 'text-red-600 bg-red-50'
                : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
            }"
            on:click={closeMenu}
          >
            {item.name}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</nav>