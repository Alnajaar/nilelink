"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { walletProviderManager, WalletType, WalletProvider } from '@shared/services/WalletProviderManager';
import { Eye, EyeOff, Copy, Check, CheckCircle, AlertCircle, Download, ExternalLink } from 'lucide-react';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function ConnectWalletPage() {
    const router = useRouter();
    const [availableProviders, setAvailableProviders] = useState<WalletProvider[]>([]);
    const [connectedWallet, setConnectedWallet] = useState<{
        address: string;
        walletType: WalletType;
        provider: any;
        signer: any;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showFullAddress, setShowFullAddress] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Get available wallet providers
        const providers = walletProviderManager.getAvailableProviders();
        setAvailableProviders(providers);
    }, []);

    const handleConnectWallet = async (walletType: WalletType) => {
        setLoading(true);
        setConnectingWallet(walletType);
        setError('');
        setSuccess('');

        try {
            // Connect to the selected wallet
            const result = await walletProviderManager.connect(walletType);

            if (!result.success) {
                throw new Error(result.error || 'Failed to connect wallet');
            }

            // Store connected wallet info
            setConnectedWallet({
                address: result.address!,
                walletType,
                provider: result.provider,
                signer: result.signer
            });

            setSuccess(`${walletProviderManager.getProvider(walletType)?.name} connected successfully!`);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setLoading(false);
            setConnectingWallet(null);
        }
    };

    const handleAuthenticate = async () => {
        if (!connectedWallet) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get challenge message from backend
            const challengeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/wallet/challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: connectedWallet.address })
            });

            const challengeData = await challengeRes.json();
            if (!challengeRes.ok) {
                setError(challengeData.message || 'Failed to get challenge');
                return;
            }

            // Sign the challenge
            let signature: string;
            if (connectedWallet.walletType === 'phantom') {
                // Solana signing is different
                const messageBytes = new TextEncoder().encode(challengeData.message);
                const signedMessage = await (window as any).solana.signMessage(messageBytes);
                signature = Buffer.from(signedMessage.signature).toString('hex');
            } else {
                // Ethereum signing
                signature = await connectedWallet.provider.send('personal_sign', [challengeData.message, connectedWallet.address]);
            }

            // Verify signature with backend
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/wallet/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: connectedWallet.address,
                    signature,
                    message: challengeData.message
                })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
                setError(verifyData.message || 'Wallet verification failed');
                return;
            }

            // Store authentication tokens
            localStorage.setItem('accessToken', verifyData.accessToken);
            localStorage.setItem('refreshToken', verifyData.refreshToken);
            localStorage.setItem('user', JSON.stringify(verifyData.user));
            localStorage.setItem('walletAddress', connectedWallet.address);
            localStorage.setItem('walletType', connectedWallet.walletType);

            setSuccess('Wallet connected and authenticated! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const copyAddress = async () => {
        if (connectedWallet?.address) {
            await navigator.clipboard.writeText(connectedWallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const displayAddress = connectedWallet?.address
        ? showFullAddress
            ? connectedWallet.address
            : `${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`
        : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔗</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
                    <p className="text-gray-600">Choose your preferred wallet to securely authenticate</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                {!connectedWallet ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {availableProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => handleConnectWallet(provider.id)}
                                    disabled={loading || !provider.isSupported}
                                    className="p-6 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{provider.icon}</div>
                                        <div className="text-left flex-1">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                {provider.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{provider.description}</p>
                                            {!provider.isInstalled && provider.downloadUrl && (
                                                <a
                                                    href={provider.downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 mt-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download size={12} />
                                                    Install
                                                </a>
                                            )}
                                        </div>
                                        {connectingWallet === provider.id && (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">Don't have a wallet yet?</p>
                            <div className="flex gap-4 justify-center">
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    <Download size={16} />
                                    MetaMask
                                </a>
                                <a
                                    href="https://www.coinbase.com/wallet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    <Download size={16} />
                                    Coinbase Wallet
                                </a>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-2xl">
                                    {walletProviderManager.getProvider(connectedWallet.walletType)?.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-semibold uppercase">Connected Wallet</p>
                                    <p className="font-medium text-gray-900">
                                        {walletProviderManager.getProvider(connectedWallet.walletType)?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="flex-1">
                                    <p
                                        className="font-mono text-sm text-gray-800 break-all cursor-pointer hover:text-orange-600 transition-colors"
                                        onClick={() => setShowFullAddress(!showFullAddress)}
                                    >
                                        {displayAddress}
                                    </p>
                                </div>
                                <button
                                    onClick={copyAddress}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    title="Copy address"
                                >
                                    {copied ? (
                                        <Check size={16} className="text-green-600" />
                                    ) : (
                                        <Copy size={16} className="text-gray-600" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowFullAddress(!showFullAddress)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    {showFullAddress ? (
                                        <EyeOff size={16} className="text-gray-600" />
                                    ) : (
                                        <Eye size={16} className="text-gray-600" />
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={handleAuthenticate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>}
                                {loading ? 'Authenticating...' : 'Complete Authentication'}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setConnectedWallet(null);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Connect Different Wallet
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center space-y-3">
                        <Link
                            href="/auth/login"
                            className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all text-center"
                        >
                            Login with Email Instead
                        </Link>
                        <Link
                            href="/auth/register"
                            className="block text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Don't have an account? Register
                        </Link>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-600">
                    <p className="text-yellow-700 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                        ⚠️ Make sure you're connected to the correct network (Polygon Amoy Testnet - Chain ID: 80002)
                    </p>
                </div>
            </div>
        </div>
    );
}
