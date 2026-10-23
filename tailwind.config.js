/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          DEFAULT: '#E04418',
          hover: '#F25224',
          active: '#C7380F',
          subtle: 'rgba(224, 68, 24, 0.12)',
          border: 'rgba(224, 68, 24, 0.28)',
          glow: 'rgba(224, 68, 24, 0.35)',
        },
        
        // Accent colors
        accent: {
          DEFAULT: '#06B6D4',
          hover: '#22D3EE',
          active: '#0891B2',
        },
        
        // Semantic colors for dark mode
        dark: {
          background: '#09090B',
          surface: '#121215',
          surfaceHover: '#18181C',
          surfaceActive: '#222530',
          border: '#27272A',
          borderStrong: '#3F3F46',
          borderSubtle: '#1F1F23',
          text: {
            primary: '#FAFAFA',
            secondary: '#A1A1AA',
            tertiary: '#71717A',
            muted: '#52525B',
            inverse: '#09090B',
          },
        },
        
        // Semantic colors for light mode
        light: {
          background: '#FFFFFF',
          surface: '#F8FAFC',
          surfaceHover: '#F1F5F9',
          surfaceActive: '#E2E8F0',
          border: '#E2E8F0',
          borderStrong: '#CBD5E1',
          borderSubtle: '#F1F5F9',
          text: {
            primary: '#0F172A',
            secondary: '#475569',
            tertiary: '#94A3B8',
            muted: '#CBD5E1',
            inverse: '#FFFFFF',
          },
        },
        
        // Node category colors
        node: {
          frontend: {
            bg: 'rgba(59, 130, 246, 0.15)',
            text: '#3B82F6',
            border: 'rgba(59, 130, 246, 0.3)',
          },
          gateway: {
            bg: 'rgba(168, 85, 247, 0.15)',
            text: '#A855F7',
            border: 'rgba(168, 85, 247, 0.3)',
          },
          backend: {
            bg: 'rgba(16, 185, 129, 0.15)',
            text: '#10B981',
            border: 'rgba(16, 185, 129, 0.3)',
          },
          database: {
            bg: 'rgba(245, 158, 11, 0.15)',
            text: '#F59E0B',
            border: 'rgba(245, 158, 11, 0.3)',
          },
          cache: {
            bg: 'rgba(6, 182, 212, 0.15)',
            text: '#06B6D4',
            border: 'rgba(6, 182, 212, 0.3)',
          },
          queue: {
            bg: 'rgba(236, 72, 153, 0.15)',
            text: '#EC4899',
            border: 'rgba(236, 72, 153, 0.3)',
          },
          worker: {
            bg: 'rgba(99, 102, 241, 0.15)',
            text: '#6366F1',
            border: 'rgba(99, 102, 241, 0.3)',
          },
          ai: {
            bg: 'rgba(251, 191, 36, 0.15)',
            text: '#FBBF24',
            border: 'rgba(251, 191, 36, 0.3)',
          },
          auth: {
            bg: 'rgba(239, 68, 68, 0.15)',
            text: '#EF4444',
            border: 'rgba(239, 68, 68, 0.3)',
          },
          note: {
            bg: 'rgba(113, 113, 122, 0.15)',
            text: '#94A3B8',
            border: 'rgba(113, 113, 122, 0.3)',
          },
        },
        
        // Status colors
        status: {
          idle: '#94A3B8',
          running: '#F59E0B',
          done: '#10B981',
          error: '#EF4444',
          blocked: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'brand-glow': '0 0 20px -2px rgba(224, 68, 24, 0.3)',
        'panel': '0 8px 32px -4px rgba(0, 0, 0, 0.65)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'node': '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        'node-hover': '0 8px 20px -4px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
