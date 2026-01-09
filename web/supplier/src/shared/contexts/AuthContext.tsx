'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

// Define the User type matching backend
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'RESTAURANT_STAFF' | 'RESTAURANT_OWNER' | 'DELIVERY_DRIVER' | 'INVESTOR' | 'ADMIN' | 'SUPER_ADMIN';
    permissions?: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithPhone: (phone: string, password: string) => Promise<void>;
    loginWithWallet: (address: string, signature: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    sendOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;
    connectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from cookies/storage on mount
    useEffect(() => {
        const initializeAuth = () => {
            const storedToken = Cookies.get('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Failed to parse user data', error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);

        // Persist
        Cookies.set('token', newToken, { expires: 7 }); // 7 days
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('token');
        localStorage.removeItem('user');

        // Optional: Redirect to login or home
        // window.location.href = '/'; 
    };

    const loginWithEmail = async (email: string, password: string) => {
        // TODO: Implement email login
        console.log('loginWithEmail', email, password);
    };

    const loginWithPhone = async (phone: string, password: string) => {
        // TODO: Implement phone login
        console.log('loginWithPhone', phone, password);
    };

    const loginWithWallet = async (address: string, signature: string) => {
        // TODO: Implement wallet login
        console.log('loginWithWallet', address, signature);
    };

    const register = async (data: any) => {
        // TODO: Implement registration
        console.log('register', data);
    };

    const sendOtp = async (phone: string) => {
        // TODO: Implement OTP sending
        console.log('sendOtp', phone);
    };

    const verifyOtp = async (phone: string, otp: string) => {
        // TODO: Implement OTP verification
        console.log('verifyOtp', phone, otp);
    };

    const connectWallet = async () => {
        // TODO: Implement wallet connection
        console.log('connectWallet');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            logout,
            isAuthenticated: !!user,
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

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
