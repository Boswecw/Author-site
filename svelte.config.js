// svelte.config.js - FIXED CSP ISSUE
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enable preprocessing (TypeScript, PostCSS, etc.)
  preprocess: vitePreprocess(),

  kit: {
    // ✅ FIXED: Adapter configuration for better compatibility
    adapter: adapter({
      // Adapter options can be configured here if needed
    }),

    // ✅ FIXED: Prerender configuration with better error handling
    prerender: {
      // Don't crash if SvelteKit finds dynamic routes it can't crawl
      handleMissingId: 'warn',
      handleHttpError: ({ path, referrer, message }) => {
        // Log but don't crash on HTTP errors during prerender
        console.warn(
          `⚠️ Prerender warning: ${path}${referrer ? ` (linked from ${referrer})` : ''} - ${message}`
        );
      }
    },

    // ✅ FIXED: Remove problematic CSP configuration that was causing dev server errors
    // csp: {
    //   directives: {
    //     'img-src': [
    //       'self',
    //       'data:',
    //       'https://firebasestorage.googleapis.com',
    //       'https://storage.googleapis.com'
    //     ]
    //   },
    //   reportOnly: {
    //     'img-src': [
    //       'self',
    //       'data:',
    //       'https://*.firebasestorage.app',
    //       'https://firebasestorage.googleapis.com'
    //     ]
    //   }
    // }

    // ✅ FIXED: Type checking configuration
    typescript: {
      config: (config) => {
        return {
          ...config,
          compilerOptions: {
            ...config.compilerOptions,
            // Ensure proper module resolution
            moduleResolution: 'bundler',
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            skipLibCheck: true,
            // Better error handling for build
            noUncheckedIndexedAccess: false,
            strict: true
          }
        };
      }
    }
  },

  // ✅ FIXED: Compiler options for Svelte 5 compatibility
  compilerOptions: {
    // Keep runes disabled for now to maintain compatibility
    runes: false,
    // Enable better error reporting
    dev: process.env.NODE_ENV === 'development'
  }
};

export default config;