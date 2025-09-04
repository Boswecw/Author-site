// tailwind.config.js
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts,md}'],
  theme: {
    extend: {
      colors: {
        // keep your fire scale as-is
        fire: {
          50: '#fef7f0',
          100: '#fdeee1',
          200: '#fbd9c2',
          300: '#f8b898',
          400: '#f4926c',
          500: '#f0734a',
          600: '#e15a2f',
          700: '#bc4525',
          800: '#963924',
          900: '#783220',
          950: '#411710'
        },

        // --- Shared brand metals & neutrals ---
        brand: {
          gold:     '#C9A227', // signature muted gold
          bronze:   '#8C7853',
          charcoal: '#1A1A1A',
          cream:    '#F8F4E9'
        },

        // --- Genre accents ---
        faith: {
          ember:  '#E4572E', // firestorm glow
          forest: '#355E3B', // steady natural tone
        },
        fantasy: {
          storm:   '#1C3A55', // stormy blue
          light:   '#FFD65A', // glowing orb gold
          earth:   '#6E4B2B'  // medieval grounding
        },
        scifi: {
          neon:    '#39FF14', // biotech green
          orange:  '#FF6F3C', // subtitle accent
          shadow:  '#0F2A1E'  // swamp/alien dark
        }
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // optional per-genre heading fonts (if you install them via Google Fonts)
        serif: ['Cormorant Garamond', 'serif'], // for Christian Fiction
        fantasy: ['Cinzel', 'serif'],           // for Fantasy
        scifi: ['Orbitron', 'sans-serif']      // for Sci-Fi
      }
    }
  },
  plugins: [typography]
}
