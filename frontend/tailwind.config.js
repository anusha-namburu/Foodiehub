/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main FoodieHub Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        cream: {
          50: '#fffbf5',
          100: '#fff8eb',
          200: '#faedd3',
          300: '#f5dfb8',
        },
        accent: {
          green: '#15803d',
          darkgreen: '#14532d',
          red: '#dc2626',
          darkred: '#991b1b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -4px rgba(0, 0, 0, 0.07)',
        'float': '0 20px 40px -6px rgba(249, 115, 22, 0.15)',
      }
    },
  },
  plugins: [],
}
