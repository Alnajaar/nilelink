import { colors } from './colors';

export const gradients = Object.freeze({
    // Primary brand gradients
    brandPrimary: `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[900]} 100%)`,
    brandSecondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, #009B6E 100%)`,

    // Accent gradients for CTAs
    accent: `linear-gradient(135deg, ${colors.accent[500]} 0%, #F4A300 100%)`,

    // Decorative gradients (preserved from existing designs)
    purpleBlue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    skyBlue: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    pinkRed: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cyanic: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warmPeach: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    softPink: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',

    // Utility gradients
    success: `linear-gradient(135deg, ${colors.secondary[500]} 0%, #10b981 100%)`,
    danger: `linear-gradient(135deg, ${colors.danger[500]} 0%, #dc2626 100%)`,

    // Mesh backgrounds (subtle)
    meshLight: 'radial-gradient(at 40% 20%, rgba(10, 37, 64, 0.05) 0px, transparent 50%)',
    meshDark: 'radial-gradient(at 60% 80%, rgba(0, 195, 137, 0.1) 0px, transparent 50%)',
} as const);

export type GradientKey = keyof typeof gradients;
