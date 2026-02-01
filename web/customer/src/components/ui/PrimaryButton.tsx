'use client';

import React from 'react';

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg',
  secondary:
    'bg-gray-100 text-text-primary hover:bg-gray-200 focus:ring-gray-500',
  outline:
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-gray-100 focus:ring-gray-500',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function PrimaryButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
