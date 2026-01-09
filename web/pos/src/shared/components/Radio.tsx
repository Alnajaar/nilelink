import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label className="flex items-center cursor-pointer hover:opacity-80">
                <div className="relative flex items-center">
                    <input
                        type="radio"
                        ref={ref}
                        className={cn(
                            "peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-border-subtle bg-background-subtle transition-all checked:border-primary checked:bg-primary",
                            className
                        )}
                        {...props}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-background-card opacity-0 peer-checked:opacity-100"></div>
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

Radio.displayName = 'Radio';
