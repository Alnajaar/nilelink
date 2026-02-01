/**
 * NileLink Customer App - Premium Design Tokens
 * Central source of truth for all design values
 */

// Color Palette
export const colors = {
  // Primary Brand
  primary: {
    50: '#f0f7ff',
    100: '#e0edff',
    200: '#c7e0ff',
    300: '#a3ceff',
    400: '#76b7ff',
    500: '#4a9eff',
    600: '#2e87ff',
    700: '#0d5edb',
    800: '#0a47b0',
    900: '#0a3481',
  },

  // Secondary 
  secondary: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Accent
  accent: {
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
  },

  // Neutral
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
  },

  // Semantic
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'Poppins, system-ui, -apple-system, sans-serif',
    mono: 'Fira Code, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing Scale
export const spacing = {
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
  32: '8rem',
} as const;

// Border Radius
export const borderRadius = {
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.08)',
  'elevation-2': '0 4px 16px rgba(0, 0, 0, 0.12)',
  'elevation-3': '0 8px 32px rgba(0, 0, 0, 0.16)',
} as const;

// Transitions
export const transitions = {
  fast: '150ms ease-out',
  base: '200ms ease-out',
  slow: '300ms ease-out',
  slower: '500ms ease-out',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
