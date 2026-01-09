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
        success: 'bg-secondary/10 border-secondary/20 text-secondary',
        error: 'bg-error/10 border-error/20 text-error',
        info: 'bg-background-subtle border-border-subtle text-text-main',
    };

    const icons = {
        success: '✓',
        error: '!',
        info: 'i',
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={cn(
                "flex items-start p-4 rounded-xl border shadow-lg shadow-black/20 max-w-sm backdrop-blur-xl bg-background-card/90",
                types[type]
            )}>
                <div className="flex-shrink-0 mr-3 mt-0.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background/20 text-xs font-bold ring-1 ring-white/10">
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

export const toast = {
    success: (message: string, title: string = 'Success') => {
        // This is a placeholder for build compatibility
        console.log(`Toast Success: ${title} - ${message}`);
    },
    error: (message: string, title: string = 'Error') => {
        console.error(`Toast Error: ${title} - ${message}`);
    },
    info: (message: string, title: string = 'Info') => {
        console.info(`Toast Info: ${title} - ${message}`);
    }
};
