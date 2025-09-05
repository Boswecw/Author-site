import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter({
      edge: false, // Node functions (Mongo-friendly)
      split: true  // optional, smaller functions
    }),
    prerender: { handleUnseenRoutes: 'ignore' }
  }
};
