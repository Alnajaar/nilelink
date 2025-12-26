"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, MapPin, Loader2 } from 'lucide-react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';

export default function RootPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Simulate checking for active session
        const timer = setTimeout(() => {
            setIsRedirecting(true);
            setTimeout(() => {
                router.push('/driver/login');
            }, 800);
        }, 2000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <UniversalHeader appName="Delivery Fleet" />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Card className="max-w-md w-full p-8 flex flex-col items-center shadow-xl border-border-strong">
                    <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                        <Truck size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-text-main mb-2">NileLink Logistics</h1>
                    <p className="text-text-muted mb-8 text-sm">Decentralized fleet management & route optimization.</p>

                    <div className="w-full bg-background-subtle rounded-lg p-4 mb-6 border border-border-subtle">
                        <div className="flex items-center justify-between text-xs font-mono text-text-subtle mb-2">
                            <span>System Status</span>
                            <span className="text-success font-bold">ONLINE</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-text-main">
                            <MapPin size={12} className="text-primary" />
                            <span>Locating nearest ledger node...</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        {isRedirecting ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Redirecting to secure login...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                                <Loader2 className="animate-spin text-primary" size={18} />
                                <span>Verifying device integrity...</span>
                            </div>
                        )}
                    </div>
                </Card>

                <p className="mt-8 text-xs text-text-subtle font-mono uppercase tracking-widest">
                    v1.0.4 • Driver Protocol Active
                </p>
            </main>
        </div>
    );
}
