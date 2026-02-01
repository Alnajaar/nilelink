'use client';

/**
 * ModernBadge - Premium Badge Component
 * Status indicators with semantic colors and animations
 */

import React from 'react';

interface ModernBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantClasses = {
  primary: 'bg-primary/20 text-primary border border-primary/40',
  secondary: 'bg-secondary/20 text-secondary border border-secondary/40',
  success: 'bg-success/20 text-success border border-success/40',
  warning: 'bg-warning/20 text-warning border border-warning/40',
  error: 'bg-error/20 text-error border border-error/40',
  info: 'bg-info/20 text-info border border-info/40',
  accent: 'bg-accent/20 text-accent border border-accent/40'
};

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

const dotColorClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  accent: 'bg-accent'
};

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className = '',
  pulse = false
}) => {
  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-widest';
  const pulseClass = pulse ? 'animate-pulse' : '';

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${pulseClass} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorClasses[variant]}`} />
      )}
      {icon && icon}
      {children}
    </span>
  );
};

export default ModernBadge;
