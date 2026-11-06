/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#172C3B',
          light: '#223D52',
          dark: '#0F1E28',
          deep: '#0B171F',
        },
        ivory: {
          DEFAULT: '#F7F4ED',
          light: '#FAF8F3',
          dark: '#EFECE3',
        },
        gold: {
          DEFAULT: '#B89A65',
          light: '#CBB285',
          dark: '#9A7D4C',
          subtle: '#EAE1CE',
        },
        charcoal: {
          DEFAULT: '#252525',
          light: '#404040',
          muted: '#6B7280',
        },
        beige: {
          DEFAULT: '#E9E4DA',
          light: '#F3EFE7',
          dark: '#DCD5C8',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.2em',
        luxury: '.15em',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(23, 44, 59, 0.05), 0 1px 2px -1px rgba(23, 44, 59, 0.05)',
        card: '0 4px 20px -2px rgba(23, 44, 59, 0.06)',
        hover: '0 12px 32px -4px rgba(23, 44, 59, 0.12)',
        dropdown: '0 10px 30px -5px rgba(23, 44, 59, 0.15)',
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
    },
  },
  plugins: [],
}
