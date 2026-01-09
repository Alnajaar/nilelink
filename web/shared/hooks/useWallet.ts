"use client";

import { useState, useEffect, useCallback } from 'react';
import { walletProviderManager, WalletConnectionResult } from '../services/WalletProviderManager';

export interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    isSupported: boolean;
    availableProviders: any[];
    selectedProvider: any;
}

export function useWallet() {
    const [state, setState] = useState<WalletState>({
        address: null,
        isConnected: false,
        isConnecting: false,
        error: null,
        isSupported: false,
        availableProviders: [],
        selectedProvider: null,
    });

    // Initialize wallet providers on mount
    useEffect(() => {
        const providers = walletProviderManager.getAvailableProviders();
        const selected = walletProviderManager.getCurrentProvider();

        setState(prev => ({
            ...prev,
            isSupported: providers.length > 0,
            availableProviders: providers,
            selectedProvider: selected,
        }));

        // Listen for connection changes
        const unsubscribe = walletProviderManager.onConnectionChange((result: WalletConnectionResult) => {
            setState(prev => ({
                ...prev,
                address: result.success ? (result.address || null) : null,
                isConnected: result.success || false,
                isConnecting: false,
                error: result.success ? null : (result.error || 'Connection failed'),
            }));
        });

        return unsubscribe;
    }, []);

    const connect = useCallback(async (walletType?: string): Promise<string | null> => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Use provided wallet type or auto-detect
            const typeToConnect = walletType || 'metamask'; // Default to MetaMask

            const result = await walletProviderManager.connect(typeToConnect as any);

            if (result.success) {
                setState(prev => ({
                    ...prev,
                    selectedProvider: walletProviderManager.getCurrentProvider(),
                }));
                return result.address || null;
            } else {
                throw new Error(result.error || 'Failed to connect wallet');
            }
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: error.message || 'Failed to connect wallet',
            }));

            return null;
        }
    }, []);

    const disconnect = useCallback(async () => {
        await walletProviderManager.disconnect();

        setState(prev => ({
            ...prev,
            address: null,
            isConnected: false,
            error: null,
        }));
    }, []);

    const selectProvider = useCallback((provider: any) => {
        setState(prev => ({ ...prev, selectedProvider: provider }));
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        selectProvider,
    };
}