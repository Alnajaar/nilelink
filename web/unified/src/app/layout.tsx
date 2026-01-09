import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageTransition } from '@/shared/components/PageTransition';
import { AuthProvider } from "../shared/contexts/AuthContext";
import { WalletProvider } from "../../../shared/contexts/WalletContext";
import { DemoProvider } from "@shared/contexts/DemoContext";
import { DemoModeBanner } from "@shared/components/ModeBanner";
import { UniversalHeader } from "@shared/components/UniversalHeader";
import { CurrencyProvider } from "@/shared/contexts/CurrencyContext";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700", "900"] });

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: {
        default: "NileLink Unified | Command Console",
        template: "%s | NileLink Unified"
    },
    description: "Centralized administrative orchestration for the NileLink Global Protocol.",
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
            <body className={`${inter.className} bg-background text-main min-h-screen flex flex-col antialiased`}>
                <DemoProvider>
                    <DemoModeBanner />
                    <CurrencyProvider>
                        <WalletProvider>
                            <AuthProvider>
                                <UniversalHeader
                                    appName="Command"
                                    links={[
                                        { href: '/admin', label: 'Control' },
                                        { href: '/orchestration', label: 'Network' },
                                        { href: '/analytics', label: 'Intelligence' }
                                    ]}
                                />
                                <PageTransition className="flex-1 flex flex-col">
                                    {children}
                                </PageTransition>
                            </AuthProvider>
                        </WalletProvider>
                    </CurrencyProvider>
                </DemoProvider>
            </body>
        </html>
    );
}
