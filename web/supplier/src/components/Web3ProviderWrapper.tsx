'use client';

import React, { ReactNode } from 'react';
import Web3Provider from '@shared/components/Web3Provider';

export default function Web3ProviderWrapper({ children }: { children: ReactNode }) {
    return <Web3Provider>{children}</Web3Provider>;
}
