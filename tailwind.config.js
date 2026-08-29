/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f4fd',
          100: '#ece9fb',
          200: '#dbd6f8',
          300: '#c0b7f2',
          400: '#9d8fe9',
          500: '#6558D3', // Primary Violet Accent
          600: '#5446c4',
          700: '#4638a8',
          800: '#3a2f8b',
          900: '#312871',
          950: '#1d1746',
        },
        income: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981', // Green for positive income/savings
          600: '#059669',
          700: '#047857',
        },
        caution: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b', // Orange/Amber for spending/caution
          600: '#d97706',
          700: '#b45309',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', // Blue for secondary savings/info
          600: '#2563eb',
          700: '#1d4ed8',
        },
        navy: {
          800: '#131b2e',
          900: '#0b1120', // Dark Navy summary panels
          950: '#070b14',
        },
        expense: {
          50: '#fff1f2',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        }
      },
      borderRadius: {
        'card': '16px',
        'panel': '16px',
      },
      width: {
        'sidebar': '238px',
      },
      height: {
        'topbar': '76px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
