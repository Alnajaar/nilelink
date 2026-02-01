"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        // 🚀 NileLink v2.0 Design System - Premium Button Variants
        const variants = {
            // Primary -> Electric Blue with Glow
            primary: 'bg-gradient-to-r from-primary to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/60 active:scale-[0.98] font-semibold transition-all duration-250',

            // Secondary -> Gold Accent with gradient
            secondary: 'bg-gradient-to-r from-secondary to-secondary-600 text-background-primary hover:from-secondary-600 hover:to-secondary-700 active:from-secondary-700 active:to-secondary-800 shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/50 active:scale-[0.98] font-semibold transition-all duration-250',

            // Accent -> Electric Cyan with Glow
            accent: 'bg-gradient-to-r from-accent to-accent-600 text-background-primary hover:from-accent-600 hover:to-accent-700 active:from-accent-700 active:to-accent-800 shadow-lg shadow-accent/40 hover:shadow-xl hover:shadow-accent/60 active:scale-[0.98] font-semibold transition-all duration-250',

            // Ghost -> Glassmorphic hover
            ghost: 'bg-transparent text-text-primary hover:bg-background-secondary/50 border border-transparent hover:border-border-medium active:bg-background-tertiary/50 backdrop-blur-sm transition-all duration-250',

            // Danger -> Neon Red with gradient
            danger: 'bg-gradient-to-r from-error to-error-600 text-white hover:from-error-600 hover:to-error-700 active:from-error-700 active:to-error-800 shadow-lg shadow-error/30 hover:shadow-xl hover:shadow-error/50 active:scale-[0.98] font-semibold transition-all duration-250',

            // Outline -> Border with gradient on hover
            outline: 'border-2 border-primary/50 text-primary hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 active:bg-primary/20 transition-all duration-250',

            // Success -> Emerald Green with gradient
            success: 'bg-gradient-to-r from-success to-success-600 text-white hover:from-success-600 hover:to-success-700 active:from-success-700 active:to-success-800 shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/50 active:scale-[0.98] font-semibold transition-all duration-250',
        };

        const sizes: Record<string, string> = {
            sm: 'h-9 px-3 text-xs rounded-md',
            md: 'h-11 px-5 text-sm rounded-lg',
            lg: 'h-12 px-6 text-base rounded-lg',
            xl: 'h-14 px-8 text-lg rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed select-none',
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


