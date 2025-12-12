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
        violet: {
          25: '#fdfcfe',
          50: '#f5f3ff',
          75: '#ede9fe',
          100: '#e9e3ff',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        purple: {
          25: '#fefcfe',
          50: '#faf5ff',
          75: '#f3ebff',
          100: '#f3e8ff',
          150: '#e9d5ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
        },
        lavender: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e6e0ff',
          300: '#d4cbff',
        }
      }
    },
  },
  plugins: [],
};