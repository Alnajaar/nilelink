"use client";

import React from 'react';
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'neutral', size = 'sm', dot = false, children, ...props }, ref) => {
        const variants: Record<string, string> = {
            primary: 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/20',
            secondary: 'bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border-secondary/30 shadow-sm shadow-secondary/20',
            accent: 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent border-accent/30 shadow-sm shadow-accent/20',
            success: 'bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30 shadow-sm shadow-success/20',
            warning: 'bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30 shadow-sm shadow-warning/20',
            error: 'bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30 shadow-sm shadow-error/20',
            info: 'bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30 shadow-sm shadow-info/20',
            neutral: 'bg-gradient-to-r from-background-tertiary to-background-secondary text-text-secondary border-border-medium',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-xs',
            lg: 'px-3 py-1 text-sm',
        };

        const dotColors: Record<string, string> = {
            primary: 'bg-primary',
            secondary: 'bg-secondary',
            accent: 'bg-accent',
            success: 'bg-success',
            warning: 'bg-warning',
            error: 'bg-error',
            info: 'bg-info',
            neutral: 'bg-text-secondary',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider border',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {dot && (
                    <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
                )}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
