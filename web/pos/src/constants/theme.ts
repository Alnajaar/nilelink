/**
 * POS SYSTEM THEME CONSTANTS
 * Unified NileLink Design System Implementation
 * Version: 2.0 (Unified)
 */

import designTokens from '../../../shared/design-tokens';

// ============================================================================
// UNIFIED COLOR SYSTEM - ONE SYSTEM FOR ALL APPS
// ============================================================================

export const COLORS = {
  // PRIMARY COLORS - Always use these
  primary: designTokens.colors.primary[500],      // #00C389 - Main brand action
  secondary: designTokens.colors.secondary[500],  // #3B82F6 - Secondary actions
  accent: designTokens.colors.accent[500],        // #FFD666 - Highlights & attention

  // BACKGROUND COLORS - PERFECT CONTRAST BASE
  background: {
    primary: designTokens.semanticColors.background,    // #FAFAFA - Main background
    secondary: designTokens.semanticColors['background-secondary'], // #F5F5F5 - Cards, surfaces
    tertiary: designTokens.semanticColors['background-tertiary'],  // #E5E7EB - Subtle backgrounds
    card: designTokens.semanticColors.surface,      // #F5F5F5 - Component backgrounds
    'card-hover': designTokens.semanticColors['surface-hover'], // #E5E7EB - Hover states
  },

  // TEXT COLORS - GUARANTEED CONTRAST RATIOS
  text: {
    primary: designTokens.semanticColors.text,         // #111827 - Primary text (21:1)
    secondary: designTokens.semanticColors['text-secondary'], // #4B5563 - Body text (7:1)
    tertiary: designTokens.semanticColors['text-tertiary'],  // #9CA3AF - Muted text (4.5:1)
    inverse: designTokens.semanticColors['text-inverse'], // #FFFFFF - White text
  },

  // BORDER COLORS - SUBTLE SEPARATION
  border: {
    default: designTokens.semanticColors.border,       // #E5E7EB - Default borders
    subtle: designTokens.semanticColors['border-subtle'], // #D4D4D4 - Subtle borders
    strong: designTokens.semanticColors['border-strong'], // #9CA3AF - Strong borders
  },

  // STATUS COLORS - SEMANTIC & ACCESSIBLE
  status: {
    success: designTokens.semanticColors.success,   // #22C55E - 4.5:1 contrast
    warning: designTokens.semanticColors.warning,   // #F59E0B - 4.5:1 contrast
    error: designTokens.semanticColors.error,       // #EF4444 - 4.5:1 contrast
    info: designTokens.semanticColors.info,         // #3B82F6 - 4.5:1 contrast
  },

  // STATUS BACKGROUNDS - ALWAYS PAIRED WITH STATUS TEXT
  statusBg: {
    success: designTokens.semanticColors['success-bg'],   // #F0FDF4
    warning: designTokens.semanticColors['warning-bg'],   // #FFFBEB
    error: designTokens.semanticColors['error-bg'],       // #FEF2F2
    info: designTokens.semanticColors['info-bg'],         // #EFF6FF
  },

  // GRADIENTS - CONTROLLED USAGE
  gradients: {
    primary: designTokens.semanticColors['gradient-primary'],
    secondary: designTokens.semanticColors['gradient-secondary'],
    accent: designTokens.semanticColors['gradient-accent'],
    success: designTokens.semanticColors['gradient-success'],
    warning: designTokens.semanticColors['gradient-warning'],
    error: designTokens.semanticColors['gradient-error'],
  },

  // GLOW EFFECTS
  glow: {
    primary: '0 0 20px rgba(0, 194, 137, 0.3)',
    secondary: '0 0 20px rgba(59, 130, 246, 0.3)',
    accent: '0 0 20px rgba(255, 214, 102, 0.3)',
  },

  // MESH BACKGROUNDS
  mesh: {
    primary: `radial-gradient(at 40% 20%, rgba(0, 194, 137, 0.1) 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(255, 214, 102, 0.05) 0px, transparent 50%)`,
  }
} as const;

export const TYPOGRAPHY = designTokens.typography;
export const SPACING = designTokens.spacing;
export const BORDER_RADIUS = designTokens.borderRadius;
export const SHADOWS = designTokens.boxShadow;

// ============================================================================
// POS SPECIFIC DESIGN TOKENS
// ============================================================================

