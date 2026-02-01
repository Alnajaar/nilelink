/**
 * ModernButton - Premium Interactive Button Component
 * Advanced variants with micro-interactions and fluid animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ModernButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'glass' | 'glow' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl'
};

const variantClasses = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30',
  secondary: 'bg-secondary hover:bg-secondary-dark text-primary shadow-lg shadow-secondary/20',
  tertiary: 'bg-background-tertiary hover:bg-background-tertiary border border-border-medium text-text-primary',
  glass: 'glass hover:glass-strong text-text-primary',
  glow: 'bg-accent/10 border-2 border-accent hover:bg-accent/20 text-accent shadow-glow-accent',
  minimal: 'hover:bg-background-tertiary text-text-secondary hover:text-text-primary'
};

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animated = true
}) => {
  const baseClasses = 'font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2';
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const content = (
    <>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </>
  );

  if (animated) {
    return (
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default ModernButton;
