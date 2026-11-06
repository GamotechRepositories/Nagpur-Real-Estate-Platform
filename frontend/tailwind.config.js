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
          teal: '#0d4e56',
          'teal-dark': '#072e34',
          'teal-light': '#146b77',
          orange: '#ea580c', // Nagpur Orange accent
          'orange-hover': '#c2410c',
          navy: '#0f172a',
          slate: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.08)',
        hover: '0 12px 30px -4px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}

