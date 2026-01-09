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
                // 🟦 Brand Palette - LOCKED COLORS
                primary: {
                    DEFAULT: '#0A2540',  // Deep Navy Blue
                    dark: '#071A2E',
                    light: '#0D2F52',
                },
                secondary: {
                    DEFAULT: '#00C389',  // Emerald Teal
                    dark: '#009B6E',
                    light: '#00E4A4',
                },
                accent: '#F5B301',  // Soft Gold - CTA ONLY
                neutral: '#F7F9FC', // Off-White

                // 🟩 Semantics - Tied to locked colors
                success: '#00C389',  // Emerald Teal
                warning: '#F5B301',  // Soft Gold
                error: '#4A1C1C',   // Dark red derived from navy
                info: '#0A2540',     // Deep Navy Blue

                // 🔵 Backgrounds
                background: {
                    DEFAULT: '#0A2540',   // Main app background
                    card: '#F7F9FC',      // Cards / panels
                    light: '#F7F9FC',     // Light sections
                },

                // 📝 Typography
                text: {
                    primary: '#0A2540',   // Text on light
                    secondary: 'rgba(10, 37, 64, 0.7)', // Secondary
                    muted: 'rgba(10, 37, 64, 0.5)',     // Muted
                    inverse: '#F7F9FC',   // Text on dark
                },

                // 🔳 Borders
                border: {
                    DEFAULT: 'rgba(10, 37, 64, 0.2)',   // Subtle
                    subtle: 'rgba(10, 37, 64, 0.1)',    // Subtle
                    strong: 'rgba(10, 37, 64, 0.4)',    // Strong
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
