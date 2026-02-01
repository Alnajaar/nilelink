/**
 * NileLink POS Design System Tokens
 * Optimized for touch interfaces, speed, and high-pressure retail environments.
 */

export const tokens = {
  colors: {
    // POS-specific dark/neutral background system
    background: {
      primary: '#0F172A',   // Slate 900 - Deep, calm background
      secondary: '#1E293B', // Slate 800 - Sidebar/Header
      tertiary: '#334155',  // Slate 700 - Inactive elements
    },
    // High-contrast cards for readability under bright store lights
    card: {
      background: '#1E293B',
      border: '#334155',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    // Strong semantic colors with high accessibility contrast
    status: {
      success: '#10B981', // Emerald 500
      warning: '#F59E0B', // Amber 500
      error: '#EF4444',   // Red 500
      info: '#3B82F6',    // Blue 500
    },
    // Text system with clear hierarchy
    text: {
      primary: '#F8FAFC',   // Slate 50 - Maximum contrast
      secondary: '#94A3B8', // Slate 400 - Supporting text
      muted: '#64748B',     // Slate 500 - Metadata/Disabled
      inverse: '#0F172A',   // Slate 900 - Text on light buttons
    },
    // Interactive elements - NileLink Green as primary action
    brand: {
      primary: '#00C389',   // NileLink Green
      primaryHover: '#059669',
      secondary: '#3B82F6', // NileLink Blue
      secondaryHover: '#2563EB',
    }
  },
  
  // Large tap targets for fingers (min 44px)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    'touch-target': '48px', // Standard for fingers
  },
  
  // Typography scale for clarity and speed
  typography: {
    fontFamily: "'Inter', sans-serif",
    sizes: {
      'price-lg': '48px',   // Large price display
      'price-md': '32px',   // Cart total
      'item-title': '20px', // Product names
      'body': '16px',       // Standard text
      'label': '14px',      // Metadata
    },
    weights: {
      normal: '400',
      medium: '500',
      bold: '700',
      black: '900',
    }
  },
  
  // Shadows for depth without visual noise
  shadows: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    active: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  // Transitions for smooth but fast interaction
  transitions: {
    fast: '150ms ease-out',
    standard: '300ms ease-in-out',
  }
};
