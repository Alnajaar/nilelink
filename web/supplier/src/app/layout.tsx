import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UniversalNavbar } from "@shared/components/UniversalNavbar";
import GlobalFooter from "@shared/components/GlobalFooter.v2";
import { AuthProvider as FirebaseAuthProvider } from "@shared/contexts/AuthContext";
import { NotificationProvider } from "@shared/contexts/NotificationContext";
import { CurrencyProvider } from "@shared/contexts/CurrencyContext";
import { DemoProvider } from "@shared/contexts/DemoContext";
import Web3ProviderWrapper from "@/components/Web3ProviderWrapper";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "NileLink Supply | Inventory Protocol",
        template: "%s | NileLink Supply"
    },
    description: "Real-time inventory and supply chain transparency for the global economy.",
    icons: {
        icon: '/favicon.ico',
        apple: '/logo-square.png',
    },
    manifest: '/manifest.json',
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
                    <Web3ProviderWrapper>
                        <CurrencyProvider>
                            <FirebaseAuthProvider>
                                <NotificationProvider>
                                    <div className="flex flex-col min-h-screen">
                                        <UniversalNavbar context="supplier" />
                                        <main className="flex-1 pt-20">
                                            {children}
                                        </main>
                                        <GlobalFooter context="supplier" />
                                    </div>
                                </NotificationProvider>
                            </FirebaseAuthProvider>
                        </CurrencyProvider>
                    </Web3ProviderWrapper>
                </DemoProvider>
            </body>
        </html>
    );
}
