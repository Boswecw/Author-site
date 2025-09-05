// tailwind.config.js - UPDATED COHESIVE COLOR SCHEME
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts,md}'],
  theme: {
    extend: {
      colors: {
        // ===== MAIN BRAND PALETTE =====
        // Professional grays for primary content
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef', 
          200: '#dee2e6',
          300: '#ced4da',
          400: '#6c757d',
          500: '#495057',  // main text
          600: '#343a40',
          700: '#212529',  // headings
          800: '#1a1e21',
          900: '#0d1117'
        },

        // Sophisticated gold accent for buttons, highlights
        accent: {
          50: '#fefdf8',
          100: '#fef7e0',
          200: '#fcefc7', 
          300: '#f8e3a3',
          400: '#f2d679',
          500: '#e6c54d',  // main accent
          600: '#d4af37',  // hover states
          700: '#b8941f',
          800: '#967618',
          900: '#7a5f0f'
        },

        // ===== SUBTLE GENRE HINTS =====
        // Used sparingly for icons, borders, small accents
        faith: {
          light: '#e8f4f8',
          main: '#4a90a4',
          dark: '#2c5f6f'
        },
        
        fantasy: {
          light: '#f0f4ff',
          main: '#5b6eb0', 
          dark: '#384478'
        },
        
        scifi: {
          light: '#f0fdf4',
          main: '#22c55e',
          dark: '#166534'
        },

        // ===== SEMANTIC COLORS =====
        success: '#10b981',
        warning: '#f59e0b', 
        error: '#ef4444',
        info: '#3b82f6'
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Text', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },

      // Remove the old complex color schemes
      // No more fire scale, brand metallics, or competing genre palettes
    }
  },
  plugins: [typography]
}