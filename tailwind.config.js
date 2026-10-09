/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F5F3',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F0F0EE',
          tertiary: '#EAEAE7',
          dark: '#121212',
          darkMuted: '#1A1A1A',
        },
        ink: {
          DEFAULT: '#111111',
          secondary: '#6F6F6B',
          muted: '#9A9A95',
          faint: '#C5C5C0',
        },
        border: {
          DEFAULT: '#E5E5E1',
          subtle: '#ECECE8',
          dark: '#2A2A28',
        },
        brand: {
          black: '#111111',
          accent: '#E65C00', // warm minimal studio accent
          glow: '#F6EDE2',
        }
      },
      borderRadius: {
        'card': '24px',
        'card-lg': '28px',
        'card-sm': '18px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 12px -2px rgba(17, 17, 17, 0.03), 0 1px 3px rgba(17, 17, 17, 0.02)',
        'float': '0 12px 36px -8px rgba(17, 17, 17, 0.06), 0 4px 12px -2px rgba(17, 17, 17, 0.03)',
        'dark-float': '0 16px 40px -10px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['"Inter"', '"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        editorial: ['"Inter"', '"Geist"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
