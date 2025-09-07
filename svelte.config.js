// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
import sveltePreprocess from 'svelte-preprocess';

const config = {
  // If you don’t need preprocessing, you can remove this line entirely.
  preprocess: sveltePreprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      $lib: 'src/lib'
    }
  }
};

export default config;
