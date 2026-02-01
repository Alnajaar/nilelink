'use client';

import { ReactNode, useState, useEffect } from 'react';
import { ClientProviders } from './ClientProviders';

export function SafeClientProviders({ children }: { children: ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // During SSR and first hydration pass, we show a clean loading state
    // This prevents the heavy Web3/Auth providers from causing hydration mismatches
    // or timing out the initial chunk load.
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="animate-pulse text-blue-500 font-black italic uppercase tracking-[0.3em] text-[10px]">
                    Establishing Secure Node connection...
                </div>
            </div>
        );
    }

    return <ClientProviders>{children}</ClientProviders>;
}
