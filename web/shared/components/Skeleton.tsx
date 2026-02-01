import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    variant?: 'default' | 'circle' | 'text';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({ className, variant = 'default', width, height, style, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "skeleton animate-pulse bg-white/5",
                variant === 'circle' && "rounded-full",
                variant === 'text' && "h-4 rounded",
                variant === 'default' && "rounded-lg",
                className
            )}
            style={{
                width: width,
                height: height,
                ...style
            }}
            {...props}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {/* Image Skeleton */}
            <Skeleton className="aspect-square w-full" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                <Skeleton variant="text" width="80%" className="h-6" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" />

                <div className="pt-2 flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>

                <Skeleton className="h-10 w-full mt-2" />
            </div>
        </div>
    );
}
