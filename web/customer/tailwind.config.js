/** @type {import('tailwindcss').Config} */
const sharedConfig = require('../shared/tailwind.config.shared');

module.exports = {
  ...sharedConfig,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx}'
  ],
};