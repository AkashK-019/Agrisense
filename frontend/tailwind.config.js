/* @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        forest: {
          50: '#f4f7f4',
          100: '#e3ece3',
          200: '#c5d9c6',
          300: '#9ebea0',
          400: '#729d75',
          500: '#4f7f53',
          600: '#3c643f',
          700: '#315134',
          800: '#2a422d',
          900: '#1b321e',
          950: '#0d1c0f',
        },
        konkan: {
          sand: '#fdfbf7',
          soil: '#78593a',
          earth: '#4a3728',
          clay: '#9c6b4e',
          leaf: '#2d6a4f',
          deep: '#1b4332',
          light: '#d8f3dc',
          accent: '#52b788',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        marathi: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}