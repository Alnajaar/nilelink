/**
 * Unified NileLink Design System Theme Constants
 * Uses centralized design tokens for consistency across all apps
 * Version: 3.0 (Unified)
 */

import designTokens from '@shared/design-tokens';

export const COLORS = {
  // Unified Color System - Using shared design tokens
  primary: designTokens.colors.primary,
  secondary: designTokens.colors.secondary,
  accent: designTokens.colors.accent,

  // Status Colors (Semantic)
  status: {
    success: designTokens.colors.success.DEFAULT,
    warning: designTokens.colors.warning.DEFAULT,
    error: designTokens.colors.error.DEFAULT,
    info: designTokens.colors.info.DEFAULT,
    pending: designTokens.colors.gray[500],
  },

  // Text Colors
  text: designTokens.colors.text,

  // Background Colors
  background: designTokens.colors.background,

  // Border Colors
  border: designTokens.colors.border,

  // Utility - Using unified shadows
  overlay: designTokens.colors.background.overlay,
  shadowLight: designTokens.shadows.sm,
  shadowMedium: designTokens.shadows.DEFAULT,
  shadowDark: designTokens.shadows.md,
} as const;

export const TYPOGRAPHY = designTokens.typography;

export const SPACING = designTokens.spacing;

export const BORDER_RADIUS = designTokens.borderRadius;

export const SHADOWS = designTokens.shadows;

export const TRANSITIONS = {
  fast: 'all 0.15s ease-in-out',
  normal: 'all 0.3s ease-in-out',
  slow: 'all 0.5s ease-in-out',
} as const;

export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '1024px',
  desktop: '1440px',
} as const;

export const Z_INDEX = {
  base: 0,
  content: 10,
  sticky: 40,
  dropdown: 40,
  modal: 50,
  tooltip: 50,
  notification: 60,
} as const;

/**
 * Color variants for different component states
 */
export const COLOR_VARIANTS = {
  blue: {
    bg: '#EFF6FF',
    text: '#1E40AF',
    border: '#BFDBFE',
    light: '#3B82F6',
  },
  emerald: {
    bg: '#F0FDF4',
    text: '#065F46',
    border: '#BBFBEE',
    light: '#10B981',
  },
  amber: {
    bg: '#FFFBEB',
    text: '#92400E',
    border: '#FCD34D',
    light: '#F59E0B',
  },
  red: {
    bg: '#FEF2F2',
    text: '#7F1D1D',
    border: '#FECACA',
    light: '#EF4444',
  },
  purple: {
    bg: '#FAF5FF',
    text: '#581C87',
    border: '#E9D5FF',
    light: '#8B5CF6',
  },
  cyan: {
    bg: '#ECFDF5',
    text: '#164E63',
    border: '#A5F3FC',
    light: '#0EA5E9',
  },
  green: {
    bg: '#F0FDF4',
    text: '#166534',
    border: '#86EFAC',
    light: '#00C389',
  },
  gray: {
    bg: '#F9FAFB',
    text: '#374151',
    border: '#E5E7EB',
    light: '#6B7280',
  },
} as const;

/**
 * Gradient presets for backgrounds and buttons
 */
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  primaryReverse: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  subtle: 'linear-gradient(to bottom, #F9FAFB, #F3F4F6)',
  neonBlue: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%)',
} as const;

/**
 * Animation presets for Framer Motion
 */
export const ANIMATION_PRESETS = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },
  springSlow: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  },
} as const;

/**
 * Button variants
 */
export const BUTTON_VARIANTS = {
  primary: {
    background: GRADIENTS.primary,
    color: '#FFFFFF',
    border: 'none',
    padding: `${SPACING[3]} ${SPACING[6]}`,
    borderRadius: BORDER_RADIUS.lg,
  },
  secondary: {
    background: COLORS.background.secondary,
    color: COLORS.text.primary,
    border: `2px solid ${COLORS.border.medium}`,
    padding: `${SPACING[3]} ${SPACING[6]}`,
    borderRadius: BORDER_RADIUS.lg,
  },
  outline: {
    background: 'transparent',
    color: COLORS.text.primary,
    border: `2px solid ${COLORS.border.medium}`,
    padding: `${SPACING[3]} ${SPACING[6]}`,
    borderRadius: BORDER_RADIUS.lg,
  },
  ghost: {
    background: 'transparent',
    color: COLORS.text.secondary,
    border: 'none',
    padding: `${SPACING[3]} ${SPACING[6]}`,
    borderRadius: BORDER_RADIUS.lg,
  },
} as const;

/**
 * Badge styles
 */
export const BADGE_STYLES = {
  success: {
    background: COLOR_VARIANTS.emerald.bg,
    color: COLOR_VARIANTS.emerald.text,
    border: `1px solid ${COLOR_VARIANTS.emerald.border}`,
  },
  warning: {
    background: COLOR_VARIANTS.amber.bg,
    color: COLOR_VARIANTS.amber.text,
    border: `1px solid ${COLOR_VARIANTS.amber.border}`,
  },
  error: {
    background: COLOR_VARIANTS.red.bg,
    color: COLOR_VARIANTS.red.text,
    border: `1px solid ${COLOR_VARIANTS.red.border}`,
  },
  info: {
    background: COLOR_VARIANTS.blue.bg,
    color: COLOR_VARIANTS.blue.text,
    border: `1px solid ${COLOR_VARIANTS.blue.border}`,
  },
  default: {
    background: COLOR_VARIANTS.gray.bg,
    color: COLOR_VARIANTS.gray.text,
    border: `1px solid ${COLOR_VARIANTS.gray.border}`,
  },
} as const;
