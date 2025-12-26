/**
 * Shared Tailwind Configuration for NileLink Ecosystem
 * 
 * This configuration is imported by all NileLink applications to ensure
 * consistent styling across the entire platform.
 */

const designTokens = require('./design-tokens.js').default;

module.exports = {
    theme: {
        extend: {
            colors: {
                // Brand Palette
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    dark: 'var(--color-primary-dark)',
                    light: 'var(--color-primary-light)',
                    surface: 'var(--color-primary-surface)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary-dark)',
                    light: 'var(--color-secondary-light)',
                },
                accent: 'var(--color-accent)',

                // Semantics
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                danger: 'var(--color-danger)',
                info: 'var(--color-info)',

                // Backgrounds
                background: {
                    DEFAULT: 'var(--color-bg-body)',
                    card: 'var(--color-bg-card)',
                    subtle: 'var(--color-bg-subtle)',
                },

                // Typography
                text: {
                    main: 'var(--color-text-main)',
                    muted: 'var(--color-text-muted)',
                    subtle: 'var(--color-text-subtle)',
                    inverse: 'var(--color-text-on-primary)',
                },

                // Borders
                border: {
                    DEFAULT: 'var(--color-border)',
                    subtle: 'var(--color-border-subtle)',
                    strong: 'var(--color-border-strong)',
                },
            },

            fontFamily: designTokens.typography.fontFamily,
            fontSize: designTokens.typography.fontSize,
            fontWeight: designTokens.typography.fontWeight,

            spacing: designTokens.spacing,
            borderRadius: designTokens.borderRadius,
            boxShadow: designTokens.shadows,

            zIndex: designTokens.zIndex,

            transitionDuration: {
                fast: '150ms',
                DEFAULT: '200ms',
                slow: '300ms',
            },

            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },

            // Custom animations
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                'slide-in-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-down': {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'pulse-subtle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                'spin-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
            },

            animation: {
                'fade-in': 'fade-in 200ms ease-out',
                'fade-out': 'fade-out 200ms ease-out',
                'slide-in-up': 'slide-in-up 200ms ease-out',
                'slide-in-down': 'slide-in-down 200ms ease-out',
                'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin-slow 3s linear infinite',
            },
        },
    },

    plugins: [],
};
