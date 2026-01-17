/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'line-green': '#00B900',
        'line-dark': '#1A1A1A',
        'ai-vision-pink': '#FF69B4',
        'ai-vision-blue': '#4169E1',
      },
      fontFamily: {
        'sans': ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
