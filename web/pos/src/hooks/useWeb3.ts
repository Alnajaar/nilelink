import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Web3State {
  address: string | null;
  chainId: number | null;
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface SIWESession {
  address: string;
  chainId: number;
  message: SiweMessage;
  signature: string;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    address: null,
    chainId: null,
    signer: null,
    provider: null,
    isConnected: false,
    isConnecting: false,
    error: null
  });

  // Check if MetaMask is installed
  const checkMetaMask = () => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.ethereum);
  };

  // Connect to wallet
  const connect = async () => {
    if (!checkMetaMask()) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask not found. Please install MetaMask.'
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setState({
        address,
        chainId,
        signer,
        provider,
        isConnected: true,
        isConnecting: false,
        error: null
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet'
      }));
    }
  };

  // Sign In With Ethereum
  const signInWithEthereum = async (): Promise<SIWESession | null> => {
    if (!state.signer || !state.address || !state.chainId) {
      throw new Error('Wallet not connected');
    }

    try {
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = 'Sign in with Ethereum to NileLink POS System';

      const message = new SiweMessage({
        domain,
        address: state.address,
        statement,
        uri: origin,
        version: '1',
        chainId: state.chainId,
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), // 8 hours for POS shift
        resources: [`${origin}/pos`]
      });

      const messageToSign = message.prepareMessage();
      const signature = await state.signer.signMessage(messageToSign);

      // Verify the signature
      const verified = await message.verify({ signature });
      if (!verified.success) {
        throw new Error('Signature verification failed');
      }

      return {
        address: state.address,
        chainId: state.chainId,
        message,
        signature
      };

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'SIWE authentication failed'
      }));
      return null;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }

    setState({
      address: null,
      chainId: null,
      signer: null,
      provider: null,
      isConnected: false,
      isConnecting: false,
      error: null
    });
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== state.address) {
      // Reconnect with new account
      connect();
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string) => {
    window.location.reload(); // MetaMask recommends reloading on chain changes
  };

  // Switch to Polygon network (recommended for NileLink)
  const switchToPolygon = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon mainnet
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            }],
          });
          return true;
        } catch (addError) {
          return false;
        }
      }
      return false;
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    if (checkMetaMask() && window.ethereum.selectedAddress) {
      connect();
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    signInWithEthereum,
    switchToPolygon,
    checkMetaMask: checkMetaMask()
  };
}