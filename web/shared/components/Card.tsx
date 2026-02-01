"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'flat' | 'bordered' | 'glass' | 'elevated' | 'glow';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
        const variants = {
            default: 'bg-gradient-to-br from-background-card to-background-secondary border border-border-default shadow-lg',
            flat: 'bg-background-secondary border border-transparent',
            bordered: 'bg-gradient-to-br from-background-card/50 to-background-secondary/50 border-2 border-border-medium backdrop-blur-sm',
            glass: 'glass shadow-xl',
            elevated: 'bg-gradient-to-br from-background-elevated to-background-card border-2 border-border-medium shadow-xl',
            glow: 'bg-gradient-to-br from-background-card to-background-secondary border-2 border-primary/50 shadow-glow-primary',
        };

        const paddings = {
            none: 'p-0',
            sm: 'p-3',
            md: 'p-4 sm:p-6',
            lg: 'p-6 sm:p-8',
            xl: 'p-8 sm:p-10',
        };

        const hoverEffect = hover 
            ? 'transition-all duration-250 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer' 
            : '';

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl overflow-hidden',
                    variants[variant],
                    paddings[padding],
                    hoverEffect,
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

export default Card;
