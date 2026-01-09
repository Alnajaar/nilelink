"use client";

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useDemo } from '@/shared/contexts/DemoContext';
import { Button } from '@/shared/components/Button';

export const DemoBanner: React.FC = () => {
    const { isDemoMode, setDemoMode, showDemoBanner, dismissDemoBanner } = useDemo();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isDemoMode || !showDemoBanner) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-background border-b border-accent-light shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={20} className="text-background animate-pulse" />
                        <div>
                            <p className="font-bold text-sm uppercase tracking-widest text-background">DEMO MODE ACTIVE</p>
                            <p className="text-xs opacity-90 text-background">All transactions are simulated • No real money involved</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-3 py-1 h-8"
                            onClick={() => setDemoMode(false)}
                        >
                            Switch to Live
                        </Button>
                        <button
                            onClick={dismissDemoBanner}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            aria-label="Dismiss demo banner"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};