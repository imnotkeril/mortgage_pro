/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          background: '#0D1015',
          accent: '#BF9FFB',
          text: '#FFFFFF',
          positive: '#74F174',
          negative: '#FAA1A4',
          neutral1: '#90BFF9',
          neutral2: '#FFF59D',
          grey: '#D1D4DC',
          divider: '#2A2E39',
        },
      },
    },
    plugins: [],
  }