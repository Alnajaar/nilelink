"use client";

import React from 'react';

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`bg-white rounded-lg shadow-md ${className}`} {...props}>
            {children}
        </div>
    );
}
