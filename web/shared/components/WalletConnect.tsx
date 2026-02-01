"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useWallet } from '../contexts/WalletContext';
import { Fingerprint, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/AuthService';

interface WalletConnectProps {
    variant?: 'button' | 'badge';
    size?: 'sm' | 'md' | 'lg';
    showAddress?: boolean;
    showBalance?: boolean;
    className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
    variant = 'button',
    size = 'md',
    showAddress = true,
    showBalance = false,
    className = ''
}) => {
    const { wallet: walletState, connectWallet, disconnectWallet, signMessage } = useWallet();
    const { isConnected, address } = walletState;
    const isSupported = typeof window !== 'undefined' && !!window.ethereum;

    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    // Get wallet balance when connected
    useEffect(() => {
        if (isConnected && address && showBalance) {
            // This would integrate with your blockchain service
            // For demo, we'll simulate a balance
            setBalance('0.00 ETH');
        }
    }, [isConnected, address, showBalance]);

    const handleConnect = async () => {
        if (!isSupported) {
            setError('System check failed: Identity module not found.');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            await connectWallet();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (variant === 'badge') {
        if (!isConnected) {
            return (
                <Badge variant="error" className={`cursor-pointer ${className}`} onClick={handleConnect}>
                    <AlertCircle size={12} className="mr-1" />
                    Identity Disconnected
                </Badge>
            );
        }

        return (
            <Badge variant="success" className={`cursor-pointer ${className}`}>
                <CheckCircle size={12} className="mr-1" />
                {showAddress && address ? `Node ID: ${address.slice(0, 8)}` : 'Identity Anchored'}
                {showBalance && balance && <span className="ml-2 text-xs opacity-75">({balance})</span>}
            </Badge>
        );
    }

    // Button variant
    if (isConnected) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Badge variant="success" size="sm">
                    <CheckCircle size={12} className="mr-1" />
                    Identity Secure
                </Badge>
                {showAddress && address && (
                    <span className="text-sm font-mono text-gray-600">
                        Node ID: {address.slice(0, 8)}
                    </span>
                )}
                {showBalance && balance && (
                    <span className="text-xs text-gray-500">
                        {balance}
                    </span>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="text-xs"
                >
                    Release Identity
                </Button>
            </div>
        );
    }

    return (
        <div className={className}>
            <Button
                onClick={handleConnect}
                disabled={isConnecting}
                size={size}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
                {isConnecting ? (
                    <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Anchoring Identity...
                    </>
                ) : (
                    <>
                        <Fingerprint size={16} className="mr-2" />
                        Anchor Identity
                    </>
                )}
            </Button>

            {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {error}
                </div>
            )}

            {!isSupported && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    Identity module not detected. Please ensure your core service is active.
                </div>
            )}
        </div>
    );
};

// Hook for programmatic wallet access
export const useWalletConnection = () => {
    const { wallet: walletState, signMessage, connectWallet, disconnectWallet } = useWallet();
    const { address, isConnected } = walletState;

    const connectWithChallenge = async () => {
        if (!address) {
            throw new Error('No wallet address available');
        }

        try {
            // Get challenge from server
            const challengeResult = await authService.getWalletChallenge(address);
            if (!challengeResult.success) {
                throw new Error(challengeResult.error || 'Failed to get challenge');
            }

            // Sign the message using the real wallet
            const signature = await signMessage(challengeResult.message!);

            // Verify signature with server
            const verifyResult = await authService.verifyWalletSignature(
                address,
                signature,
                challengeResult.message!,
                challengeResult.challengeId
            );

            if (!verifyResult.success) {
                throw new Error(verifyResult.error || 'Signature verification failed');
            }

            return verifyResult;
        } catch (error) {
            console.error('Wallet authentication failed:', error);
            throw error;
        }
    };

    return {
        address,
        isConnected,
        balance: walletState.balance,
        connectWithChallenge,
        connect: connectWallet,
        disconnect: disconnectWallet,
        signMessage
    };
};