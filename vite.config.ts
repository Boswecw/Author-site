import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    // This helps with some Firebase compatibility issues
    global: 'globalThis',
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    target: 'esnext'
  }
});