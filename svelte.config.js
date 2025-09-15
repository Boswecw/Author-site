// svelte.config.js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // Force Node.js adapter (critical for Render deployment)
    adapter: adapter({
      // Ensure proper build output
      out: 'build'
    }),
    
    // Path aliases
    alias: {
      $lib: 'src/lib',
      $routes: 'src/routes'
    }
  }
};

export default config;