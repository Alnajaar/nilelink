import React from 'react';

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false
}) => {
  const baseClass = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-text-primary hover:bg-gray-200',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 shadow-md hover:shadow-lg',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-gray-100',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />}
      {icon && !loading && icon}
      {children}
    </button>
  );
};
