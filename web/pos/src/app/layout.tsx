import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { POSProvider } from '@/contexts/POSContext';
import { UniversalFooter } from '@/components/shared/UniversalFooter';
import { POSHeaderWrapper } from '@/components/POSHeaderWrapper';
import { AuthProvider } from '@/shared/contexts/AuthContext';

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
            <body className={`${inter.className} bg-background-light text-text-primary min-h-screen flex flex-col`}>
                <AuthProvider>
                    <POSProvider>
                        <POSHeaderWrapper />
                        <main className="flex-1">
                            {children}
                        </main>
                        <UniversalFooter />
                    </POSProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
