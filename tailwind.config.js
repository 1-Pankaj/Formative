/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E04418',
          hover: '#F25224',
          active: '#C7380F',
          subtle: 'rgba(224, 68, 24, 0.12)',
          border: 'rgba(224, 68, 24, 0.28)',
          glow: 'rgba(224, 68, 24, 0.35)',
        },
        espresso: {
          900: '#161110',
          800: '#1E1513',
          700: '#2A1D1A',
          600: '#3D2823',
        },
        formative: {
          bg: '#0E0F12',
          surface: '#15171D',
          card: '#1A1C24',
          hover: '#222530',
          border: '#272A36',
          borderSubtle: '#1F222C',
        },
        ink: {
          primary: '#FFFFFF',
          secondary: '#E2E4E9',
          muted: '#9A9DA8',
          faint: '#626572',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'brand-glow': '0 0 20px -2px rgba(224, 68, 24, 0.3)',
        'panel': '0 8px 32px -4px rgba(0, 0, 0, 0.65)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
