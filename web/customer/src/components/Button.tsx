"use client";

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

export function Button({ isLoading, children, disabled, ...props }: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
}