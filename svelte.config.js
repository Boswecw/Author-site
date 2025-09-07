// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: sveltePreprocess(), // supports TS, PostCSS/Tailwind, etc.

  kit: {
    adapter: adapter({
      edge: false,
      split: true,
    })
  }
};

export default config;
