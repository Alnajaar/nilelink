import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { WalletProvider } from "@shared/contexts/WalletContext";
import SimpleWeb3Provider from "@shared/components/SimpleWeb3Provider";
import { UniversalHeader } from "@/components/shared/UniversalHeader";
import { UniversalFooter } from "@/components/shared/UniversalFooter";

import { DemoProvider } from '@shared/contexts/DemoContext';
import { DemoModeBanner } from '@shared/components/ModeBanner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "NileLink Dashboard | Investor Terminal",
        template: "%s | NileLink Dashboard"
    },
    description: "Monitor and optimize high-frequency commercial assets across the NileLink protocol.",
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
            <body className={`${inter.className} bg-background-light text-text-primary min-h-screen flex flex-col`}>
                <DemoProvider>
                    <DemoModeBanner />
                    <SimpleWeb3Provider>
                        <WalletProvider>
                            <AuthProvider>
                                <UniversalHeader
                                    appName="Dashboard"
                                    links={[
                                        { href: '/assets', label: 'Assets' },
                                        { href: '/yield', label: 'Staking' },
                                        { href: '/governance', label: 'DAO' }
                                    ]}
                                />
                                <main className="flex-1">
                                    {children}
                                </main>
                                <UniversalFooter />
                            </AuthProvider>
                        </WalletProvider>
                    </SimpleWeb3Provider>
                </DemoProvider>
            </body>
        </html>
    );
}
