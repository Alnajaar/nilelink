"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function UniversalNavbar() {
    return (
        <nav className="bg-primary-dark text-background-light px-6 lg:px-12 py-4 flex items-center justify-between shadow-lg">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-background-light rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Zap size={22} className="text-primary-dark" fill="currentColor" />
                </div>
                <span className="text-2xl font-bold text-background-light uppercase">NileLink</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
                <Link href="#ecosystem" className="text-background-light hover:text-secondary-soft transition-colors font-medium">
                    Ecosystem
                </Link>
                <Link href="#how-it-works" className="text-background-light hover:text-secondary-soft transition-colors font-medium">
                    How It Works
                </Link>
                <Link href="/docs" className="text-background-light hover:text-secondary-soft transition-colors font-medium">
                    Documentation
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    href="#ecosystem"
                    className="bg-secondary-soft text-primary-dark px-6 py-2 rounded-lg font-medium hover:bg-secondary-dark transition-colors"
                >
                    Enter Ecosystem
                </Link>
            </div>
        </nav>
    );
}
