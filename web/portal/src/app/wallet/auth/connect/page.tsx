"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Wallet,
    Shield,
    AlertTriangle,
    CheckCircle,
    Loader2,
    ExternalLink,
    Copy,
    RefreshCw
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function WalletConnectPage() {
    const router = useRouter();
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [walletAddress, setWalletAddress] = useState('');
    const [balance, setBalance] = useState('0.00');
    const [network, setNetwork] = useState('NileLink Protocol');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const connectWallet = async () => {
        setLoading(true);
        setConnectionStatus('connecting');
        setError('');

        try {
            // Mock wallet connection - in real app this would use Web3/Ethers
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate successful connection
            const mockAddress = '0x' + Math.random().toString(36).substr(2, 40);
            setWalletAddress(mockAddress);
            setBalance('1,250.75');
            setConnectionStatus('connected');

            // Store in localStorage for persistence
            localStorage.setItem('wallet_address', mockAddress);
            localStorage.setItem('wallet_connected', 'true');

        } catch (err) {
            setConnectionStatus('error');
            setError('Failed to connect wallet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setConnectionStatus('disconnected');
        setWalletAddress('');
        setBalance('0.00');
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('wallet_connected');
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        // Could show a toast notification here
    };

    useEffect(() => {
        // Check if wallet was previously connected
        const savedAddress = localStorage.getItem('wallet_address');
        const wasConnected = localStorage.getItem('wallet_connected') === 'true';

        if (savedAddress && wasConnected) {
            setWalletAddress(savedAddress);
            setBalance('1,250.75'); // Mock balance
            setConnectionStatus('connected');
        }
    }, []);

    return (
        <div className="min-h-screen bg-neutral text-text-primary">
            {/* Header */}
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        ← Back to NileLink
                    </Link>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 py-12">
                {/* Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Wallet size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-text-primary mb-2">Connect Wallet</h1>
                    <p className="text-text-muted">Link your blockchain wallet to NileLink</p>
                </div>

                <Card className="p-8">
                    {/* Connection Status */}
                    <div className="text-center mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${connectionStatus === 'connected' ? 'bg-success/20 text-success' :
                            connectionStatus === 'connecting' ? 'bg-primary/20 text-primary animate-pulse' :
                                connectionStatus === 'error' ? 'bg-error/20 text-error' :
                                    'bg-text-muted/20 text-text-muted'
                            }`}>
                            {connectionStatus === 'connected' ? <CheckCircle size={24} /> :
                                connectionStatus === 'connecting' ? <Loader2 size={24} className="animate-spin" /> :
                                    connectionStatus === 'error' ? <AlertTriangle size={24} /> :
                                        <Wallet size={24} />}
                        </div>

                        <Badge
                            variant={
                                connectionStatus === 'connected' ? 'success' :
                                    connectionStatus === 'error' ? 'error' :
                                        'neutral'
                            }
                            className="text-sm font-bold"
                        >
                            {connectionStatus === 'connected' ? 'Connected' :
                                connectionStatus === 'connecting' ? 'Connecting...' :
                                    connectionStatus === 'error' ? 'Connection Failed' :
                                        'Not Connected'}
                        </Badge>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={20} className="text-error flex-shrink-0" />
                            <p className="text-error font-medium text-sm">{error}</p>
                        </div>
                    )}

                    {/* Wallet Info (when connected) */}
                    {connectionStatus === 'connected' && (
                        <div className="space-y-4 mb-6">
                            {/* Address */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Wallet Address
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-4 py-3 bg-white border border-border-subtle rounded-xl font-mono text-sm">
                                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyAddress}
                                        className="px-3"
                                    >
                                        <Copy size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Balance */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Balance
                                </label>
                                <div className="px-4 py-3 bg-white border border-border-subtle rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg">{balance} NILE</span>
                                        <Badge className="bg-primary/10 text-primary border-primary/20">
                                            {network}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open('https://etherscan.io/address/' + walletAddress, '_blank')}
                                    className="flex-1 gap-2"
                                >
                                    <ExternalLink size={16} />
                                    View on Explorer
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={disconnectWallet}
                                    className="gap-2"
                                >
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Connect Button */}
                    {connectionStatus !== 'connected' && (
                        <Button
                            onClick={connectWallet}
                            disabled={loading}
                            className="w-full h-12 bg-primary text-background font-black uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" size={18} />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Wallet className="mr-2" size={18} />
                                    Connect Wallet
                                </>
                            )}
                        </Button>
                    )}

                    {/* Supported Wallets */}
                    <div className="text-center">
                        <p className="text-xs text-text-muted mb-4 font-medium">
                            Compatible with MetaMask, Trust Wallet, and other Web3 wallets
                        </p>

                        <div className="flex justify-center gap-4">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">M</span>
                            </div>
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">T</span>
                            </div>
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">W</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-text-primary uppercase tracking-widest mb-1">
                                    Secure Connection
                                </p>
                                <p className="text-xs text-text-muted">
                                    Your wallet connection is secured with end-to-end encryption. We never store your private keys or seed phrases.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 text-center">
                        <Link href="/wallet" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            ← Back to Wallet Dashboard
                        </Link>
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-text-muted">
                        NileLink Wallet • Powered by Blockchain Protocol
                    </p>
                </div>
            </div>
        </div>
    );
}
