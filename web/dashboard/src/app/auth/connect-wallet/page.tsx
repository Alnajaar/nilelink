"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@shared/contexts/WalletContext';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function ConnectWalletPage() {
    const router = useRouter();
    const { wallet, connectWallet: walletContextConnect } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showFullAddress, setShowFullAddress] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleConnectWallet = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // First, connect through WalletContext to manage MetaMask state
            await walletContextConnect();

            if (!wallet.address) {
                throw new Error('Failed to connect wallet');
            }

            // Get challenge message from backend
            const challengeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/wallet/challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: wallet.address })
            });

            const challengeData = await challengeRes.json();
            if (!challengeRes.ok) {
                setError(challengeData.message || 'Failed to get challenge');
                return;
            }

            // Sign the challenge with MetaMask
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [challengeData.message, wallet.address]
            });

            // Verify signature with backend
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/wallet/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    walletAddress: wallet.address, 
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
            localStorage.setItem('walletAddress', wallet.address);

            setSuccess('Wallet connected and authenticated! Redirecting...');
            setTimeout(() => router.push('/'), 2000);
        } catch (err: any) {
            if (err.message === 'Auto-connect failed' || err.message === 'MetaMask not installed') {
                setError('MetaMask not installed or not available. Please install MetaMask to continue.');
            } else {
                setError(err.message || 'Failed to connect wallet');
            }
        } finally {
            setLoading(false);
        }
    };

    const copyAddress = async () => {
        if (wallet.address) {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const displayAddress = wallet.address 
        ? showFullAddress 
            ? wallet.address 
            : `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
        : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2 text-primary">Connect Wallet</h1>
                <p className="text-center text-gray-600 text-sm mb-8">Use MetaMask to authenticate securely</p>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <div className="space-y-4">
                    {!wallet.isConnected ? (
                        <button
                            onClick={handleConnectWallet}
                            disabled={loading}
                            className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Connecting...' : 'Connect MetaMask'}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Connected Wallet</p>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="font-mono text-sm text-primary break-all cursor-pointer hover:text-secondary transition"
                                           onClick={() => setShowFullAddress(!showFullAddress)}>
                                            {displayAddress}
                                        </p>
                                    </div>
                                    <button
                                        onClick={copyAddress}
                                        className="p-2 hover:bg-white rounded transition"
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
                                        className="p-2 hover:bg-white rounded transition"
                                    >
                                        {showFullAddress ? (
                                            <EyeOff size={16} className="text-gray-600" />
                                        ) : (
                                            <Eye size={16} className="text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {wallet.balance && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Balance</p>
                                    <p className="text-lg font-bold text-primary">
                                        {parseFloat(wallet.balance).toFixed(4)} ETH
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleConnectWallet}
                                disabled={loading}
                                className="w-full bg-secondary text-white font-semibold py-2 rounded-lg hover:bg-secondary-dark transition"
                            >
                                {loading ? 'Authenticating...' : 'Authenticate & Login'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-3">
                    <Link href="/auth/login" className="block w-full text-center bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition">
                        Login with Email Instead
                    </Link>
                </div>

                <div className="mt-6 text-center text-xs text-gray-600 space-y-2">
                    <p>Don't have MetaMask? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-semibold">Download MetaMask</a></p>
                    <p className="text-yellow-700 bg-yellow-50 p-2 rounded">⚠️ Make sure you're on Polygon Amoy network (chainId: 80002)</p>
                </div>
            </div>
        </div>
    );
}
