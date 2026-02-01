'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Simple Web3 Context
interface Web3ContextType {
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectWallet: () => Promise<string | null>;
    disconnectWallet: () => void;
    signMessage: (message: string) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function useWeb3() {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}

interface SimpleWeb3ProviderProps {
    children: ReactNode;
}

export default function SimpleWeb3Provider({ children }: SimpleWeb3ProviderProps) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Check if wallet was previously connected
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
                        const ethersSigner = await ethersProvider.getSigner();
                        setProvider(ethersProvider);
                        setSigner(ethersSigner);
                        setAddress(accounts[0]);
                        setIsConnected(true);
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };

        checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    setAddress(accounts[0]);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => { });
                window.ethereum.removeListener('chainChanged', () => { });
            }
        };
    }, []);

    const connectWallet = async (): Promise<string | null> => {
        if (!window.ethereum) {
            alert('Please install MetaMask or another Web3 wallet!');
            return null;
        }

        setIsConnecting(true);

        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Switch to Polygon Amoy for testing (chainId: 80002)
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x13882' }], // 80002 in hex
                });
            } catch (switchError: any) {
                // If network doesn't exist, add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x13882',
                            chainName: 'Polygon Amoy Testnet',
                            rpcUrls: ['https://polygon-amoy.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r'],
                            nativeCurrency: {
                                name: 'POL',
                                symbol: 'POL',
                                decimals: 18,
                            },
                            blockExplorerUrls: ['https://amoy.polygonscan.com'],
                        }],
                    });
                }
            }

            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const ethersSigner = await ethersProvider.getSigner();

            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setAddress(accounts[0]);
            setIsConnected(true);

            return accounts[0];
        } catch (error: any) {
            console.error('Error connecting wallet:', error);
            return null;
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setProvider(null);
        setSigner(null);
        setAddress(null);
        setIsConnected(false);
    };

    const signMessage = async (message: string): Promise<string | null> => {
        if (!signer) return null;

        try {
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            return null;
        }
    };

    const contextValue: Web3ContextType = {
        provider,
        signer,
        address,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        signMessage,
    };

    return (
        <Web3Context.Provider value={contextValue}>
            {children}
        </Web3Context.Provider>
    );
}