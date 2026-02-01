import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'flat' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-white shadow-elevation-1 border border-gray-100',
            flat: 'bg-gray-50',
            bordered: 'bg-transparent border-2 border-gray-100',
        };

        const paddings = {
            none: 'p-0',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-8',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl text-gray-900',
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
