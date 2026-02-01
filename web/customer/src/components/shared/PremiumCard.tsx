import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'premium' | 'glass' | 'subtle';
  hoverable?: boolean;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  variant = 'elevated',
  hoverable = true,
  onClick
}) => {
  const baseClass = 'rounded-2xl transition-all duration-300';

  const variantClasses = {
    elevated: 'bg-white shadow-elevation-1 border border-gray-100',
    premium: 'bg-white shadow-elevation-2 border border-gray-100 backdrop-blur-sm',
    glass: 'bg-white/80 backdrop-blur-xl border border-gray-200/50',
    subtle: 'bg-gray-50 border border-gray-200'
  };

  const hoverClass = hoverable ? 'hover:shadow-elevation-2 hover:-translate-y-1' : '';

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${hoverClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
