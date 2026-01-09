"use client";

import { useState, useEffect, useCallback } from 'react';
import { blockchainClient } from '../lib/blockchain';

export interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        address: null,
        isConnected: false,
        isConnecting: false,
        error: null,
    });

    // Check if already connected on mount
    useEffect(() => {
        const checkConnection = () => {
            const address = blockchainClient.getConnectedAddress();
            const isConnected = blockchainClient.isWalletConnected();

            setState(prev => ({
                ...prev,
                address,
                isConnected,
            }));
        };

        checkConnection();
    }, []);

    const connect = useCallback(async (): Promise<string | null> => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const address = await blockchainClient.connectWallet();

            setState(prev => ({
                ...prev,
                address,
                isConnected: true,
                isConnecting: false,
                error: null,
            }));

            return address;
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: error.message || 'Failed to connect wallet',
            }));

            return null;
        }
    }, []);

    const disconnect = useCallback(() => {
        blockchainClient.disconnect();
        setState(prev => ({
            ...prev,
            address: null,
            isConnected: false,
            error: null,
        }));
    }, []);

    return {
        ...state,
        connect,
        disconnect,
    };
}