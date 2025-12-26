import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-black/5 rounded-xl bg-black/[0.02]">
            {icon ? (
                <div className="mb-4 text-primary-dark/20 p-4 bg-primary-dark/5 rounded-full">
                    {icon}
                </div>
            ) : (
                <div className="mb-4 p-4 bg-primary-dark/5 rounded-full">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-dark/20">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}
            <h3 className="text-lg font-semibold text-primary-dark mb-1">{title}</h3>
            <p className="text-sm text-primary-dark/60 max-w-sm mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="primary" size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    );
};
