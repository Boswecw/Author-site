// vite.config.ts - Rollup fix
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      // Force use of JS version instead of native binary
      external: []
    }
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
});