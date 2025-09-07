// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Use svelte-preprocess to avoid the vitePreprocess export issue (works for TS, PostCSS, etc.)
  preprocess: sveltePreprocess(),

  kit: {
    adapter: adapter({
      edge: false,
      split: true
    })
  }
};

export default config;
