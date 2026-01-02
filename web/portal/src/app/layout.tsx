import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@shared/contexts/WalletContext";
import { UniversalFooter } from "@/shared/components/UniversalFooter";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
                url: "https://nilelink.app/og-image.png",
                width: 1200,
                height: 630,
                alt: "NileLink Ecosystem Dashboard",
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
                    <body className={`${inter.className} bg-background-light text-primary antialiased`}>
                        <WalletProvider>
                            <ThemeProvider>
                                {children}
                                <div className="mt-auto">
                                    <UniversalFooter />
                                </div>
                            </ThemeProvider>
                        </WalletProvider>
                    </body>
                </html>
            );
}
