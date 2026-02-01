import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
    "rounded-xl border transition-all not-italic",
    {
        variants: {
            variant: {
                default: "bg-[var(--pos-bg-secondary)] border-[var(--pos-border-subtle)] text-[var(--pos-text-primary)] shadow-[var(--pos-shadow-sm)]",
                interactive: "bg-[var(--pos-bg-secondary)] border-[var(--pos-border-subtle)] text-[var(--pos-text-primary)] shadow-[var(--pos-shadow-sm)] hover:border-[var(--pos-accent)] hover:shadow-[0_0_20px_var(--pos-accent-glow)] cursor-pointer active:scale-[0.98]",
                elevated: "bg-[var(--pos-bg-tertiary)] border-[var(--pos-border-strong)] text-[var(--pos-text-primary)] shadow-[var(--pos-shadow-lg)]",
                outline: "border-[var(--pos-border-strong)] shadow-none bg-transparent text-[var(--pos-text-primary)]",
                active: "border-[var(--pos-accent)] bg-[var(--pos-bg-surface)] text-[var(--pos-text-primary)] shadow-[var(--pos-accent-glow)]",
            },
            padding: {
                none: "p-0",
                sm: "p-3",
                md: "p-4",
                lg: "p-6",
            },
        },
        defaultVariants: {
            variant: "default",
            padding: "md",
        },
    }
);

export interface POSCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const POSCard = React.forwardRef<HTMLDivElement, POSCardProps>(
    ({ className, variant, padding, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(cardVariants({ variant, padding, className }))}
                {...props}
            />
        );
    }
);
POSCard.displayName = "POSCard";

export { POSCard, cardVariants };
