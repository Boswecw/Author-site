import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  css: {
    postcss: './postcss.config.js'
  },
  
  build: {
    rollupOptions: {
      external: [
        /^https:\/\/firebasestorage\.googleapis\.com/,
        /^https:\/\/storage\.googleapis\.com/,
        /^https:\/\/.*\.firebasestorage\.app/
      ]
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },

  optimizeDeps: {
    include: ['marked'],
    exclude: ['mongodb', '@sveltejs/kit']
  },

  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  ssr: {
    noExternal: ['marked']
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
  ]
});