import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../../shared/contexts/AuthContext";
import { WalletProvider } from "../../../shared/contexts/WalletContext";
import { DemoProvider } from '../../../shared/contexts/DemoContext';

import { UniversalHeader } from '../../../shared/components/UniversalHeader';
import { UniversalFooter } from '../../../shared/components/UniversalFooter';
import { CurrencyProvider } from '../../../shared/contexts/CurrencyContext';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://nilelink.app'),
    title: {
        default: "NileLink | Decentralized Economic OS",
        template: "%s | NileLink"
    },
    description: "Operating the daily economy with events, ledger, and blockchain verified transparency. The world's first high-frequency commerce protocol.",
    keywords: ["decentralized commerce", "POS terminal", "supply chain protocol", "blockchain verified", "economic OS", "retail infrastructure"],
    authors: [{ name: "NileLink Protocol Foundation" }],
    creator: "NileLink Protocol Foundation",
    publisher: "NileLink Protocol Foundation",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://nilelink.app",
        siteName: "NileLink Protocol",
        title: "NileLink | Decentralized Economic OS",
        description: "Secure, trustless, and infinitely scalable infrastructure for the global economy.",
        images: [
            {
                url: "/shared/assets/logo/logo-square.png",
                width: 1200,
                height: 1200,
                alt: "NileLink Ecosystem Protocol",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "NileLink | Decentralized Economic OS",
        description: "Secure, trustless, and infinitely scalable infrastructure for the global economy.",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-background-light text-primary antialiased flex flex-col min-h-screen`}>
                <AuthProvider>
                    <DemoProvider>
                        <WalletProvider>
                            <CurrencyProvider>
                                <UniversalHeader
                                    appName="Portal"
                                    links={[
                                        { href: '/demo', label: 'Protocol Demo' },
                                        { href: '/#features', label: 'Nodes' },
                                        { href: '/docs', label: 'Documentation' }
                                    ]}
                                />
                                <main className="flex-grow">
                                    {children}
                                </main>
                                <UniversalFooter />
                            </CurrencyProvider>
                        </WalletProvider>
                    </DemoProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
