"use client";

import React from 'react';
import Web3ProviderWrapper from './Web3ProviderWrapper';
import { DemoProvider } from '@shared/contexts/DemoContext';
import { AuthProvider } from '@shared/providers/AuthProvider';
import { CustomerProvider } from '../contexts/CustomerContext';
import { WalletProvider } from '@shared/contexts/WalletContext';
import { NotificationProvider } from '@shared/contexts/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DemoProvider>
            <Web3ProviderWrapper>
                <WalletProvider>
                    <AuthProvider mandatory={false}>
                        <CustomerProvider>
                            <NotificationProvider>
                                {children}
                            </NotificationProvider>
                        </CustomerProvider>
                    </AuthProvider>
                </WalletProvider>
            </Web3ProviderWrapper>
        </DemoProvider>
    );
}


