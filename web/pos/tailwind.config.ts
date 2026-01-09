import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../shared/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // STRICT 4-COLOR SYSTEM - NO EXCEPTIONS
                primary: '#00C389',      // Core identity, buttons, active states
                surface: '#d2dad1',      // Cards, panels, forms, sidebars
                text: '#372c2d',         // All text, headings, numbers, icons
                background: '#f9f8f4',   // Page backgrounds, canvas

                // Component aliases using only the 4 colors
                'bg-body': '#f9f8f4',
                'bg-card': '#d2dad1',
                'bg-subtle': '#d2dad1',
                'text-primary': '#372c2d',
                'text-secondary': '#372c2d',
                'text-muted': '#372c2d',
                'border': '#d2dad1',
                'border-focus': '#00C389',

                // Button system
                'button-primary': '#00C389',
                'button-secondary': 'transparent',

                // Navigation
                'nav-bg': '#00C389',
                'nav-text': '#f9f8f4',
                'nav-active': '#d2dad1',

                // Status (no red/green)
                success: '#00C389',
                warning: '#372c2d',
                error: '#372c2d',
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
            },
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
            }
        },
    },
    plugins: [],
};
export default config;
