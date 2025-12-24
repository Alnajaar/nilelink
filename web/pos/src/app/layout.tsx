import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { POSProvider } from '@/contexts/POSContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'NileLink POS | Event-Based Point of Sale',
    description: 'Offline-first, protocol-native POS system with complete audit trail and cash accountability.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="mesh-bg" />
                <POSProvider>
                    {children}
                </POSProvider>
            </body>
        </html>
    );
}
