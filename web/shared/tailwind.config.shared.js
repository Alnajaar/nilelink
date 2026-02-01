/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // UNIFIED BRAND COLORS - NileLink Design System
        // Primary: NileLink Green (Trust, Growth, Professional)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00C389', // MAIN PRIMARY - NileLink Green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },

        // Secondary: Professional Blue (Trust, Technology, Professional)
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3B82F6', // MAIN SECONDARY - Professional Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },

        // Accent: Golden Yellow (Attention, Premium Features)
        accent: {
          50: '#fffdeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFD666', // MAIN ACCENT - Golden Yellow
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#78350f',
          950: '#451a03'
        },

        // Neutral Colors - High Contrast, Accessible
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712'
        },

        // Semantic Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },

        // Background Colors - Layered Design
        background: {
          DEFAULT: '#ffffff',
          primary: '#f9fafb',
          secondary: '#f3f4f6',
          tertiary: '#e5e7eb',
          accent: '#f0f7ff',
          dark: '#111827',
          'light': '#fafbfc'
        },

        // Surface Colors
        surface: {
          DEFAULT: '#ffffff',
          light: '#f9fafb',
          dark: '#f3f4f6',
          raised: '#ffffff',
          overlay: 'rgba(0, 0, 0, 0.5)',
          'subtle': '#f0f1f3'
        },

        // Text Colors - Proper Contrast
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          tertiary: '#9ca3af',
          light: '#d1d5db',
          muted: '#9ca3af',
          inverse: '#ffffff'
        },

        // Border Colors
        border: {
          DEFAULT: '#e5e7eb',
          light: '#f3f4f6',
          subtle: '#d1d5db',
          strong: '#9ca3af',
          dark: '#4b5563'
        },

        // UNIFIED GRADIENTS - Using Design System Colors
        'gradient': {
          'primary': 'linear-gradient(135deg, #00C389 0%, #059669 100%)',
          'secondary': 'linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)',
          'accent': 'linear-gradient(135deg, #FFD666 0%, #f59e0b 100%)',
          'success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          'warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          'error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        }
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900'
      },

      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem'
      },

      borderRadius: {
        none: '0',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px'
      },

      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        none: 'none'
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px'
      },

      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out'
      },

      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },

      transitionDuration: {
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms'
      }
    }
  },
  plugins: []
}
