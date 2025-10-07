// vite.config.ts - Fixed for Render deployment
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
      
      // Use esbuild for minification (faster and built-in)
      minify: isProduction ? 'esbuild' : false,
      
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
        'nodemailer',
        'marked'
      ],
      
      // Force optimization in production
      force: isProduction
    },
    
    // Environment variables handling
    envPrefix: ['VITE_', 'PUBLIC_'],
    
    // Enhanced esbuild configuration
    esbuild: {
      target: 'es2020',
      // Drop console logs in production (optional)
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});