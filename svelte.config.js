// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isDev = process.env.NODE_ENV !== 'production';

export default {
  kit: { adapter: adapter() },      // <-- invoke adapter()
  preprocess: vitePreprocess(),     // <-- correct import location
  vitePlugin: { inspector: isDev }  // dev-only inspector
};
