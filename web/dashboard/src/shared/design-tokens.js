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
    // Primary palette - Earthy, trustworthy, economic
    primary: {
        dark: '#0e372b',      // Deep forest green - primary brand color
        DEFAULT: '#0e372b',
        light: '#1a5240',     // Lighter variant for hover states
        lighter: '#267055',   // Even lighter for backgrounds
    },

    // Secondary palette - Soft, neutral
    secondary: {
        soft: '#d2dad1',      // Soft sage - secondary brand color
        DEFAULT: '#d2dad1',
        dark: '#b8c2b7',      // Darker variant
        light: '#e5ebe4',     // Lighter variant
    },

    // Background palette
    background: {
        light: '#f9f8f4',     // Warm off-white - main background
        DEFAULT: '#f9f8f4',
        white: '#ffffff',     // Pure white for cards
        cream: '#fdfcf8',     // Subtle cream variant
    },

    // Accent palette
    accent: {
        dark: '#372c2d',      // Deep brown - accent/contrast
        DEFAULT: '#372c2d',
        light: '#4d3f40',     // Lighter variant
    },

    // Semantic colors - derived from palette
    success: {
        DEFAULT: '#0e372b',   // Use primary dark for success
        light: '#1a5240',
        bg: '#e8f5f0',
    },

    warning: {
        DEFAULT: '#8b6914',   // Earthy gold
        light: '#a68419',
        bg: '#fef9e7',
    },

    error: {
        DEFAULT: '#8b2c2c',   // Earthy red
        light: '#a63838',
        bg: '#fdeaea',
    },

    info: {
        DEFAULT: '#2c5f7b',   // Earthy blue
        light: '#3a7a9e',
        bg: '#e8f4f8',
    },

    // Text colors
    text: {
        primary: '#1a1a1a',   // Almost black
        secondary: '#4a4a4a', // Dark gray
        tertiary: '#6a6a6a',  // Medium gray
        disabled: '#9a9a9a',  // Light gray
        inverse: '#ffffff',   // White text
    },

    // Border colors
    border: {
        light: '#e5e5e5',
        DEFAULT: '#d0d0d0',
        dark: '#a0a0a0',
    },

    // State colors for sync status
    state: {
        synced: '#0e372b',    // Green - fully synced
        pending: '#8b6914',   // Gold - pending sync
        offline: '#8b2c2c',   // Red - offline
        verifying: '#2c5f7b', // Blue - verifying
    },
};

export const typography = {
    // Font families
    fontFamily: {
        sans: [
            'Inter',
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
            'Menlo',
            'Monaco',
            'Consolas',
            'Liberation Mono',
            'Courier New',
            'monospace',
        ],
    },

    // Font sizes (rem-based for accessibility)
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        '5xl': ['3rem', { lineHeight: '1' }],         // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    },

    // Font weights
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
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
    sm: '0 1px 2px 0 rgba(14, 55, 43, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(14, 55, 43, 0.1), 0 1px 2px 0 rgba(14, 55, 43, 0.06)',
    md: '0 4px 6px -1px rgba(14, 55, 43, 0.1), 0 2px 4px -1px rgba(14, 55, 43, 0.06)',
    lg: '0 10px 15px -3px rgba(14, 55, 43, 0.1), 0 4px 6px -2px rgba(14, 55, 43, 0.05)',
    xl: '0 20px 25px -5px rgba(14, 55, 43, 0.1), 0 10px 10px -5px rgba(14, 55, 43, 0.04)',
    '2xl': '0 25px 50px -12px rgba(14, 55, 43, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(14, 55, 43, 0.06)',
    none: 'none',
};

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
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
};
