"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Zap,
    Shield,
    Wallet,
    Copy,
    Check,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Database,
    Cpu,
    Network,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/AuthProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function POSConnectWalletPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, connectWallet, authenticateWithWallet } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showFullAddress, setShowFullAddress] = useState(false);
    const [copied, setCopied] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleConnectWallet = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Connect wallet first
            const connectResult = await connectWallet();
            if (!connectResult.success) {
                throw new Error(connectResult.error || 'Failed to connect wallet');
            }
            
            // Then authenticate with SIWE
            const authResult = await authenticateWithWallet();
            if (!authResult.success) {
                throw new Error(authResult.error || 'Authentication failed');
            }
            
            setSuccess('Successfully connected and authenticated!');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const copyAddress = async () => {
        // This would copy the wallet address to clipboard
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Connecting to wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="flex justify-center mb-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Zap size={28} />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">NileLink</span>
                    </Link>
                </div>

                <Card className="p-10 shadow-xl border border-gray-200">
                    <div className="text-center mb-8">
                        <Badge className="mb-6 px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                            Web3 Authentication
                        </Badge>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Wallet</h1>
                        <p className="text-gray-600">Securely connect your cryptocurrency wallet</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-green-700 text-sm font-medium">{success}</p>
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="text-center">
                            <ConnectButton.Custom>
                                {({ account, chain, openConnectModal, mounted }) => {
                                    return (
                                        <Button
                                            onClick={openConnectModal}
                                            disabled={!mounted || loading}
                                            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 shadow-lg"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Wallet className="w-6 h-6" />
                                                    Connect Wallet
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </Button>
                                    );
                                }}
                            </ConnectButton.Custom>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Security Information
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>We use Sign-In with Ethereum (SIWE) for secure authentication</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Your private keys remain secure in your wallet</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>No personal information is stored on our servers</span>
                                </li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-white rounded-lg border">
                                <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs font-medium text-gray-900">Decentralized</p>
                                <p className="text-xs text-gray-500 mt-1">On-chain storage</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border">
                                <Network className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs font-medium text-gray-900">Multi-chain</p>
                                <p className="text-xs text-gray-500 mt-1">Polygon support</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border">
                                <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs font-medium text-gray-900">Secure</p>
                                <p className="text-xs text-gray-500 mt-1">Zero-knowledge</p>
                            </div>
                        </div>

                        <div className="text-center pt-6 border-t border-gray-200">
                            <Link 
                                href="/auth/login" 
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to traditional login
                            </Link>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>Powered by RainbowKit • Protected by 256-bit encryption</p>
                    <p className="mt-1">NileLink Protocol v2.0</p>
                </div>
            </div>
        </div>
    );
}