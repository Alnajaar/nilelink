"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface Web3State {
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    balance: string | null;
}

export const useWeb3 = () => {
    const [state, setState] = useState<Web3State>({
        provider: null,
        signer: null,
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        error: null,
        balance: null,
    });

    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
    };

    // Connect wallet
    const connect = useCallback(async () => {
        if (!isMetaMaskInstalled()) {
            setState(prev => ({ ...prev, error: 'MetaMask is not installed' }));
            return;
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);

            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            const balance = await provider.getBalance(address);

            // Check if on Polygon Amoy network (chainId 80002)
            if (network.chainId !== BigInt(80002)) {
                await switchToAmoy();
                // Re-fetch after switch
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                const newSigner = await newProvider.getSigner();
                const newAddress = await newSigner.getAddress();
                const newNetwork = await newProvider.getNetwork();
                const newBalance = await newProvider.getBalance(newAddress);

                setState({
                    provider: newProvider,
                    signer: newSigner,
                    address: newAddress,
                    chainId: Number(newNetwork.chainId),
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                    balance: ethers.formatEther(newBalance),
                });
            } else {
                setState({
                    provider,
                    signer,
                    address,
                    chainId: Number(network.chainId),
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                    balance: ethers.formatEther(balance),
                });
            }
        } catch (error: any) {
            console.error('Connection error:', error);
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: error.message || 'Failed to connect wallet'
            }));
        }
    }, []);

    // Switch to Polygon Amoy network
    const switchToAmoy = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13882' }], // Polygon Amoy
            });
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x13882',
                            chainName: 'Polygon Amoy',
                            nativeCurrency: {
                                name: 'POL',
                                symbol: 'POL',
                                decimals: 18,
                            },
                            rpcUrls: ['https://polygon-amoy.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r'],
                            blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                        }],
                    });
                } catch (addError) {
                    throw new Error('Failed to add Polygon Amoy network');
                }
            } else {
                throw new Error('Failed to switch to Polygon Amoy network');
            }
        }
    };

    // Disconnect wallet
    const disconnect = useCallback(() => {
        setState({
            provider: null,
            signer: null,
            address: null,
            chainId: null,
            isConnected: false,
            isConnecting: false,
            error: null,
            balance: null,
        });
    }, []);

    // Sign message for authentication
    const signMessage = useCallback(async (message: string) => {
        if (!state.signer) throw new Error('Wallet not connected');

        try {
            const signature = await state.signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Signing error:', error);
            throw error;
        }
    }, [state.signer]);

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnect();
                } else if (accounts[0] !== state.address) {
                    // Account changed, reconnect
                    connect();
                }
            };

            const handleChainChanged = (chainId: string) => {
                if (parseInt(chainId, 16) !== 80002) {
                    setState(prev => ({ ...prev, error: 'Please switch to Polygon Amoy network' }));
                } else {
                    setState(prev => ({ ...prev, error: null }));
                    // Refresh balance and network info
                    connect();
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [connect, disconnect, state.address]);

    return {
        ...state,
        connect,
        disconnect,
        signMessage,
        isMetaMaskInstalled: isMetaMaskInstalled(),
    };
};

// Add type declaration for window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}
