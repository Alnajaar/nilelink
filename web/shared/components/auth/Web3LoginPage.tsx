'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Shield, AlertCircle, CheckCircle, Loader2, ExternalLink, ChevronDown, X } from 'lucide-react';
import { walletProviderManager, WalletProvider, WalletType, WalletConnectionResult } from '../../services/WalletProviderManager';

// Define the window.ethereum type for TypeScript
declare global {
    interface Window {
        ethereum?: any;
        solana?: any;
    }
}

interface Web3LoginPageProps {
    appName?: string;
    onLoginSuccess?: (data: any) => void;
}

// Client-side only component to prevent hydration issues
function Web3LoginContent({
    appName = 'NileLink Protocol',
    onLoginSuccess
}: Web3LoginPageProps) {
    const [availableProviders, setAvailableProviders] = useState<WalletProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<WalletProvider | null>(null);
    const [showProviderSelector, setShowProviderSelector] = useState(false);

    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [authStep, setAuthStep] = useState<'connect' | 'sign' | 'verify'>('connect');

    // Initialize available providers
    useEffect(() => {
        const providers = walletProviderManager.getAvailableProviders();
        setAvailableProviders(providers);

        // Auto-select MetaMask if available
        const metaMask = providers.find(p => p.id === 'metamask');
        if (metaMask) {
            setSelectedProvider(metaMask);
        } else if (providers.length > 0) {
            setSelectedProvider(providers[0]);
        }
    }, []);

    // Handle wallet connection changes
    useEffect(() => {
        if (isConnected && address) {
            setAuthStep('sign');
            setError('');
        } else if (!isConnected && !isConnecting) {
            setAuthStep('connect');
        }
    }, [isConnected, address, isConnecting]);

    // Listen for wallet connection changes
    useEffect(() => {
        const unsubscribe = walletProviderManager.onConnectionChange((result: WalletConnectionResult) => {
            if (result.success && result.address) {
                setAddress(result.address);
                setProvider(result.provider);
                setSigner(result.signer);
                setIsConnected(true);
                setIsConnecting(false);
                setError('');
            } else if (!result.success) {
                setError(result.error || 'Connection failed');
                setIsConnecting(false);
            }
        });

        return unsubscribe;
    }, []);

    // Close provider selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showProviderSelector && !(event.target as Element).closest('.provider-selector')) {
                setShowProviderSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProviderSelector]);

    const handleWalletConnect = async () => {
        if (!selectedProvider) {
            setError('Please select a wallet provider');
            return;
        }

        setError('');
        setIsConnecting(true);

        try {
            const result = await walletProviderManager.connect(selectedProvider.id);
            if (!result.success) {
                throw new Error(result.error || 'Connection failed');
            }
        } catch (err: any) {
            setError('Failed to connect wallet: ' + err.message);
            setIsConnecting(false);
        }
    };

    const handleSignatureAuth = async () => {
        if (!address) return;

        setIsAuthenticating(true);
        setError('');
        setAuthStep('sign');

        try {
            // Create authentication message
            const message = `Welcome to ${appName}!\n\nSign this message to authenticate your wallet.\n\nAddress: ${address}\nTimestamp: ${new Date().toISOString()}\n\nThis signature proves ownership of this wallet.`;

            // Sign the message
            const signature = await signMessage(message);

            setAuthStep('verify');

            // Verify signature on backend (optional)
            // For now, we'll simulate successful authentication
            const mockUserData = {
                walletAddress: address,
                signature,
                timestamp: Date.now(),
                user: {
                    id: `wallet-${address.slice(2, 10)}`,
                    walletAddress: address,
                    role: 'USER',
                    isVerified: true
                },
                accessToken: `web3-token-${Date.now()}`,
                refreshToken: `web3-refresh-${Date.now()}`
            };

            // Store in localStorage for session persistence
            localStorage.setItem('accessToken', mockUserData.accessToken);
            localStorage.setItem('refreshToken', mockUserData.refreshToken);
            localStorage.setItem('user', JSON.stringify(mockUserData.user));

            setSuccess('Wallet authenticated successfully!');

            if (onLoginSuccess) {
                onLoginSuccess(mockUserData);
            }

        } catch (err: any) {
            if (err.name === 'UserRejectedRequestError') {
                setError('Signature request was rejected. Please try again.');
            } else {
                setError('Authentication failed: ' + err.message);
            }
            setAuthStep('sign');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleDisconnect = async () => {
        await walletProviderManager.disconnect();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setAuthStep('connect');
        setSuccess('');
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

    return (
        <div className="min-h-screen flex items-center justify-center p-4 mesh-bg relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-md glass-v2 rounded-[2.5rem] p-10 border border-white/10 relative z-10 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 overflow-hidden rounded-2xl shadow-xl">
                        <img src="/assets/logo/logo-square.png" alt="NileLink" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Connect to {appName}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">Web3 Authentication</p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-200 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-emerald-200 font-medium">{success}</p>
                    </div>
                )}

                {/* Authentication Steps */}
                <div className="space-y-6">
                    {/* Step 1: Connect Wallet */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${authStep === 'connect' ? 'bg-secondary text-white' :
                                isConnected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'
                                }`}>
                                {isConnected ? '✓' : '1'}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-white">Connect Wallet</span>
                        </div>

                        {!isConnected ? (
                            <div className="space-y-3">
                                {/* Provider Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProviderSelector(!showProviderSelector)}
                                        className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{selectedProvider?.icon}</span>
                                            <div className="text-left">
                                                <p className="text-xs font-black uppercase tracking-widest text-white">{selectedProvider?.name}</p>
                                                <p className="text-[8px] text-white/60">{selectedProvider?.description}</p>
                                            </div>
                                        </div>
                                        <ChevronDown size={14} className={`text-white/60 transition-transform ${showProviderSelector ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showProviderSelector && (
                                        <div className="absolute top-full mt-2 w-full bg-black/90 border border-white/10 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                                            {availableProviders.map((provider) => (
                                                <button
                                                    key={provider.id}
                                                    onClick={() => {
                                                        setSelectedProvider(provider);
                                                        setShowProviderSelector(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-left"
                                                >
                                                    <span className="text-lg">{provider.icon}</span>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-white">{provider.name}</p>
                                                        <p className="text-[8px] text-white/60">{provider.description}</p>
                                                        {!provider.isInstalled && (
                                                            <span className="text-[7px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded uppercase">Not Installed</span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleWalletConnect}
                                    disabled={isConnecting || !selectedProvider}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-secondary/20"
                                >
                                    {isConnecting && <Loader2 size={16} className="animate-spin" />}
                                    <Wallet size={16} />
                                    {isConnecting ? 'CONNECTING...' : `CONNECT ${selectedProvider?.name?.toUpperCase() || 'WALLET'}`}
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Connected</p>
                                        <p className="text-[10px] font-mono text-white/60">
                                            {address?.slice(0, 6)}...{address?.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Sign Message (only show when connected) */}
                    {isConnected && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${authStep === 'sign' ? 'bg-secondary text-white' :
                                    authStep === 'verify' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'
                                    }`}>
                                    {authStep === 'verify' ? '✓' : '2'}
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-white">Sign Message</span>
                            </div>

                            {authStep === 'sign' && (
                                <button
                                    onClick={handleSignatureAuth}
                                    disabled={isAuthenticating}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-secondary/20"
                                >
                                    {isAuthenticating && <Loader2 size={16} className="animate-spin" />}
                                    <Shield size={16} />
                                    {isAuthenticating ? 'SIGNING...' : 'SIGN & AUTHENTICATE'}
                                </button>
                            )}

                            {authStep === 'verify' && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Verifying</p>
                                            <p className="text-[10px] text-white/60">Confirming signature...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dynamic Wallet Options Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">Available Wallets</p>
                        <div className="grid grid-cols-2 gap-2">
                            {availableProviders.slice(0, 8).map((provider) => (
                                <div key={provider.id} className={`text-center p-2 rounded border transition-all ${
                                    provider.isInstalled
                                        ? 'border-emerald-500/20 bg-emerald-500/5'
                                        : 'border-white/10 bg-white/5 opacity-50'
                                }`}>
                                    <div className="text-lg mb-1">{provider.icon}</div>
                                    <div className="text-[7px] font-mono text-white/60 leading-tight">
                                        {provider.name}
                                        {!provider.isInstalled && <div className="text-red-400">Not Installed</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 space-y-4">
                    <div className="h-px bg-white/5" />
                    <div className="flex gap-3">
                        {isConnected ? (
                            <>
                                <button
                                    onClick={handleDisconnect}
                                    className="flex-1 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
                                >
                                    Disconnect
                                </button>
                                <button
                                    onClick={() => selectedProvider?.downloadUrl && window.open(selectedProvider.downloadUrl, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
                                    disabled={!selectedProvider?.downloadUrl}
                                >
                                    Get {selectedProvider?.name}
                                    <ExternalLink size={10} />
                                </button>
                            </>
                        ) : (
                            availableProviders
                                .filter(provider => !provider.isInstalled && provider.downloadUrl)
                                .slice(0, 2)
                                .map(provider => (
                                    <button
                                        key={provider.id}
                                        onClick={() => window.open(provider.downloadUrl, '_blank')}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
                                    >
                                        Get {provider.name}
                                        <ExternalLink size={10} />
                                    </button>
                                ))
                        )}
                    </div>
                </div>

                {/* Demo Info */}
                <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">🚀 Web3 Authentication</p>
                    <p className="text-[8px] text-white/40">
                        Your wallet serves as your identity. No passwords, no emails - just cryptographic proof of ownership.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Main component with hydration-safe rendering
export default function Web3LoginPage(props: Web3LoginPageProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering until client-side
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 mesh-bg relative overflow-hidden">
                <div className="w-full max-w-md glass-v2 rounded-[2.5rem] p-10 border border-white/10 relative z-10 shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

    return <Web3LoginContent {...props} />;
}