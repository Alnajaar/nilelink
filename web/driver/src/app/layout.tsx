import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@shared/globals.shared.css";
import { AuthProvider } from '@shared/providers/AuthProvider';

import { DemoProvider } from '@shared/contexts/DemoContext';
import Web3Provider from '@shared/components/Web3Provider';

import { UniversalNavbar } from '@shared/components/UniversalNavbar';
import GlobalFooter from '@shared/components/GlobalFooter';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NileLink Driver | Delivery & Logistics",
    template: "%s | NileLink Driver"
  },
  description: "Real-time delivery management and logistics coordination for NileLink drivers.",
  icons: {
    icon: '/shared/assets/logo/logo-icon.ico',
    apple: '/shared/assets/logo/logo-square.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <DemoProvider>
          <Web3Provider>
            <AuthProvider requiredRole="DRIVER" appName="NileLink Driver">
              <UniversalNavbar />
              <main className="flex-1 pt-20 pb-20">
                {children}
              </main>
              <GlobalFooter showNewsletter={false} />\  
            </AuthProvider>
          </Web3Provider>
        </DemoProvider>
      </body>
    </html>
  );
}
