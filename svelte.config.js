// svelte.config.js
import netlify from '@sveltejs/adapter-netlify';
import sveltePreprocess from 'svelte-preprocess';

const config = {
  // If you don’t need preprocessing, you can remove this line entirely.
  preprocess: sveltePreprocess(),

  kit: {
    adapter: netlify(),
    alias: {
      $lib: 'src/lib'
    }
  }
};

export default config;
