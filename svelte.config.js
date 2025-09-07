// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // keep default settings; these work well
      edge: false,
      split: true
    })
  }
};

export default config;
