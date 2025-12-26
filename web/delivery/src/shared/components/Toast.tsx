import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ToastProps {
    type?: 'success' | 'error' | 'info';
    title: string;
    message?: string;
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', title, message, isVisible, onClose }) => {
    if (!isVisible) return null;

    const types = {
        success: 'bg-primary-surface border-primary/20 text-primary',
        error: 'bg-red-50 border-danger/20 text-danger',
        info: 'bg-background-subtle border-border text-text-main',
    };

    const icons = {
        success: '✓',
        error: '!',
        info: 'i',
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={cn(
                "flex items-start p-4 rounded-xl border shadow-lg shadow-black/5 max-w-sm backdrop-blur-xl",
                types[type]
            )}>
                <div className="flex-shrink-0 mr-3 mt-0.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/50 text-xs font-bold ring-1 ring-black/5">
                        {icons[type]}
                    </span>
                </div>
                <div className="flex-1 mr-4">
                    <h4 className="text-sm font-bold tracking-tight">{title}</h4>
                    {message && <p className="text-xs font-medium opacity-80 mt-1 leading-relaxed">{message}</p>}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                >
                    <span className="sr-only">Close</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
