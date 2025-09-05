import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  css: {
    postcss: './postcss.config.js'
  },
  
  build: {
    rollupOptions: {
      // Remove external Firebase URLs - they were causing build issues
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/storage'],
          'vendor': ['marked']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    target: 'esnext'
  },

  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/storage',
      'marked'
    ],
    exclude: ['mongodb', '@sveltejs/kit']
  },

  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  ssr: {
    noExternal: ['marked', 'firebase']
  },

  server: {
    port: 3000,
    host: true,
    fs: {
      allow: ['..']
    }
  },

  preview: {
    port: 4173,
    host: true
  },

  assetsInclude: [
    '**/*.png',
    '**/*.jpg', 
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.webp'
  ],

  // Handle environment variables properly
  envPrefix: 'VITE_'
});