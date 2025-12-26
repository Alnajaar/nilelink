"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { Card } from '@/shared/components/Card';

export default function PosHome() {
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const timer = setTimeout(() => {
            router.push('/auth/login');
        }, 1500);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <UniversalHeader appName="POS Terminal" />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Card className="max-w-md w-full p-8 flex flex-col items-center shadow-xl border-border-strong">
                    <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                        <Store size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-text-main mb-2">Merchant Terminal</h1>
                    <p className="text-text-muted mb-8 text-sm">Offline-first point of sale system.</p>

                    <div className="w-full bg-background-subtle rounded-lg p-4 mb-6 border border-border-subtle">
                        <div className="flex items-center justify-between text-xs font-mono text-text-subtle mb-2">
                            <span>Connection Mode</span>
                            <span className={isOnline ? "text-success font-bold" : "text-warning font-bold"}>
                                {isOnline ? "CLOUD SYNC" : "LOCAL ONLY"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-text-main">
                            {isOnline ? <Wifi size={12} className="text-primary" /> : <WifiOff size={12} className="text-warning" />}
                            <span>{isOnline ? "Syncing with ledger..." : "Using local database"}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Loader2 className="animate-spin" size={18} />
                            <span>Initializing terminal...</span>
                        </div>
                    </div>
                </Card>

                <p className="mt-8 text-xs text-text-subtle font-mono uppercase tracking-widest">
                    v2.1.0 • Device ID: {typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 12) : 'UNKNOWN'}
                </p>
            </main>
        </div>
    );
}
