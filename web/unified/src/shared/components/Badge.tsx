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
            success: 'bg-[#dcfce7] text-[#14532d] border border-[#bbf7d0]',
            warning: 'bg-[#fef9c3] text-[#713f12] border border-[#fde047]',
            error: 'bg-[#fee2e2] text-[#7f1d1d] border border-[#fca5a5]',
            info: 'bg-[#e0f2fe] text-[#0c4a6e] border border-[#bae6fd]',
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
