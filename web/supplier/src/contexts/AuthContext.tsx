"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
    id: string;
    email?: string;
    phone?: string;
    walletAddress?: string;
    firstName?: string;
    lastName?: string;
    role: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'OWNER';
    businessId?: string;
    businessName?: string;
    isActive: boolean;
    authType: 'email' | 'phone' | 'wallet';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    loginWithWallet: (address: string, signature: string, message: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    connectWallet: () => Promise<{ success: boolean; address?: string; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock implementations for demo
    const loginWithEmail = async (email: string, password: string) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (email && password) {
                const mockUser: User = {
                    id: 'supplier-1',
                    email,
                    firstName: 'John',
                    lastName: 'Supplier',
                    role: 'SUPPLIER',
                    businessId: 'business-1',
                    businessName: 'Supplier Co',
                    isActive: true,
                    authType: 'email'
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                return { success: true };
            }
            return { success: false, error: 'Invalid credentials' };
        } finally {
            setLoading(false);
        }
    };

    const loginWithPhone = async (phone: string, otp: string) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (phone && otp) {
                const mockUser: User = {
                    id: 'supplier-2',
                    phone,
                    firstName: 'Jane',
                    lastName: 'Supplier',
                    role: 'SUPPLIER',
                    businessId: 'business-2',
                    businessName: 'Supplier LLC',
                    isActive: true,
                    authType: 'phone'
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                return { success: true };
            }
            return { success: false, error: 'Invalid OTP' };
        } finally {
            setLoading(false);
        }
    };

    const loginWithWallet = async (address: string, signature: string, message: string) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (address && signature) {
                const mockUser: User = {
                    id: 'supplier-3',
                    walletAddress: address,
                    firstName: 'Wallet',
                    lastName: 'Supplier',
                    role: 'SUPPLIER',
                    businessId: 'business-3',
                    businessName: 'Crypto Supplier',
                    isActive: true,
                    authType: 'wallet'
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                return { success: true };
            }
            return { success: false, error: 'Wallet authentication failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: any) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockUser: User = {
                id: `supplier-${Date.now()}`,
                ...data,
                role: 'SUPPLIER',
                businessId: `business-${Date.now()}`,
                businessName: data.businessName || 'New Supplier',
                isActive: true,
                authType: data.email ? 'email' : data.phone ? 'phone' : 'wallet'
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { success: true };
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (phone: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { success: true };
        } catch {
            return { success: false, error: 'Failed to send OTP' };
        }
    };

    const verifyOtp = async (phone: string, otp: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockUser: User = {
                id: `supplier-${Date.now()}`,
                phone,
                firstName: 'Phone',
                lastName: 'Supplier',
                role: 'SUPPLIER',
                businessId: `business-${Date.now()}`,
                businessName: 'New Supplier',
                isActive: true,
                authType: 'phone'
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { success: true };
        } catch {
            return { success: false, error: 'Failed to verify OTP' };
        }
    };

    const connectWallet = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                success: true,
                address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            };
        } catch {
            return { success: false, error: 'Wallet connection failed' };
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value: AuthContextType = {
        user,
        loading,
        loginWithEmail,
        loginWithPhone,
        loginWithWallet,
        register,
        sendOtp,
        verifyOtp,
        connectWallet,
        logout
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