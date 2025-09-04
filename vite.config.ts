// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // CRITICAL FIX: Prevent Vite from processing external URLs
  build: {
    rollupOptions: {
      external: [
        // Prevent processing Firebase URLs during build
        /^https:\/\/firebasestorage\.googleapis\.com/,
        /^https:\/\/storage\.googleapis\.com/
      ]
    }
  },

  // CRITICAL FIX: Optimize dependencies for build
  optimizeDeps: {
    exclude: ['mongodb'] // Exclude server-only dependencies
  },

  // CRITICAL FIX: Define for build-time variables
  define: {
    global: 'globalThis', // Fix for some dependencies
  },

  // CRITICAL FIX: Handle server-side only modules
  ssr: {
    noExternal: ['marked'] // Process markdown library for SSR
  }
});