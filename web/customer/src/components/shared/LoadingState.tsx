import React from 'react';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="relative w-12 h-12 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-dark/10 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-primary-dark/60">{message}</p>
        </div>
    );
};
