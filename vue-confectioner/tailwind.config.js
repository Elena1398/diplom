/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
         'lilac': '#c091d0',
         'lilacblack': '#a69dab',
         'footer': '#654633',
         'light_orange': '#ffb98d',
         'light_beige':'#f8eaea',

         'heareblak':'#fec89a',
         'header':'#fedcc4'
      }
    }
  },
  plugins: []
}
