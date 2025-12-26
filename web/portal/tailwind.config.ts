import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/shared/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                nile: {
                    dark: "#0c4a6e",
                    deep: "#020617",
                    emerald: "#10b981",
                    silver: "#f8fafc",
                },
                // Shared colors from globals.shared.css
                primary: {
                    dark: 'var(--color-primary-dark)',
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    lighter: 'var(--color-primary-lighter)',
                },
                secondary: {
                    soft: 'var(--color-secondary-soft)',
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary-dark)',
                    light: 'var(--color-secondary-light)',
                },
                background: {
                    light: 'var(--color-bg-light)',
                    DEFAULT: 'var(--color-bg)',
                    white: 'var(--color-bg-white)',
                    cream: 'var(--color-bg-cream)',
                },
                accent: {
                    dark: 'var(--color-accent-dark)',
                    DEFAULT: 'var(--color-accent)',
                    light: 'var(--color-accent-light)',
                },
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                error: 'var(--color-error)',
                info: 'var(--color-info)',
                text: {
                    primary: 'var(--color-text-primary)',
                    secondary: 'var(--color-text-secondary)',
                    tertiary: 'var(--color-text-tertiary)',
                    disabled: 'var(--color-text-disabled)',
                    inverse: 'var(--color-text-inverse)',
                },
                border: {
                    light: 'var(--color-border-light)',
                    DEFAULT: 'var(--color-border)',
                    dark: 'var(--color-border-dark)',
                },
                state: {
                    synced: 'var(--color-state-synced)',
                    pending: 'var(--color-state-pending)',
                    offline: 'var(--color-state-offline)',
                    verifying: 'var(--color-state-verifying)',
                },
                // Background colors for badges
                'success-bg': '#e6f7f0',
                'warning-bg': '#fef3c7',
                'error-bg': '#fef2f2',
                'info-bg': '#e0f2fe',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
            }
        },
    },
    plugins: [],
};
export default config;
