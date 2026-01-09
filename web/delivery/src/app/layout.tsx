import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@shared/contexts/AuthContext';
import { WalletProvider } from '@shared/contexts/WalletContext';

import { DemoProvider } from '@shared/contexts/DemoContext';
import { DemoModeBanner } from '@shared/components/ModeBanner';
import { UniversalHeader } from '@shared/components/UniversalHeader';
import { HapticHUD } from '@shared/components/HapticHUD';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "NileLink Fleet | Delivery Protocol",
        template: "%s | NileLink Fleet"
    },
    description: "Logistics and routing protocol for the NileLink Decentralized Economic OS.",
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
            <body className={`${inter.className} bg-background-light`}>
                <DemoProvider>
                    <HapticHUD />
                    <DemoModeBanner />
                    <WalletProvider>
                        <AuthProvider>
                            <UniversalHeader
                                appName="Fleet"
                                links={[
                                    { href: '/driver/dashboard', label: 'Command' },
                                    { href: '/routes', label: 'Routes' },
                                    { href: '/demo', label: 'Fleet Demo' }
                                ]}
                            />
                            {children}
                        </AuthProvider>
                    </WalletProvider>
                </DemoProvider>
            </body>
        </html>
    );
}
