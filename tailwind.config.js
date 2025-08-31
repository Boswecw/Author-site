// ===== tailwind.config.js =====
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
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
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: [
		require('@tailwindcss/typography')
	]
};