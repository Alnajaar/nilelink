'use client';

import { useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
  });

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;

    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      console.error('MetaMask or similar Web3 wallet not found');
      return;
    }

    try {
      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setState({
        isConnected: true,
        address: accounts[0],
        chainId: Number(network.chainId),
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return {
    ...state,
    connectWallet,
  };
}
