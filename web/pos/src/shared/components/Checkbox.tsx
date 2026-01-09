import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label className="flex items-start cursor-pointer hover:opacity-80">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        ref={ref}
                        className={cn(
                            "peer h-4 w-4 cursor-pointer appearance-none rounded border border-border-subtle bg-background-subtle transition-all checked:border-primary checked:bg-primary",
                            className
                        )}
                        {...props}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-background-card opacity-0 peer-checked:opacity-100">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                {label && (
                    <span className="ml-2 text-sm text-text-main select-none">
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';
