// svelte.config.js - CLEAN WORKING VERSION
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    
    prerender: {
  handleMissingId: 'warn',
  handleHttpError: 'warn',
  handleUnseenRoutes: 'warn'
    },

    typescript: {
      config: (config) => ({
        ...config,
        compilerOptions: {
          ...config.compilerOptions,
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true
        }
      })
    }
  },

  compilerOptions: {
    runes: false,
    dev: process.env.NODE_ENV === 'development'
  }
};

export default config;