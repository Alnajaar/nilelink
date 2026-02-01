'use client';

import React, { ReactNode, useMemo, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonAmoy, mainnet, polygon, base, baseSepolia } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

export default function Web3Provider({ children }: { children: ReactNode }) {
    // 1. Project ID determination
    const PROJECT_ID = useMemo(() => {
        const raw = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        return (raw && raw.length > 10) ? raw : '8fb92795c65f2479f64ac2b2b11542f2';
    }, []);

    // 2. Wagmi/RainbowKit Config (Memoized to prevent reinits)
    const config = useMemo(() => getDefaultConfig({
        appName: 'NileLink Ecosystem',
        projectId: PROJECT_ID,
        chains: [polygonAmoy, polygon, mainnet, base, baseSepolia],
        transports: {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [base.id]: http(),
            [polygonAmoy.id]: http(),
            [baseSepolia.id]: http(),
        },
        ssr: true,
    }), [PROJECT_ID]);

    // 3. Query Client
    const queryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 5000,
            },
        },
    }), []);

    // We MUST render WagmiProvider even during SSR/Hydration to avoid 
    // WagmiProviderNotFoundError in children that use useAccount()
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}