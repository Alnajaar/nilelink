'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';

// Project ID from WalletConnect Cloud (Use a valid demo ID for now, replacing the Alchemy Key)
// NOTE: Get a fresh Project ID from https://cloud.walletconnect.com/ for production
const projectId = '3a8170812b534d0ff9d794f19a901d64';

// Metadata
const metadata = {
    name: 'NileLink Protocol',
    description: 'Decentralized Supply Chain & Logistics Protocol',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://nilelink.app',
    icons: ['https://nilelink.app/assets/logo/logo-square.png']
};

// Create wagmi config manually
const config = createConfig({
    chains: [polygonAmoy, polygon],
    transports: {
        [polygonAmoy.id]: http('https://polygon-amoy.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r'),
        [polygon.id]: http('https://polygon-mainnet.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r')
    },
    connectors: [
        walletConnect({ projectId, metadata, showQrModal: false }),
    ],
    ssr: true,
});

// Create Web3Modal
createWeb3Modal({
    wagmiConfig: config,
    projectId,
    themeMode: 'dark',
    themeVariables: {
        '--w3m-color-mix': '#1a1a1a',
        '--w3m-color-mix-strength': 40
    },
    enableAnalytics: false // Disable analytics to prevent 403s on restricted IDs
});

interface Web3ProviderProps {
    children: ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
    const [queryClient] = useState(() => new QueryClient());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Export hooks for use in components
export { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';