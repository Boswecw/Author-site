// svelte.config.js - FIXED: Enable runes mode for Svelte 5
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isDev = process.env.NODE_ENV !== 'production';

export default {
  kit: { 
    adapter: adapter() 
  },
  preprocess: vitePreprocess(),
  vitePlugin: { 
    inspector: isDev 
  },
  compilerOptions: {
    runes: true  // 🔥 CRITICAL: This enables Svelte 5 runes mode
  }
};
