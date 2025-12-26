import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageTransition } from '@/shared/components/PageTransition';

import { AuthProvider } from "../shared/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NileLink | Decentralized Economic OS",
    description: "Operating the daily economy with events, ledger, and blockchain verified transparency.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-background text-text-main min-h-screen flex flex-col`}>
                <AuthProvider>
                    <PageTransition className="flex-1 flex flex-col">
                        {children}
                    </PageTransition>
                </AuthProvider>
            </body>
        </html>
    );
}
