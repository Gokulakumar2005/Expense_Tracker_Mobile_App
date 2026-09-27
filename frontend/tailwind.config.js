/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.js",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        income: {
          light: '#dcfce7',
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        expense: {
          light: '#fee2e2',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
      },
    },
  },
  plugins: [],
};
