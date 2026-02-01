import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    helperText?: string;
    required?: boolean;
    variant?: 'default' | 'glass' | 'bordered';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, leftIcon, rightIcon, helperText, required, variant = 'default', id, onFocus, onBlur, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const finalIcon = icon || leftIcon;

        const variants = {
            default: 'bg-background-secondary border-border-default focus:border-primary',
            glass: 'glass focus:border-accent',
            bordered: 'bg-transparent border-2 border-border-medium focus:border-primary',
        };

        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = error ? `${inputId}-error` : undefined;
        const helperId = helperText ? `${inputId}-helper` : undefined;

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-semibold text-text-main"
                    >
                        {label}
                        {required && <span className="text-danger ml-1" aria-label="required">*</span>}
                    </label>
                )}
                <div className="relative group">
                    {finalIcon && (
                        <div
                            className={cn(
                                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-200",
                                isFocused && "text-primary"
                            )}
                            aria-hidden="true"
                        >
                            {finalIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'flex h-11 w-full rounded-lg border px-4 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all duration-250',
                            'focus:outline-none focus:ring-2 focus:ring-accent/20',
                            'hover:border-border-medium',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            !!finalIcon && 'pl-10',
                            !!rightIcon && 'pr-10',
                            !!error && 'border-error focus:border-error focus:ring-error/20',
                            variants[variant],
                            className as string
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        aria-required={required}
                        {...props}
                    />
                    {rightIcon && (
                        <div
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                            aria-hidden="true"
                        >
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p
                        id={errorId}
                        className="mt-1.5 text-xs font-medium text-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p
                        id={helperId}
                        className="mt-1.5 text-xs text-text-muted"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
