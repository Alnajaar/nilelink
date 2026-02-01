import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/shared/**/*.{js,ts,jsx,tsx}",
        "../shared/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 🟦 Brand Palette - LOCKED COLORS
                primary: {
                    DEFAULT: '#0A2540',  // Deep Nile Blue
                    dark: '#06121f',
                    light: '#13304d',
                },
                secondary: {
                    DEFAULT: '#0FB9B1',  // Emerald Intelligence Green
                    dark: '#0a8f88',
                    light: '#3ad4cd',
                },
                accent: '#F5A623',  // Signal Amber - CTA ONLY

                // 🟩 Semantics - Tied to locked colors
                success: '#0FB9B1',  // Emerald Green
                warning: '#F5A623',  // Signal Amber
                error: '#D64545',   // Error Red
                info: '#0A2540',     // Deep Nile Blue

                // 🔵 Backgrounds (Dark-first design)
                background: {
                    DEFAULT: '#ffffff',   // Main background (light)
                    card: '#f8fafc',      // Surface/card
                    light: '#F5F7FA',     // Light mode
                },

                surface: '#f1f5f9',       // Surface color

                // 📝 Typography
                text: {
                    primary: '#E6EEF7',   // Main text (dark UI)
                    main: '#0f172a',      // Dark main text
                    muted: '#5e7387',     // Muted text
                    secondary: '#9FB3C8', // Secondary text
                    inverse: '#0A2540',   // Text on light backgrounds
                },

                // 🔳 Borders
                border: {
                    DEFAULT: '#1C3B5A',   // Main border
                    subtle: '#13283f',    // Subtle borders
                    strong: '#2d5b88',    // Strong borders
                },
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
