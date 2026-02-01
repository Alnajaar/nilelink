import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, otherwise standard class concatenation
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl font-extrabold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 active:scale-95 not-italic tracking-widest uppercase text-xs",
    {
        variants: {
            variant: {
                primary: "bg-[var(--pos-accent)] text-[var(--pos-text-inverse)] hover:brightness-110 shadow-[0_0_20px_var(--pos-accent-glow)] border-none",
                destructive: "bg-[var(--pos-danger)] text-[var(--pos-text-primary)] hover:brightness-110 shadow-lg shadow-[var(--pos-danger-bg)]",
                warning: "bg-[var(--pos-warning)] text-[var(--pos-text-inverse)] hover:brightness-110 shadow-lg shadow-[var(--pos-warning-bg)]",
                secondary: "bg-[var(--pos-bg-tertiary)] text-[var(--pos-text-primary)] hover:bg-[var(--pos-bg-surface)] border border-[var(--pos-border-strong)]",
                success: "bg-[var(--pos-success)] text-[var(--pos-text-inverse)] hover:brightness-110 shadow-lg shadow-[var(--pos-success-bg)]",
                outline: "border-2 border-[var(--pos-border-strong)] bg-transparent hover:bg-[var(--pos-bg-surface)] text-[var(--pos-text-primary)]",
                ghost: "hover:bg-[var(--pos-bg-surface)] text-[var(--pos-text-secondary)]",
                accent: "bg-transparent text-[var(--pos-accent)] border border-[var(--pos-accent)] hover:bg-[var(--pos-accent)] hover:text-[var(--pos-text-inverse)]",
            },
            size: {
                sm: "h-[40px] px-3 text-[10px]",
                md: "h-[56px] px-6 text-[12px]",
                lg: "h-[72px] px-8 text-[14px]",
                xl: "h-[88px] px-10 text-[16px] tracking-[0.2em]",
            },
            fullWidth: {
                true: "w-full",
            }
        },
        defaultVariants: {
            variant: "secondary",
            size: "md",
            fullWidth: false,
        },
    }
);

export interface POSButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const POSButton = React.forwardRef<HTMLButtonElement, POSButtonProps>(
    ({ className, variant, size, fullWidth, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);
POSButton.displayName = "POSButton";

export { POSButton, buttonVariants };
