/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'card-bg': 'rgba(30,30,30,0.85)',
        'bubble-bg': 'rgba(80,75,70,0.75)',
        paper: '#d4c9a8',
        'paper-dark': '#b8a882',
        crimson: '#8B1A1A',
        'crimson-light': '#c0392b',
        'red-string': '#cc2200',
        muted: '#888',
        faint: '#333',
      },
      fontFamily: {
        mono: ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        hand: ['"Caveat"', 'cursive'],
      },
    },
  },
  plugins: [],
}
