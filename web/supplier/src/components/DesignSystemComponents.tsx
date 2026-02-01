'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, COLOR_VARIANTS, ANIMATION_PRESETS } from '@/constants/theme';

/**
 * Advanced Badge Component
 */
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  const variantStyles = {
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  return (
    <span className={`inline-block rounded-full font-black uppercase tracking-widest ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Advanced Stat Card Component
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: keyof typeof COLOR_VARIANTS;
}

export const AdvancedStatCard: React.FC<StatCardProps> = ({ label, value, change, trend, icon: Icon, color }) => {
  const colorVariant = COLOR_VARIANTS[color];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: SHADOWS.lg }}
      transition={ANIMATION_PRESETS.spring}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: colorVariant.bg }}>
          <Icon size={24} style={{ color: colorVariant.light }} />
        </div>
        {change && (
          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
              trend === 'down' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
            }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-gray-900 tracking-tighter">
        {value}
      </p>
    </motion.div>
  );
};

/**
 * Data Table Component
 */
export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  hoverable?: boolean;
  striped?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  hoverable = true,
  striped = true,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                    }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`border-b border-gray-200 ${hoverable ? 'hover:bg-gray-50 transition-colors' : ''
                    } ${striped && idx % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                        }`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-gray-600">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Metric Card Component
 */
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-lg bg-${color}-50 flex items-center justify-center text-${color}-600`}>
            <Icon size={24} />
          </div>
        )}
        {trend && (
          <div className={`text-xs font-black px-2 py-1 rounded-full ${trend.direction === 'up' ? 'bg-emerald-100 text-emerald-700' :
              trend.direction === 'down' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
            }`}>
            {trend.value}
          </div>
        )}
      </div>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
        {title}
      </h3>
      <p className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-600">{subtitle}</p>
      )}
    </motion.div>
  );
};

/**
 * Filter Chips Component
 */
export interface FilterChipsProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  variant?: 'primary' | 'secondary';
}

export const FilterChips: React.FC<FilterChipsProps> = ({ options, selected, onChange, variant = 'primary' }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <motion.button
          key={option}
          onClick={() => onChange(option)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selected === option
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : variant === 'primary'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
};

/**
 * Progress Bar Component
 */
export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: keyof typeof COLOR_VARIANTS;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  animated = true,
  label,
}) => {
  const percentage = (value / max) * 100;
  const colorVariant = COLOR_VARIANTS[color];

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-gray-600">{label}</p>
          <p className="text-xs font-black text-gray-900">{Math.round(percentage)}%</p>
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${heights[size]} bg-gray-200`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.6 : 0, type: 'tween' }}
          style={{ backgroundColor: colorVariant.light }}
          className={`h-full ${animated ? '' : ''}`}
        />
      </div>
    </div>
  );
};

/**
 * Status Indicator Component
 */
export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'pending' | 'info';
  label: string;
  animated?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, animated = false }) => {
  const statusColors = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <motion.div
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${statusColors[status]}`}
    >
      <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-emerald-700' :
          status === 'warning' ? 'bg-amber-700' :
            status === 'error' ? 'bg-red-700' :
              status === 'pending' ? 'bg-gray-700' :
                'bg-blue-700'
        } ${animated ? 'animate-pulse' : ''}`} />
      {label}
    </motion.div>
  );
};
