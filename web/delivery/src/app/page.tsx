"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // Simple redirect to the driver portal
        // In a real prod env, we might check for an existing session here
        const timer = setTimeout(() => {
            router.push('/driver/login');
        }, 1500);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-nile-dark mb-8 animate-bounce shadow-2xl shadow-emerald-500/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            </div>

            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">NileLink Delivery</h1>
            <p className="text-[10px] font-black text-nile-silver/20 uppercase tracking-[0.5em] mb-12">Protocol Node v0.1.0</p>

            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={24} />
                <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Waking Up Local Ledger...</span>
            </div>
        </div>
    );
}
