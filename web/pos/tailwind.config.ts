import type { Config } from "tailwindcss";
const sharedConfig = require('../shared/tailwind.config.shared.js');

const config: Config = {
    presets: [sharedConfig],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../shared/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // POS Specific overrides that bridge v1 system to v2 variables
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',

                // Backgrounds
                background: {
                    DEFAULT: 'var(--color-bg-primary)',
                    primary: 'var(--color-bg-primary)',
                    secondary: 'var(--color-bg-secondary)',
                    tertiary: 'var(--color-bg-tertiary)',
                    card: 'var(--color-bg-card)',
                },

                // Surface & Panel colors for POS grid
                surface: {
                    DEFAULT: 'var(--color-bg-surface)',
                    card: 'var(--color-bg-card)',
                    raised: 'var(--color-bg-elevated)',
                },

                // Critical: Map text to shared variables for proper contrast on mesh-bg
                text: {
                    primary: 'var(--color-text-primary)',
                    secondary: 'var(--color-text-secondary)',
                    tertiary: 'var(--color-text-tertiary)',
                    muted: 'var(--color-text-muted)',
                },

                // Status colors
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                error: 'var(--color-error)',
                info: 'var(--color-info)',

                // Border colors
                border: {
                    DEFAULT: 'var(--color-border-default)',
                    subtle: 'var(--color-border-subtle)',
                    medium: 'var(--color-border-medium)',
                    strong: 'var(--color-border-strong)',
                },

                // POS Button Specifics (Legacy fix)
                'button-primary': 'var(--color-primary)',
                'button-secondary': 'transparent',
            },
            boxShadow: {
                'glow-primary': 'var(--shadow-glow-primary)',
                'glow-accent': 'var(--shadow-glow-accent)',
                'glow-success': 'var(--shadow-glow-success)',
                'glow-error': 'var(--shadow-glow-error)',
            }
        },
    },
    plugins: [],
};
export default config;
