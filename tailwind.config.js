/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quinn: {
          blue: '#2563EB',
          'blue-light': '#3B82F6',
          'blue-dark': '#1D4ED8',
          orange: '#F97316',
          'orange-light': '#FB923C',
          'orange-dark': '#EA580C',
          teal: '#0D9488',
          'teal-light': '#14B8A6',
          'teal-dark': '#0F766E',
        },
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['"Nunito"', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'coin-revoke': 'coinRevoke 0.4s ease-out forwards',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        coinRevoke: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.5' },
          '100%': { transform: 'scale(0.85)', opacity: '0.35' },
        },
      },
    },
  },
  plugins: [],
}
