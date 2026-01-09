"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'neutral', size = 'sm', children, ...props }, ref) => {
        const variants: Record<string, string> = {
            success: 'bg-success/10 text-success border-success/20',
            warning: 'bg-warning/10 text-warning border-warning/20',
            error: 'bg-error/10 text-error border-error/20',
            info: 'bg-info/10 text-info border-info/20',
            neutral: 'bg-secondary-soft text-primary-dark border border-black/5',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-sm',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full font-medium',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
