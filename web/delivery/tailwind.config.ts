import type { Config } from "tailwindcss";
const sharedConfig = require("../shared/tailwind.config.shared");

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
                primary: '#0e372b',
                surface: '#f1f5f9',
                text: '#0f172a',
                background: '#ffffff',
            },
        },
    },
    plugins: [],
};
export default config;
