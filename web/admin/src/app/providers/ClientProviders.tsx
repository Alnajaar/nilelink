'use client';

import { ReactNode } from 'react';
import Web3Provider from '@shared/components/Web3Provider';
import { AuthProvider } from '@shared/providers/AuthProvider';

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <Web3Provider>
            <AuthProvider
                requiredRole={['ADMIN', 'SUPER_ADMIN']}
                appName="NileLink Admin"
                theme="dark"
                showRegister={false}
                initialEmail="nilelinkpos@gmail.com"
                initialPassword="DGGASHdggash@100%"
            >
                {children}
            </AuthProvider>
        </Web3Provider>
    );
}
