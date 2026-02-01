import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 not-italic",
    {
        variants: {
            variant: {
                default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
                secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
                success: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
                warning: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
                destructive: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                outline: "text-slate-900",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface POSBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function POSBadge({ className, variant, ...props }: POSBadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { POSBadge, badgeVariants };
