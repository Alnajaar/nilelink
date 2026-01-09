import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UniversalHeader } from "@shared/components/UniversalHeader";
import { UniversalFooter } from "@shared/components/UniversalFooter";
import { AuthProvider } from "@shared/contexts/AuthContext";
import { WalletProvider } from "@shared/contexts/WalletContext";
import { NotificationProvider } from "@shared/contexts/NotificationContext";
import { CurrencyProvider } from "@shared/contexts/CurrencyContext";
import { DemoProvider } from "@shared/contexts/DemoContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "NileLink Supply | Inventory Protocol",
        template: "%s | NileLink Supply"
    },
    description: "Real-time inventory and supply chain transparency for the global economy.",
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
                    <WalletProvider>
                        <CurrencyProvider>
                            <AuthProvider>
                                <NotificationProvider>
                                    <UniversalHeader
                                        appName="Supplier"
                                    />
                                    <main className="flex-1">
                                        {children}
                                    </main>
                                    <UniversalFooter />
                                </NotificationProvider>
                            </AuthProvider>
                        </CurrencyProvider>
                    </WalletProvider>
                </DemoProvider>
            </body>
        </html>
    );
}
