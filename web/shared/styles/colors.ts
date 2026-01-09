/**
 * NileLink Locked Color System
 * All colors are locked and centralized for consistency
 * DO NOT modify these values without explicit approval
 */

export const colors = {
  // Primary Brand Color - Deep Blue
  primary: {
    DEFAULT: '#0A2540',
    light: '#1a3a5a',
    dark: '#051a2f',
    50: '#f0f4f8',
    100: '#e0e8f0',
    200: '#c1d1e0',
    300: '#a2bbd0',
    400: '#5a7fa0',
    500: '#0A2540',
    600: '#092237',
    700: '#081d2f',
    800: '#061727',
    900: '#04101f',
  },

  // Secondary Brand Color - Teal Green
  secondary: {
    DEFAULT: '#00C389',
    light: '#00e6a8',
    dark: '#009d6b',
    50: '#f0fdf8',
    100: '#e0fbf1',
    200: '#c0f6e3',
    300: '#a0f2d6',
    400: '#40eab9',
    500: '#00C389',
    600: '#00a870',
    700: '#008d5c',
    800: '#007249',
    900: '#005735',
  },

  // Accent Color - Gold
  accent: {
    DEFAULT: '#F5B301',
    light: '#f7c933',
    dark: '#d49800',
    50: '#fffbf0',
    100: '#fff7e0',
    200: '#ffefc1',
    300: '#ffe7a2',
    400: '#ffcf63',
    500: '#F5B301',
    600: '#d99a00',
    700: '#b88100',
    800: '#976700',
    900: '#764d00',
  },

  // Neutral Colors - Off-white/Gray scale
  neutral: {
    50: '#F7F9FC',
    100: '#f0f1f3',
    200: '#e8eaed',
    300: '#e0e2e7',
    400: '#d0d3dc',
    500: '#b8bcc6',
    600: '#909399',
    700: '#68707a',
    800: '#40484f',
    900: '#1a1e24',
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background Colors
  background: {
    DEFAULT: '#F7F9FC',
    light: '#ffffff',
    dark: '#f0f1f3',
    surface: '#ffffff',
  },

  // Text Colors
  text: {
    primary: '#1a1e24',
    secondary: '#68707a',
    light: '#b8bcc6',
    muted: '#909399',
    white: '#ffffff',
  },

  // Border Colors
  border: {
    DEFAULT: '#e8eaed',
    light: '#f0f1f3',
    dark: '#b8bcc6',
  },
};

/**
 * TailwindCSS Configuration Extension
 * Add to tailwind.config.ts under theme.extend.colors
 */
export const tailwindColorConfig = {
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  neutral: colors.neutral,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  background: colors.background,
  text: colors.text,
  border: colors.border,
};

/**
 * CSS Variables for Direct Usage
 * Can be applied to :root in globals.css
 */
export const getCSSVariables = () => `
:root {
  --color-primary: ${colors.primary.DEFAULT};
  --color-primary-dark: ${colors.primary.dark};
  --color-primary-light: ${colors.primary.light};
  
  --color-secondary: ${colors.secondary.DEFAULT};
  --color-secondary-dark: ${colors.secondary.dark};
  --color-secondary-light: ${colors.secondary.light};
  
  --color-accent: ${colors.accent.DEFAULT};
  --color-accent-dark: ${colors.accent.dark};
  --color-accent-light: ${colors.accent.light};
  
  --color-background: ${colors.background.DEFAULT};
  --color-text-primary: ${colors.text.primary};
  --color-text-secondary: ${colors.text.secondary};
  
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-error: ${colors.error};
  --color-info: ${colors.info};
}
`;

/**
 * Helper function to get color with opacity
 * Usage: getColorWithOpacity('primary', 0.5) -> rgba(10, 37, 64, 0.5)
 */
export const getColorWithOpacity = (
  colorName: keyof typeof colors,
  opacity: number
): string => {
  const hex = colors[colorName as keyof typeof colors] as any;
  const colorValue = typeof hex === 'string' ? hex : hex.DEFAULT;
  
  // Convert hex to RGB
  const r = parseInt(colorValue.slice(1, 3), 16);
  const g = parseInt(colorValue.slice(3, 5), 16);
  const b = parseInt(colorValue.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Color Constants for Components
 * Use these for common component patterns
 */
export const componentColors = {
  button: {
    primary: colors.primary.DEFAULT,
    primaryHover: colors.primary.dark,
    secondary: colors.secondary.DEFAULT,
    secondaryHover: colors.secondary.dark,
    accent: colors.accent.DEFAULT,
    accentHover: colors.accent.dark,
    disabled: colors.neutral[300],
  },
  input: {
    border: colors.neutral[200],
    focusBorder: colors.primary.DEFAULT,
    background: colors.background.light,
    placeholder: colors.text.muted,
  },
  card: {
    background: colors.background.light,
    border: colors.neutral[200],
    shadow: colors.neutral[900],
  },
  gradient: {
    primary: `linear-gradient(135deg, ${colors.primary.DEFAULT} 0%, ${colors.secondary.DEFAULT} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary.DEFAULT} 0%, ${colors.primary.DEFAULT} 100%)`,
    accent: `linear-gradient(135deg, ${colors.accent.DEFAULT} 0%, ${colors.accent.light} 100%)`,
  },
};

export default colors;
