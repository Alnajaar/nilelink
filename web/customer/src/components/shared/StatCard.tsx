import React from 'react';
import { PremiumCard } from './PremiumCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'primary'
}) => {
  const iconColorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-info-100 text-info-600'
  };

  const trendColorClasses = {
    up: 'text-success-600',
    down: 'text-error-600'
  };

  return (
    <PremiumCard variant="elevated">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-medium">{label}</p>
          {icon && (
            <div className={`p-3 rounded-xl ${iconColorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-text-primary">{value}</h3>
          {trend && (
            <span className={`text-sm font-bold ${trendColorClasses[trend.direction]}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      </div>
    </PremiumCard>
  );
};
