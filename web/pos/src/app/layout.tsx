import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { POSProvider } from '@/contexts/POSContext';
import { AuthProvider } from '@shared/contexts/AuthContext';
import { WalletProvider } from '@shared/contexts/WalletContext';
import Web3Provider from '@shared/components/Web3Provider';
import { NotificationProvider } from '@shared/contexts/NotificationContext';
import { SubscriptionProvider } from '@shared/contexts/SubscriptionContext';
import { POSLocationGuard } from '@/components/POSLocationGuard';
// import { SyncProvider } from '@/providers/SyncProvider'; // TODO: Re-enable after fixing React Native compatibility
import { CurrencyProvider } from '@shared/contexts/CurrencyContext';
import '@shared/globals.shared.css';
import './globals.css';

import { DemoProvider } from '@shared/contexts/DemoContext';
import { DemoModeBanner } from '@shared/components/ModeBanner';
import { HapticHUD } from '@shared/components/HapticHUD';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: {
        default: 'NileLink POS | Economic OS Terminal',
        template: '%s | NileLink POS'
    },
    description: 'Institutional-grade commerce terminal. Offline-first ledger sync and cryptographically secured settlement.',
    icons: {
        icon: '/shared/assets/logo/logo-icon.ico',
        apple: '/shared/assets/logo/logo-square.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-background text-text-main min-h-screen antialiased selection:bg-primary/10`}>
                <DemoProvider>
                    <HapticHUD />
                    <DemoModeBanner />
                    <Web3Provider>
                        <CurrencyProvider defaultLocalCurrency="AED">
                            <WalletProvider>
                                <AuthProvider>
                                    <SubscriptionProvider>
                                        <NotificationProvider>
                                            <POSProvider>
                                                <POSLocationGuard>
                                                    {children}
                                                </POSLocationGuard>
                                            </POSProvider>
                                        </NotificationProvider>
                                    </SubscriptionProvider>
                                </AuthProvider>
                            </WalletProvider>
                        </CurrencyProvider>
                    </Web3Provider>
                </DemoProvider>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', () => {
                                    navigator.serviceWorker.register('/sw.js').then(reg => {
                                        console.log('NileLink POS Service Worker Registered', reg.scope);
                                    }).catch(err => {
                                        console.error('NileLink POS SW Registration Failed', err);
                                    });
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
