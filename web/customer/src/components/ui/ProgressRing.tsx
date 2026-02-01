'use client';

import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  tierColor?: 'primary' | 'accent' | 'success';
  animated?: boolean;
  children?: React.ReactNode;
}

const sizeConfig = {
  sm: { radius: 35, circumference: 219.8, width: 80, height: 80, strokeWidth: 4 },
  md: { radius: 55, circumference: 345.6, width: 120, height: 120, strokeWidth: 6 },
  lg: { radius: 75, circumference: 471.2, width: 160, height: 160, strokeWidth: 8 },
};

const colorConfig = {
  primary: 'url(#primaryGradient)',
  accent: 'url(#accentGradient)',
  success: 'url(#successGradient)',
};

export default function ProgressRing({
  percentage,
  size = 'md',
  tierColor = 'primary',
  animated = true,
  children,
}: ProgressRingProps) {
  const config = sizeConfig[size];
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  const offset = config.circumference - (normalizedPercentage / 100) * config.circumference;

  return (
    <div className="flex items-center justify-center">
      <svg
        width={config.width}
        height={config.height}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={config.radius}
          stroke="#e5e7eb"
          strokeWidth={config.strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={config.radius}
          stroke={colorConfig[tierColor]}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeDasharray={config.circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-500 ease-out' : ''}
        />
      </svg>

      {children && (
        <div className="absolute flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
