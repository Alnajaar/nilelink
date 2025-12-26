import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CustomerProvider } from '@/contexts/CustomerContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { UniversalHeader } from "@/components/shared/UniversalHeader";
import { UniversalFooter } from "@/components/shared/UniversalFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NileLink | Decentralized Economic OS",
    description: "Operating the daily economy with events, ledger, and blockchain verified transparency.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-background-light text-text-primary min-h-screen flex flex-col`}>
                <AuthProvider>
                    <CustomerProvider>
                        <UniversalHeader appName="Customer" />
                        <main className="flex-1">
                            {children}
                        </main>
                        <UniversalFooter />
                    </CustomerProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
