'use client';

import React, { useState, useEffect } from 'react';
import { app } from '@/lib/firebase/config'; // Initialize Firebase app
import { POSProvider } from '@/contexts/POSContext';
import { AuthProvider, useAuth } from '@shared/providers/AuthProvider';
import { SocketProvider } from '@shared/contexts/SocketContext';
import Web3Provider from '@shared/components/Web3Provider'; // Use shared Web3 provider
import { NotificationProvider } from '@shared/contexts/NotificationContext';
import { SubscriptionProvider } from '@shared/contexts/SubscriptionContext';
import { POSLocationGuard } from '@/components/POSLocationGuard';
import { KioskMode } from '@/components/KioskMode';
import { CurrencyProvider } from '@shared/contexts/CurrencyContext';

import { BusinessProvider } from '@/contexts/BusinessContext';

function ClientProvidersInner({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { user } = useAuth();

    return (
        <SocketProvider user={user}>
            <SubscriptionProvider>
                <NotificationProvider>
                    <BusinessProvider>
                        <POSProvider>
                            <POSLocationGuard>
                                <KioskMode enabled={false}>
                                    {children}
                                </KioskMode>
                            </POSLocationGuard>
                        </POSProvider>
                    </BusinessProvider>
                </NotificationProvider>
            </SubscriptionProvider>
        </SocketProvider>
    );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
    // Initialize Firebase when component mounts
    useEffect(() => {
        // Firebase is initialized via the import
        console.log('Firebase initialized in ClientProviders');
    }, []);

    return (
        <Web3Provider> {/* Shared Web3 provider with RainbowKit */}
            <CurrencyProvider defaultLocalCurrency="AED">
                <AuthProvider
                    requiredRole={['RESTAURANT_OWNER', 'STAFF', 'ADMIN', 'SUPER_ADMIN']}
                    appName="NileLink POS"
                    mandatory={false}
                >
                    <ClientProvidersInner>
                        {children}
                    </ClientProvidersInner>
                </AuthProvider>
            </CurrencyProvider>
        </Web3Provider>
    );
}
