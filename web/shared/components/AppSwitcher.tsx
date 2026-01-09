"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { URLS } from '@/shared/utils/urls';

const APPS = [
    { name: 'Portal', url: URLS.portal, description: 'Ecosystem Command' },
    { name: 'POS System', url: URLS.pos, description: 'Commerce Terminal' },
    { name: 'Delivery', url: URLS.delivery, description: 'Fleet Network' },
    { name: 'Customer', url: URLS.customer, description: 'Personal Ledger' },
    { name: 'Supplier', url: URLS.supplier, description: 'Supply Protocol' },
    { name: 'Investor', url: URLS.dashboard, description: 'Asset Optimization' },
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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-all text-sm group"
            >
                <span className="font-black uppercase tracking-[0.2em] text-text-primary text-[10px]">NileLink</span>
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-500 opacity-40 group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-4 w-72 z-50 p-2 bg-white/80 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid gap-1">
                        <div className="px-3 py-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Ecosystem Nodes</span>
                        </div>
                        {APPS.map((app) => (
                            <a
                                key={app.name}
                                href={app.url}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 group transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-black uppercase tracking-widest text-[10px] text-text-primary group-hover:text-primary transition-colors">
                                        {app.name}
                                    </span>
                                    <span className="text-[9px] text-text-muted font-medium mt-1 uppercase tracking-tighter opacity-60">
                                        {app.description}
                                    </span>
                                </div>
                                {app.name === 'Portal' && (
                                    <div className="px-2 py-0.5 bg-primary/10 rounded-md">
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-primary">Core</span>
                                    </div>
                                )}
                                <div className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <path d="M5 12h14m-7-7 7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
