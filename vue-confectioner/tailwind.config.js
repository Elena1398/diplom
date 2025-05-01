/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
         'lilac': '#c091d0',
         'lilacblack': '#a69dab' 
      }
    }
  },
  plugins: []
}
