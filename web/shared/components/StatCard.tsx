/**
 * StatCard.tsx
 * Reusable statistics card component for all dashboards
 */

'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  className = '',
}: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-md p-6 border border-gray-200
        hover:shadow-lg transition-shadow cursor-pointer
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-2xl ml-4 opacity-70">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-4 text-sm font-medium ${trendColor}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend}
        </div>
      )}
    </div>
  );
}

export default StatCard;
