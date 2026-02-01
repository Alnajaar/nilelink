/**
 * NileLink v2.0 Design Tokens - The Future of Fintech Design
 * Premium Blockchain Ecosystem Design System
 * 
 * This is the single source of truth for the entire NileLink platform.
 * Every app, every component, every interaction follows these tokens.
 * 
 * Design Philosophy:
 * - Unified design system across all NileLink apps
 * - Clean, professional, light-first aesthetic
 * - High contrast and accessibility
 * - Consistent color roles: Primary (Green), Secondary (Blue), Accent (Gold)
 * - Touch-optimized for POS, mobile-first for apps
 * - Future-proof and scalable
 */

export const colors = {
    // PRIMARY - NileLink Green (Trust, Growth, Ecosystem)
    primary: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#00C389',  // NileLink signature green
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
        950: '#022C22',
        DEFAULT: '#00C389',
        dark: '#047857',
        light: '#34D399',
    },

    // SECONDARY - Professional Blue (Actions, Navigation)
    secondary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',  // Professional blue
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
        950: '#172554',
        DEFAULT: '#3B82F6',
        dark: '#1D4ED8',
        light: '#60A5FA',
    },

    // ACCENT - Premium Gold (Highlights, Premium Features)
    accent: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#FFD666',  // Premium gold
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
        950: '#451A03',
        DEFAULT: '#FFD666',
        dark: '#B45309',
        light: '#FBBF24',
    },

    // Success - Emerald Green
    success: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
        950: '#022C22',
        DEFAULT: '#10B981',
        bg: '#ECFDF5',
    },

    // Warning - Vibrant Amber
    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
        950: '#451A03',
        DEFAULT: '#F59E0B',
        bg: '#FFFBEB',
    },

    // Error - Neon Red
    error: {
        50: '#FFF1F2',
        100: '#FFE4E6',
        200: '#FECDD3',
        300: '#FDA4AF',
        400: '#FB7185',
        500: '#F43F5E',
        600: '#E11D48',
        700: '#BE123C',
        800: '#9F1239',
        900: '#881337',
        950: '#4C0519',
        DEFAULT: '#F43F5E',
        bg: '#FFF1F2',
    },

    // Info - Electric Blue
    info: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
        950: '#172554',
        DEFAULT: '#3B82F6',
        bg: '#EFF6FF',
    },

    // Neutral Grays - Premium Dark Palette
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#030712',
    },

    // Background - Clean Light System
    background: {
        DEFAULT: '#FFFFFF',      // Pure white
        secondary: '#F9FAFB',    // Light background
        tertiary: '#F3F4F6',     // Surface background
        overlay: 'rgba(0, 0, 0, 0.5)',
        light: '#F9FAFB',
        card: '#FFFFFF',
        elevated: '#F9FAFB',
        surface: '#F3F4F6',      // Subtle variation
    },

    // Text - High Contrast for Light Theme
    text: {
        primary: '#1F2937',      // Dark slate - headings
        secondary: '#6B7280',    // Medium gray - body
        tertiary: '#9CA3AF',     // Light gray - labels
        muted: '#D1D5DB',        // Lightest - captions
        inverse: '#FFFFFF',      // On dark backgrounds
        error: '#EF4444',
        success: '#10B981',
        disabled: '#9CA3AF',
    },

    // Border - Subtle Gray System
    border: {
        DEFAULT: '#E5E7EB',
        subtle: '#F3F4F6',
        medium: '#D1D5DB',
        strong: '#9CA3AF',
        accent: '#FFD666',
        primary: '#00C389',
    },

    // Interactive States
    hover: {
        primary: '#0041CC',
        secondary: '#374151',
        danger: '#E11D48',
        accent: '#00CCC4',
    },

    // Focus States (WCAG AAA compliant)
    focus: {
        ring: '#00FFF5',
        ringOffset: '#0A0E14',
    },

    // Glassmorphism surfaces
    glass: {
        primary: 'rgba(17, 24, 39, 0.7)',
        secondary: 'rgba(31, 41, 55, 0.6)',
        accent: 'rgba(0, 255, 245, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
    },
};

