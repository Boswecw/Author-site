import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-netlify';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // IMPORTANT: MongoDB needs Node functions, not Edge
      edge: false,
      // split: true can reduce cold start by splitting functions; optional
      split: true
    }),
    prerender: {
      // Avoid crawler warnings for dynamic routes you don’t link to at build time
      handleUnseenRoutes: 'ignore'
    }
  }
};
