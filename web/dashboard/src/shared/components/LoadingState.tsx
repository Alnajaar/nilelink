import React from 'react';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="relative w-12 h-12 mb-6">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-border rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-bold text-text-main uppercase tracking-widest">{message}</p>
        </div>
    );
};
