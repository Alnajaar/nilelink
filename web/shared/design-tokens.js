/**
 * NileLink Design Tokens
 * Master design system for the entire NileLink ecosystem
 * 
 * These tokens define the visual language used across all applications:
 * - POS System
 * - Delivery Network
 * - Customer App
 * - Supplier Hub
 * - Investor Dashboard
 * - Portal
 */

export const colors = {
    // Primary Brand Colors (WCAG AA Compliant)
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Main primary - meets AA contrast
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49',
        DEFAULT: '#0ea5e9',
        dark: '#0284c7',
        light: '#38bdf8',
    },

    // Secondary Colors
    secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
        DEFAULT: '#64748b',
        dark: '#475569',
        light: '#94a3b8',
    },

    // Success States
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
        900: '#14532d',
        950: '#052e16',
        DEFAULT: '#22c55e',
        bg: '#f0fdf4',
    },

    // Warning States
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
        900: '#78350f',
        950: '#451a03',
        DEFAULT: '#f59e0b',
        bg: '#fffbeb',
    },

    // Error States
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
        900: '#7f1d1d',
        950: '#450a0a',
        DEFAULT: '#ef4444',
        bg: '#fef2f2',
    },

    // Neutral Grays
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
        950: '#030712',
    },

    // Legacy support
    neutral: '#f8fafc',
    accent: '#f59e0b',

    background: {
        DEFAULT: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        overlay: 'rgba(0, 0, 0, 0.5)',
        light: '#f8fafc',
        card: '#ffffff',
    },

    // Text Colors (WCAG AA Compliant)
    text: {
        primary: '#0f172a',     // 21:1 contrast on white
        secondary: '#475569',   // 8.6:1 contrast on white
        tertiary: '#64748b',    // 6.1:1 contrast on white
        muted: '#64748b',
        inverse: '#ffffff',     // 21:1 contrast on dark
        error: '#dc2626',
        disabled: '#9ca3af',
    },

    // Border Colors
    border: {
        DEFAULT: '#e2e8f0',
        subtle: '#f1f5f9',
        medium: '#cbd5e1',
        strong: '#94a3b8',
    },

    // Interactive States
    hover: {
        primary: '#0284c7',
        secondary: '#334155',
        danger: '#dc2626',
    },

    // Focus States (WCAG AA compliant)
    focus: {
        ring: '#0ea5e9',
        ringOffset: '#ffffff',
    },

    // Info States
    info: {
        DEFAULT: '#0ea5e9',
        bg: '#f0f9ff',
    },
};

export const typography = {
    // Font families (accessibility-first)
    fontFamily: {
        sans: [
            'Inter',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
        ],
        mono: [
            'JetBrains Mono',
            'SF Mono',
            'Monaco',
            'Inconsolata',
            'Fira Code',
            'Droid Sans Mono',
            'Source Code Pro',
            'monospace',
        ],
        arabic: [
            'Noto Sans Arabic',
            'Tajawal',
            'Cairo',
            'Amiri',
            'Arial',
            'sans-serif',
        ],
    },

    // Font sizes (rem-based, WCAG AA compliant)
    // Fluid Typography (Clamp: Min -> Preferred -> Max)
    fontSize: {
        xs: ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1rem' }],      // 12px -> 14px
        sm: ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.25rem' }],     // 14px -> 16px
        base: ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.5rem' }],    // 16px -> 18px
        lg: ['clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)', { lineHeight: '1.75rem' }], // 18px -> 20px
        xl: ['clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)', { lineHeight: '1.75rem' }],     // 20px -> 24px
        '2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '2rem' }],           // 24px -> 32px
        '3xl': ['clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem)', { lineHeight: '2.25rem' }], // 30px -> 40px
        '4xl': ['clamp(2.25rem, 1.8rem + 2.25vw, 3.5rem)', { lineHeight: '2.5rem' }],   // 36px -> 56px
        '5xl': ['clamp(3rem, 2.5rem + 2.5vw, 4.5rem)', { lineHeight: '1' }],            // 48px -> 72px
        '6xl': ['clamp(3.75rem, 3rem + 3.75vw, 6rem)', { lineHeight: '1' }],            // 60px -> 96px
    },

    // Font weights (accessibility considerations)
    fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },

    // Line heights for better readability
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },

    // Letter spacing
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },
};

export const spacing = {
    // 4px base grid system
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
};

export const borderRadius = {
    none: '0',
    sm: '0.25rem',   // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
};

export const shadows = {
    // Subtle elevation system
    sm: '0 1px 2px 0 rgba(10, 37, 64, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(10, 37, 64, 0.1), 0 1px 2px 0 rgba(10, 37, 64, 0.06)',
    md: '0 4px 6px -1px rgba(10, 37, 64, 0.1), 0 2px 4px -1px rgba(10, 37, 64, 0.06)',
    lg: '0 10px 15px -3px rgba(10, 37, 64, 0.1), 0 4px 6px -2px rgba(10, 37, 64, 0.05)',
    xl: '0 20px 25px -5px rgba(10, 37, 64, 0.1), 0 10px 10px -5px rgba(10, 37, 64, 0.04)',
    '2xl': '0 25px 50px -12px rgba(10, 37, 64, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(10, 37, 64, 0.06)',
    none: 'none',
};

export const breakpoints = {
    xs: '375px',    // Small Mobile
    sm: '640px',    // Mobile
    md: '768px',    // Tablet Portrait
    lg: '1024px',   // Tablet Landscape
    xl: '1280px',   // Laptop
    '2xl': '1536px', // Desktop
    '3xl': '1920px', // Ultra-Wide / 4K
};

export const gradients = {
    'brand-primary': 'linear-gradient(135deg, #0A2540 0%, #0A2540 100%)',
    'brand-secondary': 'linear-gradient(135deg, #00C389 0%, #009B6E 100%)',
    'accent': 'linear-gradient(135deg, #F5B301 0%, #F4A300 100%)',
    'mesh-light': 'radial-gradient(at 40% 20%, rgba(10, 37, 64, 0.05) 0px, transparent 50%)',
    'mesh-dark': 'radial-gradient(at 60% 80%, rgba(0, 195, 137, 0.1) 0px, transparent 50%)',
};

export const glass = {
    'v1': {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    'v2': {
        background: 'rgba(10, 37, 64, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    'v3': {
        background: 'rgba(0, 195, 137, 0.05)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(0, 195, 137, 0.2)',
    }
};

export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
};

export const transitions = {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    breakpoints,
    zIndex,
    transitions,
    gradients,
    glass,
};
