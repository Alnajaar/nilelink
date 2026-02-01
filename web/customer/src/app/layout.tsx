import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@shared/globals.shared.css";
import { Providers } from '../components/Providers';
import { ORGANIZATION_SCHEMA } from "../utils/schema";
import { UniversalNavbar } from '@shared/components/UniversalNavbar';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
// Footer removed per user request
import BottomNav from '@/components/BottomNav';
import AIAssistant from '@/components/AIAssistant';
import { ReferralTracker } from '@/components/ReferralTracker';
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "NileLink Customer | Personal Economic Ledger",
        template: "%s | NileLink Customer"
    },
    description: "Manage your personal interactions with the NileLink Ecosystem. Order tracking, wallet management, and verified transparency.",
    icons: {
        icon: '/shared/assets/logo/logo-icon.ico',
        apple: '/shared/assets/logo/logo-square.png',
    },
    manifest: '/manifest.json',
};

// Force dynamic rendering for auth-dependent pages


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(ORGANIZATION_SCHEMA)
                    }}
                />
            </head>
            <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
                <Providers>
                    <ErrorBoundary>
                        <UniversalNavbar context="customer" />
                        <main className="flex-1 pb-20">
                            {children}
                        </main>
                        <BottomNav />
                        <Suspense fallback={null}>
                            <ReferralTracker />
                        </Suspense>
                        <AIAssistant />
                    </ErrorBoundary>
                </Providers>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', () => {
                                    navigator.serviceWorker.register('/sw.js').then(reg => {
                                        console.log('NileLink Customer Service Worker Registered', reg.scope);
                                    }).catch(err => {
                                        console.error('NileLink Customer SW Registration Failed', err);
                                    });
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
