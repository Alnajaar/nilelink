"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, BarChart3, Loader2 } from 'lucide-react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { Card } from '@/shared/components/Card';

export default function RootPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRedirecting(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 800);
        }, 2000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <UniversalHeader appName="Investor Dashboard" />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Card className="max-w-md w-full p-8 flex flex-col items-center shadow-xl border-border-strong">
                    <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                        <ShieldCheck size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-text-main mb-2">Protocol Treasury</h1>
                    <p className="text-text-muted mb-8 text-sm">Real-time revenue analytics & governance auditing.</p>

                    <div className="w-full bg-background-subtle rounded-lg p-4 mb-6 border border-border-subtle">
                        <div className="flex items-center justify-between text-xs font-mono text-text-subtle mb-2">
                            <span>Ledger Integrity</span>
                            <span className="text-success font-bold">VERIFIED</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-text-main">
                            <BarChart3 size={12} className="text-primary" />
                            <span>Syncing economic indicators...</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        {isRedirecting ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Authenticating access...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                                <Loader2 className="animate-spin text-primary" size={18} />
                                <span>Connecting to consensus layer...</span>
                            </div>
                        )}
                    </div>
                </Card>

                <p className="mt-8 text-xs text-text-subtle font-mono uppercase tracking-widest">
                    v1.0.4 • Governance Active
                </p>
            </main>
        </div>
    );
}
