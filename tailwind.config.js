/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        noe: '#ef4444',      // vermell
        terry: '#3b82f6',    // blau
        ariadna: '#f97316',  // taronja
        biel: '#22c55e',     // verd
        ona: '#a855f7',      // lila
        bru: '#14b8a6'       // turquesa
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Nunito"', 'sans-serif']
      }
    }
  },
  plugins: []
}
