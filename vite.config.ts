// vite.config.ts - Optimized for Render deployment
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [sveltekit()],
    
    // Define global constants
    define: {
      'import.meta.env.NODE_ENV': JSON.stringify(mode)
    },
    
    // Build configuration optimized for Render
    build: {
      // Target modern browsers in production
      target: isProduction ? 'es2020' : 'esnext',
      
      // Optimize bundle size
      minify: isProduction ? 'terser' : false,
      
      // Rollup options
      rollupOptions: {
        // Force use of JS version instead of native binary (Render compatibility)
        external: [],
        
        // Output configuration
        output: {
          // Ensure consistent chunk names
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      
      // Source maps for debugging (disable in production for size)
      sourcemap: isDevelopment,
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    
    // Development server configuration
    server: {
      port: 3000,
      host: isDevelopment ? 'localhost' : '0.0.0.0',
      hmr: {
        port: 3001
      }
    },
    
    // Preview server configuration
    preview: {
      port: 3000,
      host: '0.0.0.0'
    },
    
    // Dependency optimization
    optimizeDeps: {
      // Exclude problematic packages
      exclude: [
        '@rollup/rollup-linux-x64-gnu'
      ],
      
      // Include dependencies that should be optimized
      include: [
        'mongodb',
        'firebase',
        'nodemailer',
        'marked'
      ],
      
      // Force optimization in production
      force: isProduction
    },
    
    // Environment variables handling
    envPrefix: ['VITE_', 'PUBLIC_'],
    
    // Build performance optimizations for Render
    esbuild: {
      target: 'es2020',
      // Drop console logs in production (optional)
      drop: isProduction ? ['console', 'debugger'] : []
    },
    
    // CSS configuration
    css: {
      // PostCSS configuration
      postcss: './postcss.config.js',
      
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase'
      }
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        // Path aliases (sync with svelte.config.js)
        '$lib': './src/lib',
        '$routes': './src/routes'
      }
    },
    
    // Worker configuration for Node.js compatibility
    worker: {
      format: 'es'
    },
    
    // SSR configuration for SvelteKit
    ssr: {
      // Don't externalize these packages in SSR
      noExternal: ['firebase']
    }
  };
});