'use client';

import React from 'react';
import { Gift, Crown, Zap } from 'lucide-react';

type TierLevel = 'green' | 'gold' | 'platinum';

interface TierBadgeProps {
  tier: TierLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const tierConfig = {
  green: {
    label: 'Green',
    bgClass: 'bg-primary-100',
    textClass: 'text-primary-700',
    borderClass: 'border-primary-300',
    icon: Gift,
  },
  gold: {
    label: 'Gold',
    bgClass: 'bg-accent-100',
    textClass: 'text-accent-700',
    borderClass: 'border-accent-300',
    icon: Crown,
  },
  platinum: {
    label: 'Platinum',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
    icon: Zap,
  },
};

export default function TierBadge({
  tier,
  size = 'md',
  showIcon = true,
  className = '',
}: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig.green;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 font-semibold rounded-full
        border ${config.borderClass} ${config.bgClass} ${config.textClass}
        ${sizeClasses[size]} transition-all duration-300 ${className}
      `}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      <span>{config.label}</span>
    </div>
  );
}