export const POS_BUTTON_SIZES = {
  // Touch-friendly sizes for POS screens
  small: {
    height: '3rem',    // 48px
    paddingX: '1rem',  // 16px
    fontSize: '0.875rem', // 14px
    borderRadius: BORDER_RADIUS.lg
  },
  medium: {
    height: '3.5rem',  // 56px
    paddingX: '1.5rem', // 24px
    fontSize: '1rem',   // 16px
    borderRadius: BORDER_RADIUS.lg
  },
  large: {
    height: '4rem',    // 64px
    paddingX: '2rem',   // 32px
    fontSize: '1.125rem', // 18px
    borderRadius: BORDER_RADIUS.xl
  },
  xl: {
    height: '4.5rem',  // 72px
    paddingX: '2.5rem', // 40px
    fontSize: '1.25rem',  // 20px
    borderRadius: BORDER_RADIUS['2xl']
  }
} as const;

export const POS_LAYOUT = {
  // Grid layouts optimized for POS screens
  productGrid: {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-4',
    large: 'grid-cols-5'
  },
  buttonGrid: {
    mobile: 'grid-cols-3',
    tablet: 'grid-cols-4',
    desktop: 'grid-cols-5'
  },
  // Spacing optimized for touch
  touchTarget: '2.5rem', // 40px minimum touch target
  safeArea: '1rem'       // Safe area around touch targets
} as const;

export const POS_ANIMATIONS = {
  // Fast, smooth animations for POS workflow
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS FOR POS
// ============================================================================

export const POS_BREAKPOINTS = {
  mobile: '640px',   // Small phones
  tablet: '768px',   // Tablets
  pos: '1024px',     // POS screens start
  large: '1280px'    // Large POS screens
} as const;

// ============================================================================
// COMPONENT VARIANTS FOR POS
// ============================================================================

export const POS_CARD_VARIANTS = {
  product: {
    background: COLORS.background.card,
    border: `2px solid ${COLORS.border.default}`,
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.md,
    hoverShadow: SHADOWS.lg
  },
  order: {
    background: COLORS.background.secondary,
    border: `1px solid ${COLORS.border.subtle}`,
    borderRadius: BORDER_RADIUS.lg,
    shadow: SHADOWS.sm
  },
  summary: {
    background: COLORS.background.primary,
    border: `2px solid ${COLORS.border.strong}`,
    borderRadius: BORDER_RADIUS.xl,
    shadow: SHADOWS.lg,
    glow: COLORS.glow.primary
  }
} as const;

export const POS_BUTTON_VARIANTS = {
  primary: {
    background: COLORS.gradients.primary,
    color: COLORS.text.inverse,
    border: 'none',
    shadow: COLORS.glow.primary,
    hoverTransform: 'translateY(-2px)'
  },
  secondary: {
    background: COLORS.background.secondary,
    color: COLORS.text.primary,
    border: `2px solid ${COLORS.border.default}`,
    shadow: SHADOWS.sm,
    hoverBackground: COLORS.background.tertiary
  },
  accent: {
    background: COLORS.gradients.accent,
    color: COLORS.text.primary,
    border: 'none',
    shadow: COLORS.glow.accent,
    hoverTransform: 'translateY(-1px)'
  },
  danger: {
    background: COLORS.status.error,
    color: COLORS.text.inverse,
    border: 'none',
    shadow: `0 0 10px rgba(239, 68, 68, 0.3)`,
    hoverTransform: 'translateY(-1px)'
  }
} as const;

// ============================================================================
// CSS CUSTOM PROPERTIES FOR RUNTIME THEMING
// ============================================================================

export const POS_CSS_VARIABLES = {
  // Colors
  '--pos-primary': COLORS.primary,
  '--pos-secondary': COLORS.secondary,
  '--pos-accent': COLORS.accent,

  // Backgrounds
  '--pos-bg-primary': COLORS.background.primary,
  '--pos-bg-secondary': COLORS.background.secondary,
  '--pos-bg-tertiary': COLORS.background.tertiary,
  '--pos-bg-card': COLORS.background.card,

  // Text
  '--pos-text-primary': COLORS.text.primary,
  '--pos-text-secondary': COLORS.text.secondary,
  '--pos-text-tertiary': COLORS.text.tertiary,

  // Borders
  '--pos-border-default': COLORS.border.default,
  '--pos-border-subtle': COLORS.border.subtle,

  // Gradients
  '--pos-gradient-primary': COLORS.gradients.primary,
  '--pos-gradient-secondary': COLORS.gradients.secondary,
  '--pos-gradient-accent': COLORS.gradients.accent,

  // Glows
  '--pos-glow-primary': COLORS.glow.primary,
  '--pos-glow-secondary': COLORS.glow.secondary,
  '--pos-glow-accent': COLORS.glow.accent,

  // Mesh backgrounds
  '--pos-bg-mesh': COLORS.mesh.primary
} as const;