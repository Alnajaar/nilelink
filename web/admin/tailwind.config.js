/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../shared/components/**/*.{js,ts,jsx,tsx,mdx}",
        "../shared/providers/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: "var(--background)",
                    primary: "var(--color-bg-primary)",
                    secondary: "var(--color-bg-secondary)",
                    tertiary: "var(--color-bg-tertiary)",
                },
                foreground: "var(--foreground)",
                text: {
                    primary: "var(--color-text-primary)",
                    secondary: "var(--color-text-secondary)",
                    tertiary: "var(--color-text-tertiary)",
                    muted: "var(--color-text-muted)",
                },
                primary: {
                    DEFAULT: "#0051FF",
                    50: "#E6EEFF",
                    100: "#CCDCFF",
                    200: "#99B9FF",
                    300: "#6697FF",
                    400: "#3374FF",
                    500: "#0051FF",
                    600: "#0041CC",
                    700: "#003199",
                    800: "#002066",
                    900: "#001033",
                },
                accent: {
                    DEFAULT: "#00FFF5",
                    50: "#E6FFFE",
                    100: "#CCFFFD",
                    200: "#99FFFB",
                    300: "#66FFF9",
                    400: "#33FFF7",
                    500: "#00FFF5",
                    600: "#00CCC4",
                    700: "#009993",
                    800: "#006662",
                    900: "#003331",
                },
                secondary: {
                    DEFAULT: "#FFD666",
                    50: "#FFFBF0",
                    100: "#FFF7E0",
                    200: "#FFEFC2",
                    300: "#FFE7A3",
                    400: "#FFDF85",
                    500: "#FFD666",
                    600: "#CCAB52",
                    700: "#99803D",
                    800: "#665629",
                    900: "#332B14",
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
