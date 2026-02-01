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
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme.extend,
      colors: {
        ...sharedConfig.theme.extend.colors,
        pos: {
          bg: {
            primary: '#0F172A',
            secondary: '#1E293B',
            tertiary: '#334155',
          },
          card: {
            bg: '#1E293B',
            border: '#334155',
          },
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
            muted: '#64748B',
            inverse: '#0F172A',
          },
          brand: {
            primary: '#00C389',
            secondary: '#3B82F6',
          }
        }
      },
      spacing: {
        ...sharedConfig.theme.extend.spacing,
        'touch-target': '48px',
      }
    }
  }
};