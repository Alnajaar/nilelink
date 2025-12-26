import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-semibold text-text-main">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <select
                        ref={ref}
                        className={cn(
                            'flex h-11 w-full appearance-none rounded-lg border border-border bg-background-card px-4 py-2 text-sm text-text-main transition-all duration-200',
                            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
                            'hover:border-primary/50',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-subtle',
                            error && 'border-danger focus:border-danger focus:ring-danger/10',
                            className
                        )}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary transition-colors">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                {error && <p className="mt-1.5 text-xs font-medium text-danger animate-in slide-in-from-top-1">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
