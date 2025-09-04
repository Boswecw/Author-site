import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enable preprocessing (TypeScript, PostCSS, etc.)
  preprocess: vitePreprocess(),

  kit: {
    // ✅ Auto adapter works for local dev; swap for vercel/node/etc. in prod
    adapter: adapter(),

    // ✅ Prerender configuration
    prerender: {
      // Don’t crash if SvelteKit finds dynamic routes it can’t crawl
      handleUnseenRoutes: 'ignore',

      // Gracefully log HTTP errors during prerender
      handleHttpError: ({ path, referrer, message }) => {
        console.warn(
          `Prerender warning: ${path}${referrer ? ` (linked from ${referrer})` : ''} - ${message}`
        );
      }
    }
  },

  // ✅ Disable Svelte 5 runes mode for compatibility with older code
  compilerOptions: {
    runes: false
  }
};

export default config;
