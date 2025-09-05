<!-- src/lib/components/Footer.svelte - UPDATED COLOR SCHEME -->
<footer class="brand-gradient text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid md:grid-cols-4 gap-8">
      <!-- Brand Section -->
      <div class="md:col-span-2">
        <h3 class="text-lg font-bold mb-4">Charles Boswell</h3>
        <p class="text-white/80 mb-4 max-w-md">
          Navy veteran turned wildland firefighter, now crafting faith-driven fantasy tales
          inspired by real-world courage and brotherhood. Author of <em>Faith in a FireStorm</em>.
        </p>

        <!-- Social: replace with your real profiles -->
        <div class="flex space-x-4">
          <a
            href="https://x.com/charliewboswell"
            target="_blank" rel="noopener"
            class="text-white/80 hover:text-white transition-colors"
            aria-label="X (Twitter)"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.146 2H21l-6.9 7.89L22 22h-5.5l-4.3-5.59L6.2 22H3.34l7.41-8.47L2 2h5.6l3.88 5.18L18.146 2Zm-1.926 18h1.611L7.875 4H6.23l9.99 16Z"/></svg>
          </a>

          <a
            href="https://www.facebook.com/chuck.boswell.2025/"
            target="_blank" rel="noopener"
            class="text-white/80 hover:text-white transition-colors"
            aria-label="Facebook"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.5-3.87 3.79-3.87 1.1 0 2.25.2 2.25.2v2.48h-1.27c-1.25 0-1.64.78-1.64 1.58v1.9h2.79l-.45 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
          </a>

          <a
            href="https://www.instagram.com/chuck.boswell/"
            target="_blank" rel="noopener"
            class="text-white/80 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 4.5A5.5 5.5 0 1 0 17.5 12 5.5 5.5 0 0 0 12 6.5Zm0 9A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Zm5.75-8.75a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"/></svg>
          </a>
        </div>
      </div>

      <!-- Quick Links (internal routes) -->
      <div>
        <h4 class="font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2">
          <li><a href="/books" class="text-white/80 hover:text-white transition-colors">Latest Books</a></li>
          <li><a href="/blog" class="text-white/80 hover:text-white transition-colors">Blog Updates</a></li>
          <li><a href="/about" class="text-white/80 hover:text-white transition-colors">About Me</a></li>
          <li><a href="/contact" class="text-white/80 hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>

      <!-- Connect -->
      <div>
        <h4 class="font-semibold mb-4">Connect</h4>
        <div class="space-y-4">
          <p class="text-white/80 text-sm">
            Get updates on new releases and behind-the-scenes stories.
          </p>
          <!-- Updated button styling -->
          <a href="/contact" class="inline-block bg-white text-primary-700 hover:bg-primary-50 transition-colors py-2 px-4 text-sm font-medium rounded">
            Subscribe Now
          </a>
        </div>

        <div class="mt-6 pt-4 border-t border-white/20">
          <p class="text-white/90 text-sm">
            <strong>Faith in a FireStorm</strong><br>
            Coming Fall 2025
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p class="text-white/80 text-sm">
        © {new Date().getFullYear()} Charles Boswell. All rights reserved.
      </p>
      <div class="flex space-x-6 mt-4 md:mt-0">
        <a href="/privacy" class="text-white/70 hover:text-white text-sm transition-colors">Privacy Policy</a>
        <a href="/terms" class="text-white/70 hover:text-white text-sm transition-colors">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>