export const typography = {
    // Modern Font Stack - Space Grotesk + Inter
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
        display: [
            'Space Grotesk',
            'Inter',
            'system-ui',
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
    },

    // Fluid Typography Scale - Optimized for Dark Theme
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.05em' }],       // 12px - Labels
        sm: ['0.875rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],     // 14px - Small text
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],             // 16px - Body
        lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],     // 18px - Large body
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],     // 20px - Subheading
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],    // 24px - H3
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }], // 30px - H2
        '4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],   // 36px - H1
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.035em' }],       // 48px - Display
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],     // 60px - Hero
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.045em' }],     // 72px - Large hero
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],        // 96px - Massive
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.055em' }],       // 128px - Ultra
    },

    // Font Weights - Full Range
    fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },

    // Line Heights
    lineHeight: {
        none: '1',
        tight: '1.1',
        snug: '1.2',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
    },

    // Letter Spacing
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
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
};

export const borderRadius = {
    none: '0',
    sm: '0.25rem',      // 4px
    DEFAULT: '0.5rem',  // 8px
    md: '0.625rem',     // 10px
    lg: '0.75rem',      // 12px
    xl: '1rem',         // 16px
    '2xl': '1.25rem',   // 20px
    '3xl': '1.5rem',    // 24px
    full: '9999px',
};

export const shadows = {
    // Light theme optimized shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',

    // Subtle glow effects for highlights
    'glow-primary': '0 0 20px rgba(0, 194, 137, 0.3), 0 0 40px rgba(0, 194, 137, 0.2)',
    'glow-accent': '0 0 20px rgba(255, 214, 102, 0.3), 0 0 40px rgba(255, 214, 102, 0.2)',
    'glow-success': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)',
    'glow-error': '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.2)',
};

export const breakpoints = {
    xs: '375px',     // Mobile S
    sm: '640px',     // Mobile L
    md: '768px',     // Tablet
    lg: '1024px',    // Laptop
    xl: '1280px',    // Desktop
    '2xl': '1536px', // Large Desktop
    '3xl': '1920px', // 4K
};

export const gradients = {
    // Primary gradients
    'primary': 'linear-gradient(135deg, #00C389 0%, #047857 100%)',
    'primary-radial': 'radial-gradient(circle at top right, #0051FF 0%, #001033 100%)',

    // Accent gradients
    'accent': 'linear-gradient(135deg, #FFD666 0%, #B45309 100%)',
    'accent-radial': 'radial-gradient(circle at bottom left, #00FFF5 0%, #003331 100%)',

    // Premium gold
    'gold': 'linear-gradient(135deg, #FFD666 0%, #99803D 100%)',

    // Mesh backgrounds
    'mesh-primary': 'radial-gradient(at 30% 20%, rgba(0, 81, 255, 0.15) 0px, transparent 50%), radial-gradient(at 70% 80%, rgba(0, 255, 245, 0.1) 0px, transparent 50%)',
    'mesh-dark': 'radial-gradient(at 40% 60%, rgba(0, 81, 255, 0.08) 0px, transparent 50%)',
    'mesh-glow': 'radial-gradient(at 50% 50%, rgba(0, 255, 245, 0.12) 0px, transparent 60%)',

    // Glass effects
    'glass-primary': 'linear-gradient(135deg, rgba(17, 24, 39, 0.7) 0%, rgba(31, 41, 55, 0.5) 100%)',
    'glass-accent': 'linear-gradient(135deg, rgba(0, 255, 245, 0.05) 0%, rgba(0, 81, 255, 0.05) 100%)',
};

export const animations = {
    // Durations
    duration: {
        fast: '150ms',
        DEFAULT: '250ms',
        slow: '350ms',
        slower: '500ms',
    },

    // Easing functions
    easing: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
};

export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    breakpoints,
    gradients,
    animations,
    zIndex,
};