'use client';

/**
 * ModernStatCard - Premium Statistics Display Component
 * Elegant stat cards with icons, trends, and animations
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ModernStatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'glow';
  className?: string;
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend = 'neutral',
  trendValue = '',
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-background-secondary border-2 border-border-subtle',
    glass: 'glass border-2 border-glass-border',
    elevated: 'bg-gradient-to-br from-background-tertiary to-background-secondary border-2 border-border-medium shadow-xl',
    glow: 'bg-background-secondary border-2 border-accent/40 shadow-glow-accent'
  };

  const trendIcon = trend === 'up' ? (
    <TrendingUp className="w-4 h-4 text-success" />
  ) : trend === 'down' ? (
    <TrendingDown className="w-4 h-4 text-error" />
  ) : null;

  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-tertiary';

  return (
    <div className={`rounded-3xl p-6 md:p-8 transition-all duration-300 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">{value}</span>
            {unit && <span className="text-xl text-text-secondary font-bold">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <div className="text-accent">{icon}</div>
          </div>
        )}
      </div>

      {trendValue && (
        <div className={`flex items-center gap-1.5 text-sm font-bold ${trendColor}`}>
          {trendIcon}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export default ModernStatCard;
