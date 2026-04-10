/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#2B2B2B',
          panel: '#3C3C3C',
          accent: '#4CAF50',
          text: '#E0E0E0',
          grid: '#555555',
        }
      }
    },
  },
  plugins: [],
}
