/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0d1b2a',
        panel: '#1b263b',
        brand: '#14b8a6',
        violet: '#a78bfa',
      },
    },
  },
  plugins: [],
}
