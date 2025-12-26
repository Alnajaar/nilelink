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
        success: 'bg-green-50 border-green-200 text-green-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className={cn(
                "flex items-start p-4 rounded-lg border shadow-lg max-w-sm",
                types[type]
            )}>
                <div className="flex-shrink-0 mr-3 mt-0.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/50 text-xs font-bold">
                        {icons[type]}
                    </span>
                </div>
                <div className="flex-1 mr-2">
                    <h4 className="text-sm font-semibold">{title}</h4>
                    {message && <p className="text-xs opacity-90 mt-1">{message}</p>}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 ml-4 opacity-50 hover:opacity-100 transition-opacity"
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
