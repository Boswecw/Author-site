// svelte.config.js — CLEAN, WORKING
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    // Put your aliases here (not in tsconfig)
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      $server: 'src/lib/server',
      $utils: 'src/lib/utils',
      $routes: 'src/routes'
    },

    prerender: {
      handleMissingId: 'warn',
      handleHttpError: 'warn',
      handleUnseenRoutes: 'warn'
    }
  },

  // Svelte compiler options
  compilerOptions: {
    runes: false,
    dev: process.env.NODE_ENV === 'development'
  }
};

export default config;
