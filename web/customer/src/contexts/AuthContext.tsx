"use client";

import React, { createContext, useContext, useState } from 'react';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: User | null;
    loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    loginWithWallet: (address: string, signature: string, message: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    connectWallet: () => Promise<{ success: boolean; address?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const loginWithEmail = async (email: string, password: string) => {
        // Demo implementation
        setUser({ id: '1', email, firstName: 'Demo', lastName: 'User' });
        return { success: true };
    };

    const loginWithPhone = async (phone: string, otp: string) => {
        setUser({ id: '1', email: phone + '@demo.com', firstName: 'Demo', lastName: 'User' });
        return { success: true };
    };

    const loginWithWallet = async (address: string, signature: string, message: string) => {
        setUser({ id: '1', email: address + '@wallet.demo', firstName: 'Demo', lastName: 'User' });
        return { success: true };
    };

    const register = async (data: any) => {
        setUser({ id: '1', email: data.email || data.phone + '@demo.com', firstName: data.firstName, lastName: data.lastName });
        return { success: true };
    };

    const sendOtp = async (phone: string) => {
        return { success: true };
    };

    const verifyOtp = async (phone: string, otp: string) => {
        return { success: true };
    };

    const connectWallet = async () => {
        return { success: true, address: '0x1234...abcd' };
    };

    return (
        <AuthContext.Provider value={{
            user,
            loginWithEmail,
            loginWithPhone,
            loginWithWallet,
            register,
            sendOtp,
            verifyOtp,
            connectWallet
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}