/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agent: {
          navy: '#0b1329',
          card: '#131e3d',
          accent: '#10b981', // Emerald green
          gold: '#f59e0b',
          brand: '#0d4e56',
          orange: '#ea580c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        hover: '0 12px 30px -4px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};

