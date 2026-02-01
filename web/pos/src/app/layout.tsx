import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ClientProviders } from '@/providers/ClientProviders';
import { POSErrorBoundary } from '@/components/common/POSErrorBoundary';
import '@shared/globals.shared.css';
import './globals.css';
import '@/styles/pos-design-system.css';
import '@/styles/mobile-optimization.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

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
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${inter.variable} bg-pos-bg-primary text-pos-text-primary min-h-screen antialiased selection:bg-primary/20 flex flex-col`}>
                <ClientProviders>
                    <POSErrorBoundary>
                        <main className="flex-1">
                            {children}
                        </main>
                    </POSErrorBoundary>
                </ClientProviders>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                                        console.log('NileLink POS Service Worker Registered');
                                    }).catch(function(err) {
                                        console.error('NileLink POS SW Registration Failed', err);
                                    });
                                });
                            }
                        `.replace(/\s+/g, ' '),
                    }}
                />
            </body>
        </html>
    );
}
