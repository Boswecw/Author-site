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

        // NEW — shared brand metals & neutrals
        brand: {
          gold:   '#C9A86A',
          bronze: '#8C7853',
          charcoal: '#2B2B2B',
          cream:  '#F5F2E7'
        },

        // NEW — genre accents
        faith: {
          blue: '#2C3E7F',
          tint: '#E7EDF8'
        },
        fantasy: {
          crimson: '#7A1C1C',
          emerald: '#0F5132',
          shadow:  '#3C2F2F'
        }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: [typography]
}
