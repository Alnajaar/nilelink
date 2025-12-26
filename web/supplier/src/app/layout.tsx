import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UniversalHeader } from "@/components/shared/UniversalHeader";
import { UniversalFooter } from "@/components/shared/UniversalFooter";
import { AuthProvider } from "@/shared/contexts/AuthContext";

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
            <body className={`${inter.className} bg-background-light text-text-primary min-h-screen flex flex-col`}>
                <AuthProvider>
                    <UniversalHeader appName="Supplier Hub" />
                    <main className="flex-1">
                        {children}
                    </main>
                    <UniversalFooter />
                </AuthProvider>
            </body>
        </html>
    );
}
