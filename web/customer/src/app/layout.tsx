import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import { CustomerProvider } from '../contexts/CustomerContext';
import { WalletProvider } from '@shared/contexts/WalletContext';
import { ORGANIZATION_SCHEMA } from "../utils/schema";

import { DemoProvider } from '@shared/contexts/DemoContext';
import { DemoModeBanner } from '@shared/components/ModeBanner';

import { UniversalHeader } from '@shared/components/UniversalHeader';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "NileLink Customer | Personal Economic Ledger",
        template: "%s | NileLink Customer"
    },
    description: "Manage your personal interactions with the NileLink Ecosystem. Order tracking, wallet management, and verified transparency.",
    icons: {
        icon: '/shared/assets/logo/logo-icon.ico',
        apple: '/shared/assets/logo/logo-square.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(ORGANIZATION_SCHEMA)
                    }}
                />
            </head>
            <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
                <DemoProvider>
                    <DemoModeBanner />
                    <WalletProvider>
                        <AuthProvider>
                            <CustomerProvider>
                                <UniversalHeader
                                    appName="Customer"
                                    links={[
                                        { href: '/orders', label: 'Orders' },
                                        { href: '/wallet', label: 'Wallet' },
                                        { href: '/settings', label: 'Settings' }
                                    ]}
                                />
                                <main className="flex-1 p-4 shadow-inner bg-white/40 backdrop-blur-sm rounded-3xl m-4 border border-white/20">
                                    {children}
                                </main>
                            </CustomerProvider>
                        </AuthProvider>
                    </WalletProvider>
                </DemoProvider>
            </body>
        </html>
    );
}
