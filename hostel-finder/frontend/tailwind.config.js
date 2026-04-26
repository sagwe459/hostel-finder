/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef9ee',
          100: '#fdf0d0',
          200: '#fbdd9d',
          300: '#f8c460',
          400: '#f5a72a',
          500: '#f28c0f',
          600: '#e06c08',
          700: '#b94f0a',
          800: '#943e10',
          900: '#783410',
        },
        dark: {
          50:  '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1bac9',
          400: '#8795ab',
          500: '#677890',
          600: '#536076',
          700: '#444f61',
          800: '#3b4352',
          900: '#343b47',
          950: '#1e2330',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
