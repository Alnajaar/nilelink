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
        const variants = {
            success: 'bg-[rgba(15,185,177,0.1)] text-success border border-success/20',
            warning: 'bg-[rgba(245,166,35,0.1)] text-warning border border-warning/20',
            error: 'bg-[rgba(214,69,69,0.1)] text-error border border-error/20',
            info: 'bg-[rgba(11,31,51,0.1)] text-info border border-info/20',
            neutral: 'bg-background-card text-text-primary border border-border',
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
