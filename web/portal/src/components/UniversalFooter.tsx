"use client";

import React from 'react';
import { Zap, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function UniversalFooter() {
    return (
        <footer className="bg-accent-dark text-background-light py-12">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                    <div>
                        <h4 className="font-bold text-background-light mb-4">Status</h4>
                        <div className="w-3 h-3 bg-success-default rounded-full mx-auto animate-pulse"></div>
                        <span className="text-sm text-background-light mt-2 block">Live</span>
                    </div>

                    <Link href="/privacy" className="hover:text-secondary-soft transition-colors">
                        <h4 className="font-bold text-background-light mb-2">Privacy</h4>
                    </Link>

                    <Link href="/terms" className="hover:text-secondary-soft transition-colors">
                        <h4 className="font-bold text-background-light mb-2">Terms</h4>
                    </Link>

                    <Link href="/docs" className="hover:text-secondary-soft transition-colors">
                        <h4 className="font-bold text-background-light mb-2">Documentation</h4>
                    </Link>

                    <div>
                        <h4 className="font-bold text-background-light mb-2">Protocol Version</h4>
                        <span className="text-sm text-background-light">v1.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
