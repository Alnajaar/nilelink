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
    // Removed provider from state to avoid serialization issues
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
        error: null
    });

    // Initialize wallet on mount and listen for changes
    useEffect(() => {
        // Subscribe to connection changes from the manager
        const unsubscribe = walletProviderManager.onConnectionChange(async (result: WalletConnectionResult) => {
            if (result.success && result.address) {
                try {
                    // Fetch balance and network if successful
                    let balance = '0';
                    let chainId = 1;

                    // Get provider from manager to fetch balance
                    const provider = walletProviderManager.getCurrentProvider();
                    if (provider) {
                        try {
                            // Different providers have different ways to get this info
                            // Ethers v6 BrowserProvider
                            if (provider instanceof ethers.BrowserProvider || provider.getNetwork) {
                                const network = await provider.getNetwork();
                                const bal = await provider.getBalance(result.address!);
                                chainId = Number(network.chainId);
                                balance = ethers.formatEther(bal);
                            } else {
                                // Default to Amoy if unknown
                                chainId = 80002;
                            }
                        } catch (err) {
                            console.error('Error fetching wallet details:', err);
                            // Default values
                            chainId = 80002;
                            balance = '0';
                        }
                    }

                    setWallet(prev => ({
                        ...prev,
                        address: result.address!,
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
                    error: null
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
        try {
            const chainIdHex = `0x${chainId.toString(16)}`;
            const provider = walletProviderManager.getCurrentProvider();

            // Assuming EIP-1193 compatible provider
            if (provider && (provider as any).send) {
                await (provider as any).send('wallet_switchEthereumChain', [{ chainId: chainIdHex }]);
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
        if (!wallet.address) return;

        try {
            const provider = walletProviderManager.getCurrentProvider();
            if (provider && (provider as any).getBalance) {
                const bal = await (provider as any).getBalance(wallet.address);
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
        if (!wallet.address || !currentProvider) {
            throw new Error('Wallet not connected');
        }

        // We need the signer from the connection result
        try {
            if (currentProvider instanceof ethers.BrowserProvider) {
                const signer = await currentProvider.getSigner();
                return await signer.signMessage(message);
            } else if ((window as any).ethereum) {
                // Fallback
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                return await signer.signMessage(message);
            }

            throw new Error("Provider does not support signing or is unknown type");
        } catch (err: any) {
            setWallet(prev => ({ ...prev, error: err.message }));
            throw err;
        }
    };

    return (
        <WalletContext.Provider value={{
            wallet,
            connectWallet,
            disconnectWallet,
            switchChain,
            refreshBalance,
            signMessage
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}