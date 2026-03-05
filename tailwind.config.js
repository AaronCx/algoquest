/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          base: '#0a0a0f',
          card: '#12121a',
          dialog: '#111128',
        },
        coral: '#e8645a',
        amber: {
          DEFAULT: '#d97706',
          light: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
