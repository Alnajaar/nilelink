import { ethers } from 'ethers';

// Wallet provider types
export type WalletType =
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'trust'
  | 'omt'
  | 'phantom'
  | 'solflare'
  | 'brave'
  | 'opera'
  | 'generic';

export interface WalletProvider {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  isInstalled: boolean;
  isSupported: boolean;
  downloadUrl?: string;
  connect: () => Promise<{ address: string; provider: any; signer: any }>;
  disconnect: () => Promise<void>;
}

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  provider?: any;
  signer?: any;
  walletType?: WalletType;
  error?: string;
}

export class WalletProviderManager {
  private static instance: WalletProviderManager;
  private providers: Map<WalletType, WalletProvider> = new Map();
  private currentProvider: WalletProvider | null = null;
  private connectionListeners: ((result: WalletConnectionResult) => void)[] = [];

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): WalletProviderManager {
    if (!WalletProviderManager.instance) {
      WalletProviderManager.instance = new WalletProviderManager();
    }
    return WalletProviderManager.instance;
  }

  private initializeProviders(): void {
    // MetaMask
    this.providers.set('metamask', {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect to your MetaMask wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask,
      isSupported: typeof window !== 'undefined' && !!(window as any).ethereum,
      downloadUrl: 'https://metamask.io/download/',
      connect: this.connectMetaMask.bind(this),
      disconnect: this.disconnectMetaMask.bind(this)
    });

    // WalletConnect
    this.providers.set('walletconnect', {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect via WalletConnect protocol',
      isInstalled: true, // Always available
      isSupported: typeof window !== 'undefined',
      connect: this.connectWalletConnect.bind(this),
      disconnect: this.disconnectWalletConnect.bind(this)
    });

    // Coinbase Wallet
    this.providers.set('coinbase', {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '📱',
      description: 'Connect to Coinbase Wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isCoinbaseWallet,
      isSupported: typeof window !== 'undefined' && !!(window as any).ethereum,
      downloadUrl: 'https://www.coinbase.com/wallet',
      connect: this.connectCoinbase.bind(this),
      disconnect: this.disconnectCoinbase.bind(this)
    });

    // Trust Wallet
    this.providers.set('trust', {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Connect to Trust Wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isTrust,
      isSupported: typeof window !== 'undefined' && !!(window as any).ethereum,
      downloadUrl: 'https://trustwallet.com/',
      connect: this.connectTrust.bind(this),
      disconnect: this.disconnectTrust.bind(this)
    });

    // OMT (Wish Money)
    this.providers.set('omt', {
      id: 'omt',
      name: 'OMT (Wish Money)',
      icon: '💰',
      description: 'Connect to OMT Wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum?.isOMT,
      isSupported: typeof window !== 'undefined' && !!(window as any).ethereum,
      downloadUrl: 'https://wishmoney.com/',
      connect: this.connectOMT.bind(this),
      disconnect: this.disconnectOMT.bind(this)
    });

    // Phantom (Solana)
    this.providers.set('phantom', {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect to Phantom wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).solana?.isPhantom,
      isSupported: typeof window !== 'undefined' && !!(window as any).solana,
      downloadUrl: 'https://phantom.app/',
      connect: this.connectPhantom.bind(this),
      disconnect: this.disconnectPhantom.bind(this)
    });

    // Generic Ethereum provider
    this.providers.set('generic', {
      id: 'generic',
      name: 'Browser Wallet',
      icon: '🌐',
      description: 'Connect to any Ethereum-compatible wallet',
      isInstalled: typeof window !== 'undefined' && !!(window as any).ethereum,
      isSupported: typeof window !== 'undefined' && !!(window as any).ethereum,
      connect: this.connectGeneric.bind(this),
      disconnect: this.disconnectGeneric.bind(this)
    });
  }

  getAvailableProviders(): WalletProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.isSupported);
  }

  getProvider(walletType: WalletType): WalletProvider | null {
    return this.providers.get(walletType) || null;
  }

  async connect(walletType: WalletType): Promise<WalletConnectionResult> {
    const provider = this.providers.get(walletType);
    if (!provider) {
      return {
        success: false,
        error: `Wallet type ${walletType} not supported`
      };
    }

    if (!provider.isSupported) {
      return {
        success: false,
        error: `${provider.name} is not supported in this browser`
      };
    }

    try {
      const result = await provider.connect();
      this.currentProvider = provider;

      const connectionResult: WalletConnectionResult = {
        success: true,
        address: result.address,
        provider: result.provider,
        signer: result.signer,
        walletType
      };

      // Notify listeners
      this.connectionListeners.forEach(listener => listener(connectionResult));

      return connectionResult;
    } catch (error: any) {
      const connectionResult: WalletConnectionResult = {
        success: false,
        error: error.message || `Failed to connect to ${provider.name}`,
        walletType
      };

      // Notify listeners
      this.connectionListeners.forEach(listener => listener(connectionResult));

      return connectionResult;
    }
  }

  async disconnect(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.disconnect();
      this.currentProvider = null;

      const disconnectionResult: WalletConnectionResult = {
        success: true
      };

      this.connectionListeners.forEach(listener => listener(disconnectionResult));
    }
  }

  onConnectionChange(callback: (result: WalletConnectionResult) => void): () => void {
    this.connectionListeners.push(callback);
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  getCurrentProvider(): WalletProvider | null {
    return this.currentProvider;
  }

  // Individual wallet connection methods
  private async connectMetaMask(): Promise<{ address: string; provider: any; signer: any }> {
    if (!(window as any).ethereum?.isMetaMask) {
      throw new Error('MetaMask is not installed');
    }

    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(ethereum);
    const signer = await ethersProvider.getSigner();

    return {
      address: accounts[0],
      provider: ethersProvider,
      signer
    };
  }

  private async disconnectMetaMask(): Promise<void> {
    // MetaMask doesn't have a disconnect method, just clear state
  }

  private async connectWalletConnect(): Promise<{ address: string; provider: any; signer: any }> {
    // For WalletConnect, we'd typically use @walletconnect/web3-provider
    // This is a simplified version - in production, integrate proper WalletConnect library
    throw new Error('WalletConnect integration requires additional setup. Please use MetaMask for now.');
  }

  private async disconnectWalletConnect(): Promise<void> {
    // WalletConnect disconnect logic
  }

  private async connectCoinbase(): Promise<{ address: string; provider: any; signer: any }> {
    if (!(window as any).ethereum?.isCoinbaseWallet) {
      throw new Error('Coinbase Wallet is not installed');
    }

    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(ethereum);
    const signer = await ethersProvider.getSigner();

    return {
      address: accounts[0],
      provider: ethersProvider,
      signer
    };
  }

  private async disconnectCoinbase(): Promise<void> {
    // Coinbase disconnect logic
  }

  private async connectTrust(): Promise<{ address: string; provider: any; signer: any }> {
    if (!(window as any).ethereum?.isTrust) {
      throw new Error('Trust Wallet is not installed');
    }

    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(ethereum);
    const signer = await ethersProvider.getSigner();

    return {
      address: accounts[0],
      provider: ethersProvider,
      signer
    };
  }

  private async disconnectTrust(): Promise<void> {
    // Trust disconnect logic
  }

  private async connectOMT(): Promise<{ address: string; provider: any; signer: any }> {
    if (!(window as any).ethereum?.isOMT) {
      throw new Error('OMT Wallet is not installed');
    }

    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(ethereum);
    const signer = await ethersProvider.getSigner();

    return {
      address: accounts[0],
      provider: ethersProvider,
      signer
    };
  }

  private async disconnectOMT(): Promise<void> {
    // OMT disconnect logic
  }

  private async connectPhantom(): Promise<{ address: string; provider: any; signer: any }> {
    if (!(window as any).solana?.isPhantom) {
      throw new Error('Phantom wallet is not installed');
    }

    const solana = (window as any).solana;
    const response = await solana.connect();
    const address = response.publicKey.toString();

    return {
      address,
      provider: solana,
      signer: null // Solana signing is different
    };
  }

  private async disconnectPhantom(): Promise<void> {
    const solana = (window as any).solana;
    if (solana) {
      await solana.disconnect();
    }
  }

  private async connectGeneric(): Promise<{ address: string; provider: any; signer: any }> {
    if (!(window as any).ethereum) {
      throw new Error('No Ethereum wallet found');
    }

    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(ethereum);
    const signer = await ethersProvider.getSigner();

    return {
      address: accounts[0],
      provider: ethersProvider,
      signer
    };
  }

  private async disconnectGeneric(): Promise<void> {
    // Generic disconnect logic
  }
}

export const walletProviderManager = WalletProviderManager.getInstance();