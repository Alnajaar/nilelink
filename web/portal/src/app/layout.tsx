import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UniversalHeader } from "@/shared/components/UniversalHeader";
import { UniversalFooter } from "@/shared/components/UniversalFooter";

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
                <UniversalHeader appName="Portal" />
                <main className="flex-1">
                    {children}
                </main>
                <UniversalFooter />
            </body>
        </html>
    );
}
