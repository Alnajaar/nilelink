"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { walletProviderManager, WalletConnectionResult } from '../services/WalletProviderManager';

export interface WalletState {
    address: string | null;
    balance: string | null;
    chainId: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    provider: any | null; // Added to store the actual provider instance
}

interface WalletContextType {
    wallet: WalletState;
    connectWallet: (walletType?: string) => Promise<void>;
    disconnectWallet: () => Promise<void>;
    switchChain: (chainId: number) => Promise<void>;
    refreshBalance: () => Promise<void>;
    signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [wallet, setWallet] = useState<WalletState>({
        address: null,
        balance: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        error: null,
        provider: null
    });

    // Initialize wallet on mount and listen for changes
    useEffect(() => {
        // Subscribe to connection changes from the manager
        const unsubscribe = walletProviderManager.onConnectionChange(async (result: WalletConnectionResult) => {
            if (result.success && result.address && result.provider) {
                try {
                    // Fetch balance and network if successful
                    let balance = '0';
                    let chainId = 1;

                    // Different providers have different ways to get this info
                    // Ethers v6 BrowserProvider
                    if (result.provider instanceof ethers.BrowserProvider || result.provider.getNetwork) {
                        const network = await result.provider.getNetwork();
                        const bal = await result.provider.getBalance(result.address);
                        chainId = Number(network.chainId);
                        balance = ethers.formatEther(bal);
                    }

                    setWallet(prev => ({
                        ...prev,
                        address: result.address!,
                        provider: result.provider,
                        balance,
                        chainId,
                        isConnected: true,
                        isConnecting: false,
                        error: null
                    }));

                    // Store for auto-connect
                    localStorage.setItem('nilelink_wallet_type', result.walletType || 'generic');

                } catch (err) {
                    console.error('Error fetching wallet details after connection:', err);
                    // Still set connected state, just missing details
                    setWallet(prev => ({
                        ...prev,
                        address: result.address!,
                        provider: result.provider,
                        isConnected: true,
                        isConnecting: false,
                        error: null
                    }));
                }
            } else if (result.success === false) {
                setWallet(prev => ({
                    ...prev,
                    isConnecting: false,
                    error: result.error || 'Connection failed'
                }));
            } else {
                // Disconnected
                setWallet({
                    address: null,
                    balance: null,
                    chainId: null,
                    isConnected: false,
                    isConnecting: false,
                    error: null,
                    provider: null
                });
            }
        });

        // Attempt Auto-Connect
        const storedWalletType = localStorage.getItem('nilelink_wallet_type');
        if (storedWalletType) {
            // Check if provider is actually available before trying
            const provider = walletProviderManager.getProvider(storedWalletType as any);
            if (provider && provider.isSupported && provider.isInstalled) {
                // Silent connect if possible, or just wait for user action
                // For many wallets, we probably shouldn't auto-popup on load unless authorized
                // Here we can try to see if they are already connected in the background
            }
        }

        return () => {
            unsubscribe();
        };
    }, []);


    const connectWallet = async (walletType: string = 'metamask') => {
        setWallet(prev => ({ ...prev, isConnecting: true, error: null }));
        // The manager will emit events that update our state via the useEffect hook
        await walletProviderManager.connect(walletType as any);
    };

    const disconnectWallet = async () => {
        localStorage.removeItem('nilelink_wallet_type');
        await walletProviderManager.disconnect();
        // The manager will emit disconnect event
    };

    const switchChain = async (chainId: number) => {
        if (!wallet.provider) return;

        try {
            const chainIdHex = `0x${chainId.toString(16)}`;

            // Assuming EIP-1193 compatible provider
            if (wallet.provider.send) {
                await wallet.provider.send('wallet_switchEthereumChain', [{ chainId: chainIdHex }]);
            } else if (window.ethereum) {
                // Fallback for some
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainIdHex }],
                });
            }

        } catch (err: any) {
            console.error('Switch chain error:', err);
            // Handle 4902 (Chain not found) -> Add chain logic could go here
            setWallet(prev => ({ ...prev, error: err.message }));
            throw err;
        }
    };

    const refreshBalance = async () => {
        if (!wallet.address || !wallet.provider) return;

        try {
            if (wallet.provider.getBalance) {
                const bal = await wallet.provider.getBalance(wallet.address);
                setWallet(prev => ({
                    ...prev,
                    balance: ethers.formatEther(bal)
                }));
            }
        } catch (err) {
            console.error('Error refreshing balance:', err);
        }
    };

    const signMessage = async (message: string): Promise<string> => {
        const currentProvider = walletProviderManager.getCurrentProvider();
        if (!wallet.address || !currentProvider) { // Check via manager as well
            throw new Error('Wallet not connected');
        }

        // We need the signer from the connection result, typically stored in manager or we can re-derive it
        // The manager's connect returns { signer }, but we only stored provider in state.
        // Let's re-acquire signer from provider for now if it's an ethers provider.

        try {
            if (wallet.provider instanceof ethers.BrowserProvider) {
                const signer = await wallet.provider.getSigner();
                return await signer.signMessage(message);
            } else if ((window as any).ethereum) {
                // Fallback
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                return await signer.signMessage(message);
            }

            throw new Error("Provider does not support signing or is unknown type");

        } catch (err: any) {
            console.error('Sign message error:', err);
            throw err;
        }
    };

    return (
        <WalletContext.Provider
            value={{
                wallet,
                connectWallet,
                disconnectWallet,
                switchChain,
                refreshBalance,
                signMessage,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};
