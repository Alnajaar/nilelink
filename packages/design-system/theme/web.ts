import { colors } from '../tokens/colors';

export const webTheme = {
    colors,
    background: colors.primary[900],
    surface: colors.neutral[50],
    text: {
        primary: colors.neutral[900],
        inverse: '#FFFFFF',
        muted: 'rgba(11, 31, 51, 0.6)',
    },
    button: {
        primary: {
            bg: colors.secondary[500],
            text: colors.primary[900], // Navy text on Emerald
        },
        secondary: {
            border: colors.secondary[500],
            text: colors.secondary[500],
        },
        danger: {
            bg: colors.danger[500],
            text: '#FFFFFF',
        }
    },
} as const;

export type WebTheme = typeof webTheme;
