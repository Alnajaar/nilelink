'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';

export interface User {
    id: string;
    email?: string;
    phone?: string;
    walletAddress?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isActive?: boolean;
    authType?: 'email' | 'phone' | 'wallet' | 'pin';
    businessId?: string;
    businessName?: string;
    pin?: string;
    plan?: 'free' | 'standard' | 'enterprise';
    trialExpiresAt?: Date;
    permissions?: string[];
    terminals?: string[];
    lastLogin?: Date;
    tenantId?: string;
    did?: string;
    chainId?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isLoading: boolean;
    isWalletConnected: boolean;
    address: `0x${string}` | undefined;
    isConnected: boolean;
    chainId: number | undefined;
    connectWallet: () => Promise<{ success: boolean; address?: string; error?: string }>;
    authenticateWithWallet: () => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const { address, isConnected, chainId } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        setIsWalletConnected(isConnected);
        
        if (isConnected && address && !hasCheckedAuth) {
            setHasCheckedAuth(true);
            checkAuthStatus();
        } else if (!isConnected) {
            setUser(null);
            setLoading(false);
            setHasCheckedAuth(false);
        }
    }, [isConnected, address]);

    const checkAuthStatus = async () => {
        if (!address) return;
        setLoading(true);
        try {
            // Check if we have a valid session in localStorage
            const storedUser = localStorage.getItem('nilelink_user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    if (userData.walletAddress === address) {
                        setUser(userData);
                        setIsWalletConnected(true);
                    }
                } catch (e) {
                    localStorage.removeItem('nilelink_user');
                }
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        setLoading(true);
        try {
            // Wallet connection is handled by RainbowKit/Wagmi
            // Just return success if already connected
            if (isConnected && address) {
                setIsWalletConnected(true);
                return { success: true, address };
            }
            return { success: false, error: 'Please connect wallet using the connect button' };
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            return { success: false, error: error.message || 'Failed to connect wallet' };
        } finally {
            setLoading(false);
        }
    };

    const authenticateWithWallet = async () => {
        if (!address || !isConnected) {
            return { success: false, error: 'Wallet not connected' };
        }

        if (loading) {
            return { success: false, error: 'Already authenticating' };
        }

        setLoading(true);
        try {
            // 1. Generate SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address: address,
                statement: 'Sign in to NileLink with Ethereum',
                uri: window.location.origin,
                version: '1',
                chainId: chainId || 80002,
                nonce: Math.random().toString(36).substring(2),
                issuedAt: new Date().toISOString(),
                expirationTime: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            });

            const messageString = message.prepareMessage();
            
            // 2. Sign message
            const signature = await signMessageAsync({ account: address as `0x${string}`, message: messageString });

            // 3. Create user object
            const userData: User = {
                id: address,
                walletAddress: address,
                role: 'RESTAURANT_OWNER', // Default role for POS
                authType: 'wallet',
                isActive: true,
                did: `did:ethr:${chainId || 137}:${address}`,
                chainId: chainId || 137
            };

            // 4. Store user data
            setUser(userData);
            localStorage.setItem('nilelink_user', JSON.stringify(userData));
            
            return { success: true, user: userData };
        } catch (error: any) {
            console.error('SIWE Auth failed:', error);
            return { success: false, error: error.message || 'Authentication failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        setIsWalletConnected(false);
        localStorage.removeItem('nilelink_user');
        disconnect();
    };

    const refreshAuth = async () => {
        await checkAuthStatus();
    };

    const value: AuthContextType = {
        user,
        loading,
        isLoading: loading,
        isWalletConnected,
        address,
        isConnected,
        chainId,
        connectWallet,
        authenticateWithWallet,
        logout,
        refreshAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}