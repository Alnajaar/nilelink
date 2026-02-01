'use client';

/**
 * ModernCard - Future-Forward Card Component
 * Premium glassmorphism with mesh gradients and glow effects
 */

import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'glow' | 'mesh' | 'minimal';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  animated?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  interactive = false,
  animated = true
}) => {
  const baseClasses = 'rounded-3xl transition-all duration-300';
  const interactiveClasses = interactive ? 'cursor-pointer hover:scale-105 hover:shadow-2xl' : '';
  const animationClasses = animated ? 'transform' : '';

  const variantClasses = {
    default: 'bg-background-secondary border-2 border-border-subtle shadow-lg',
    glass: 'glass backdrop-blur-xl border-2 border-glass-border',
    elevated: 'bg-background-tertiary border-2 border-border-medium shadow-2xl',
    glow: 'bg-background-secondary border-2 border-accent/30 shadow-glow-accent',
    mesh: 'bg-background-primary bg-mesh-primary border-2 border-accent/20 shadow-lg',
    minimal: 'bg-background-secondary border border-border-subtle'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${animationClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ModernCard;
