import React from 'react';
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
    helperText?: string;
    required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, leftIcon, helperText, required, id, ...props }, ref) => {
        const finalIcon = icon || leftIcon;
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = error ? `${inputId}-error` : undefined;
        const helperId = helperText ? `${inputId}-helper` : undefined;

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
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary transition-colors"
                            aria-hidden="true"
                        >
                            {finalIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'flex h-11 w-full rounded-lg border border-border bg-background-card px-4 py-2 text-sm text-text-main placeholder:text-text-muted/50 transition-all duration-200',
                            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
                            'hover:border-primary/50',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-subtle',
                            finalIcon && 'pl-10',
                            error && 'border-danger focus:border-danger focus:ring-danger/10',
                            className
                        )}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        aria-required={required}
                        {...props}
                    />
                </div>
                {error && (
                    <p
                        id={errorId}
                        className="mt-1.5 text-xs font-medium text-danger animate-in slide-in-from-top-1"
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
