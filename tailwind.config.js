/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'] },
      colors: {
        ink: '#161B3D',
        brand: { 50: '#EEF0FA', 100: '#DDE1F5', 200: '#BBC3EA', 400: '#6D7BC9', 500: '#4757B8', 600: '#37449A', 700: '#2E3A87', 800: '#232C68', 900: '#181E48' },
        peacock: { 50: '#E6F5F5', 500: '#0F8B8D', 600: '#0C7274' },
        madder: { 50: '#FBECEE', 500: '#B4364A', 600: '#952B3C' },
        app: '#F2F4F8',
      },
    },
  },
  plugins: [],
}
