/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      colors: {
        pink: {
          25: '#fefcfe',
          50: '#fdf2f8',
          75: '#fcebf4',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        rose: {
          25: '#fefcfc',
          50: '#fef2f2',
          75: '#fef0f0',
          100: '#fee2e2',
          150: '#fdd8d8',
          200: '#fecaca',
          300: '#fca5a5',
        },
        blush: {
          50: '#fef7f7',
          100: '#fdf0f0',
          200: '#fce3e3',
          300: '#f9d1d1',
        }
      }
    },
  },
  plugins: [],
};