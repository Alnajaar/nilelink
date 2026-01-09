"use client";

import React, { useState, useContext, createContext } from 'react';
import { DemoProvider } from '@shared/contexts/DemoContext';
import { DemoModeBanner } from '@shared/components/ModeBanner';
import { UniversalHeader } from '@shared/components/UniversalHeader';

const AuthContext = createContext({ isConnected: false, connect: () => { } });

export const useAuth = () => useContext(AuthContext);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <DemoProvider>
      <DemoModeBanner />
      <AuthContext.Provider value={{ isConnected, connect: () => setIsConnected(true) }}>
        <UniversalHeader
          appName="Invest"
          links={[
            { name: 'Dashboard', href: '/dashboard', showWhenConnected: true },
            { name: 'Portfolio', href: '/portfolio', showWhenConnected: true },
            { name: 'Analytics', href: '/analytics', showWhenConnected: true },
            { name: 'Governance', href: '/governance', showWhenConnected: true }
          ].filter(item => isConnected || !item.showWhenConnected).map(item => ({ href: item.href, label: item.name }))}
          user={isConnected ? { name: "Nile Investor", role: "Yield Manager" } : undefined}
          onLogin={() => setIsConnected(true)}
          onLogout={() => setIsConnected(false)}
        />

        <main className="pt-20">
          {children}
        </main>
      </AuthContext.Provider>
    </DemoProvider>
  );
}