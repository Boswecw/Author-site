// vite.config.ts - Final TypeScript configuration
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // Handle external Firebase URLs
  build: {
    rollupOptions: {
      external: [
        /^https:\/\/firebasestorage\.googleapis\.com/
      ]
    }
  }
});