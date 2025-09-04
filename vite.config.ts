// vite.config.ts - COMPLETE BUILD FIX
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // ✅ FIXED: Build configuration to prevent external URL processing
  build: {
    rollupOptions: {
      external: [
        // Prevent Vite from trying to bundle Firebase URLs
        /^https:\/\/firebasestorage\.googleapis\.com/,
        /^https:\/\/storage\.googleapis\.com/,
        /^https:\/\/.*\.firebasestorage\.app/
      ]
    },
    // Increase chunk size warning limit for better builds
    chunkSizeWarningLimit: 1000,
    // Better source maps for debugging
    sourcemap: true
  },

  // ✅ FIXED: Dependency optimization
  optimizeDeps: {
    include: [
      'marked' // Ensure markdown processing is optimized
    ],
    exclude: [
      'mongodb', // Exclude server-only dependencies
      '@sveltejs/kit' // Let SvelteKit handle its own optimization
    ]
  },

  // ✅ FIXED: Define for build-time variables
  define: {
    global: 'globalThis', // Fix for Node.js global references
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  // ✅ FIXED: SSR configuration
  ssr: {
    noExternal: [
      'marked' // Process markdown library for SSR
    ]
  },

  // ✅ FIXED: Server configuration for development
  server: {
    port: 3000,
    host: true, // Allow external connections
    fs: {
      // Allow serving files from project root and node_modules
      allow: ['..']
    }
  },

  // ✅ FIXED: Preview configuration
  preview: {
    port: 4173,
    host: true
  },

  // ✅ FIXED: CSS processing
  css: {
    postcss: {
      plugins: []
    }
  },

  // ✅ FIXED: Asset handling for images
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.webp'
  ]
});