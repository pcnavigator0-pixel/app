/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: {
          orange: '#f97316',
          'orange-hover': '#ea580c',
          'orange-deep': '#c2410c',
          'orange-soft': '#fff1e8',
        },
        ink: {
          900: '#0f172a',
          700: '#334155',
          500: '#64748b',
          300: '#94a3b8',
        },
        line: '#e5e7eb',
        surface: '#ffffff',
        canvas: '#f8f8f7',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
