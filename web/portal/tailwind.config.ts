import type { Config } from "tailwindcss";
const sharedConfig = require('../shared/tailwind.config.shared.js');

const config: Config = {
    presets: [sharedConfig],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../shared/components/**/*.{js,ts,jsx,tsx}", // Include shared components
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
export default config;
