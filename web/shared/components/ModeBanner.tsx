"use client";

import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from './Button';

interface DemoModeBannerProps {
    className?: string;
}

export function DemoModeBanner({ className = '' }: DemoModeBannerProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={`h-[50px] bg-primary/10 border-b-2 border-primary/20 ${className}`} />;

    return (
        <div className={`bg-primary/10 border-b-2 border-primary/20 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-primary" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-sm font-black uppercase tracking-widest text-primary">
                            🧪 Demo Mode
                        </span>
                        <span className="text-xs font-medium text-text opacity-60">
                            Simulated data • No real transactions
                        </span>
                    </div>
                </div>
                <Link href="/get-started">
                    <Button
                        size="sm"
                        className="h-8 px-4 bg-primary text-background font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-primary/90 hidden sm:block"
                    >
                        Upgrade to Live
                    </Button>
                </Link>
            </div>
        </div>
    );
}

interface LiveModeBannerProps {
    className?: string;
}

export function LiveModeBanner({ className = '' }: LiveModeBannerProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={`h-[50px] bg-emerald-500/10 border-b-2 border-emerald-500/20 ${className}`} />;

    return (
        <div className={`bg-emerald-500/10 border-b-2 border-emerald-500/20 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-sm font-black uppercase tracking-widest text-emerald-700">
                            🚀 Live Mode
                        </span>
                        <span className="text-xs font-medium text-text opacity-60">
                            Real transactions • Production environment
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                    <div className="text-[9px] font-black uppercase tracking-widest text-text opacity-40">
                        All systems operational
                    </div>
                </div>
            </div>
        </div>
    );
}

interface WarningBannerProps {
    message: string;
    className?: string;
}

export function WarningBanner({ message, className = '' }: WarningBannerProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={`h-[50px] bg-yellow-500/10 border-b-2 border-yellow-500/20 ${className}`} />;

    return (
        <div className={`bg-yellow-500/10 border-b-2 border-yellow-500/20 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
                <AlertCircle size={20} className="text-yellow-600 shrink-0" />
                <span className="text-sm font-medium text-text">
                    {message}
                </span>
            </div>
        </div>
    );
}

export const ModeBanner = ({ mode, className = '' }: { mode: 'demo' | 'live' | 'warning', className?: string, message?: string }) => {
    if (mode === 'demo') return <DemoModeBanner className={className} />;
    if (mode === 'live') return <LiveModeBanner className={className} />;
    return <WarningBanner message="System Notification" className={className} />;
};
