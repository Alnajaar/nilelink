"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

const APPS = [
    { name: 'Portal', url: 'https://nilelink.app', description: 'Ecosystem Home' },
    { name: 'POS System', url: 'https://pos.nilelink.app', description: 'Merchant Terminal' },
    { name: 'Delivery', url: 'https://delivery.nilelink.app', description: 'Driver Network' },
    { name: 'Customer', url: 'https://customer.nilelink.app', description: 'Marketplace' },
    { name: 'Supplier', url: 'https://supplier.nilelink.app', description: 'Supply Chain' },
    { name: 'Investor', url: 'https://dashboard.nilelink.app', description: 'Protocol Dashboard' },
];

export const AppSwitcher: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2"
                rightIcon={
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                }
            >
                <img
                    src="/logo.png"
                    alt="NileLink Logo"
                    className="w-8 h-8 object-contain"
                />
            </Button>

            {isOpen && (
                <Card className="absolute left-0 top-full mt-2 w-64 z-50 p-2 shadow-xl border-primary-dark/10" padding="none">
                    <div className="space-y-1">
                        {APPS.map((app) => (
                            <a
                                key={app.name}
                                href={app.url}
                                className="block px-3 py-2.5 rounded-lg hover:bg-black/5 transition-colors group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-primary-dark group-hover:text-primary-dark/80">
                                        {app.name}
                                    </span>
                                    {app.name === 'Portal' && <Badge size="sm" variant="neutral">Home</Badge>}
                                </div>
                                <p className="text-xs text-primary-dark/50 mt-0.5">{app.description}</p>
                            </a>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
