"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}


export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        // 🎨 STRICT DESIGN SYSTEM MAPPING
        const variants = {
            // Primary CTA -> Emerald Green with Visible Text
            // Using 'text-primary' (Navy) on 'bg-secondary' (Emerald) provides good contrast
            primary: 'bg-secondary text-primary hover:bg-secondary-dark shadow-md active:scale-[0.98] font-bold',

            // Secondary -> Transparent with Emerald Border
            secondary: 'bg-transparent border-2 border-secondary text-secondary hover:bg-secondary/10',

            // Ghost -> Subtle hover effect
            ghost: 'bg-transparent text-text-primary hover:bg-black/5 active:bg-black/10',

            // Danger -> Red with White text
            danger: 'bg-error text-white hover:bg-error/90 shadow-sm',

            // Outline -> Border with Primary color
            outline: 'border border-primary text-primary hover:bg-primary/5',
        };

        const sizes: Record<string, string> = {
            sm: 'h-10 sm:h-8 px-4 sm:px-3 text-sm sm:text-xs uppercase tracking-wide', // Mobile: 40px, Desktop: 32px
            md: 'h-12 sm:h-10 px-6 sm:px-5 text-base sm:text-sm font-medium',          // Mobile: 48px, Desktop: 40px
            lg: 'h-14 sm:h-12 px-8 sm:px-8 text-lg sm:text-base font-semibold',         // Mobile: 56px, Desktop: 48px
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 select-none',
                    fullWidth && 'w-full',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);
Button.displayName = 'Button';

export default Button;


