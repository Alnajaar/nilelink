"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/AuthService';

export interface User {
    id: string;
    email?: string;
    phone?: string;
    walletAddress?: string;
    firstName?: string;
    lastName?: string;
    role: string; // Keep flexible to support both old and new role types
    isActive?: boolean;
    authType?: 'email' | 'phone' | 'wallet' | 'pin';
    // Legacy fields for backward compatibility
    businessId?: string;
    businessName?: string;
    pin?: string;
    plan?: 'free' | 'standard' | 'enterprise';
    trialExpiresAt?: Date;
    permissions?: string[];
    terminals?: string[];
    lastLogin?: Date;
    tenantId?: string;
}

export interface Business {
    id: string;
    name: string;
    ownerId: string;
    plan: 'free' | 'standard' | 'enterprise';
    trialExpiresAt?: Date;
    settings: {
        currency: string;
        taxRate: number;
        country: string;
        address: string;
        timezone: string;
    };
    terminals: Terminal[];
    staff: User[];
    isActive: boolean;
}

export interface Terminal {
    id: string;
    name: string;
    businessId: string;
    pin: string;
    isActive: boolean;
    lastUsed?: Date;
}

interface AuthContextType {
    user: User | null;
    business: Business | null;
    loading: boolean;
    // Owner/Admin authentication
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithPhone: (phone: string, otp: string) => Promise<void>;
    // Staff authentication
    loginWithPin: (terminalId: string, pin: string) => Promise<void>;
    // Wallet authentication
    connectWallet: () => Promise<void>;
    // Registration
    registerBusiness: (businessData: BusinessRegistrationData) => Promise<void>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    sendVerificationOTP: (contact: string, type: 'email' | 'phone') => Promise<{ success: boolean; error?: string }>;
    verifyOTPAndCompleteRegistration: (contact: string, otp: string, type: 'email' | 'phone') => Promise<{ success: boolean; error?: string }>;
    // OTP methods
    sendOtp: (email: string, purpose?: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    // General
    login: (token: string, user: User) => void;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    // Business management
    createTerminal: (terminalData: Partial<Terminal>) => Promise<Terminal>;
    getTerminals: () => Terminal[];
    updateBusinessSettings: (settings: Partial<Business['settings']>) => Promise<void>;
}

interface BusinessRegistrationData {
    businessName: string;
    ownerEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    password: string;
    plan: 'free' | 'standard' | 'enterprise';
    currency: string;
    country: string;
    address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory storage for demo purposes
export const STORAGE_KEYS = {
    USERS: 'nilelink_users',
    BUSINESSES: 'nilelink_businesses',
    TERMINALS: 'nilelink_terminals',
    CURRENT_USER: 'nilelink_current_user',
    CURRENT_BUSINESS: 'nilelink_current_business'
};

export function AuthProvider({ children }: { children: ReactNode }) {
    // For now, disable demo mode and use production APIs
    const isDemoMode = false;
    const [user, setUser] = useState<User | null>(null);
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check auth status
        checkAuthStatus();
    }, []);

    const initializeStorage = () => {
        // Initialize with demo data
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const demoUsers: User[] = [
                {
                    id: 'admin-1',
                    email: 'admin@nilelink.app',
                    firstName: 'John',
                    lastName: 'Admin',
                    role: 'ADMIN',
                    businessId: 'business-1',
                    isActive: true,
                    authType: 'email',
                    permissions: ['*'],
                    lastLogin: new Date()
                },
                {
                    id: 'owner-1',
                    email: 'owner@nilelink.app',
                    firstName: 'Sarah',
                    lastName: 'Owner',
                    role: 'OWNER',
                    businessId: 'business-1',
                    businessName: 'NileLink Grill',
                    isActive: true,
                    authType: 'email',
                    plan: 'enterprise',
                    permissions: ['*'],
                    lastLogin: new Date()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
        }

        if (!localStorage.getItem(STORAGE_KEYS.BUSINESSES)) {
            const demoBusinesses: Business[] = [
                {
                    id: 'business-1',
                    name: 'NileLink Grill',
                    ownerId: 'owner-1',
                    plan: 'enterprise',
                    settings: {
                        currency: 'EGP',
                        taxRate: 14,
                        country: 'Egypt',
                        address: '123 Nile Street, Cairo',
                        timezone: 'Africa/Cairo'
                    },
                    terminals: [
                        {
                            id: 'terminal-1',
                            name: 'Main Counter',
                            businessId: 'business-1',
                            pin: '1234',
                            isActive: true,
                            lastUsed: new Date()
                        }
                    ],
                    staff: [],
                    isActive: true
                }
            ];
            localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(demoBusinesses));
        }
    };

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('nilelink_auth_token');
            if (!token) {
                // Check if we have a demo user in local storage (fallback)
                if (isDemoMode) {
                    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
                    if (storedUser) setUser(JSON.parse(storedUser));
                }
                return;
            }

            // Verify with backend using authService
            const user = await authService.getCurrentUser();

            if (user) {
                if (user.lastLogin) user.lastLogin = new Date(user.lastLogin);
                setUser(user);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            } else {
                // Token invalid or expired
                console.warn('Token expired or invalid');
                localStorage.removeItem('nilelink_auth_token');
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('nilelink_auth_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Owner/Admin Login Methods
    const loginWithEmail = async (email: string, password: string) => {
        setLoading(true);
        try {
            // Use authService (disabled demo mode)
            const result = await authService.login(email, password);
            if (!result.success) throw new Error(result.error || 'Login failed');

            if (result.user) {
                setUser(result.user);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginWithPhone = async (phone: string, otp: string) => {
        setLoading(true);
        try {
            // In production, verify OTP with backend
            // For demo, accept any OTP for any phone

            const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            let user = users.find(u => u.phone === phone && u.authType === 'phone');

            if (!user) {
                // Create new user if doesn't exist
                user = {
                    id: `phone-${Date.now()}`,
                    phone,
                    role: 'CUSTOMER',
                    isActive: true,
                    authType: 'phone',
                    lastLogin: new Date()
                };
                users.push(user);
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            }

            user.lastLogin = new Date();
            setUser(user);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Staff PIN Login
    const loginWithPin = async (terminalId: string, pin: string) => {
        setLoading(true);
        try {
            const terminals: Terminal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TERMINALS) || '[]');
            const terminal = terminals.find(t => t.id === terminalId && t.pin === pin && t.isActive);

            if (!terminal) {
                throw new Error('Invalid terminal PIN');
            }

            // Create staff user session
            const staffUser: User = {
                id: `staff-${terminalId}-${Date.now()}`,
                role: 'STAFF',
                businessId: terminal.businessId,
                pin,
                isActive: true,
                authType: 'pin',
                lastLogin: new Date(),
                permissions: ['pos_read', 'pos_write', 'orders_read', 'orders_write']
            };

            // Load business
            const businesses: Business[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESSES) || '[]');
            const userBusiness = businesses.find(b => b.id === terminal.businessId);

            if (!userBusiness) {
                throw new Error('Terminal not associated with any business');
            }

            setUser(staffUser);
            setBusiness(userBusiness);

            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(staffUser));
            localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(userBusiness));

            // Update terminal last used
            terminal.lastUsed = new Date();
            const updatedTerminals = terminals.map(t => t.id === terminalId ? terminal : t);
            localStorage.setItem(STORAGE_KEYS.TERMINALS, JSON.stringify(updatedTerminals));

        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Wallet Authentication
    const connectWallet = async () => {
        setLoading(true);
        try {
            // In production, integrate with Web3 wallet
            // For demo, simulate wallet connection

            const walletUser: User = {
                id: `wallet-${Date.now()}`,
                walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                role: 'CUSTOMER',
                isActive: true,
                authType: 'wallet',
                lastLogin: new Date()
            };

            setUser(walletUser);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(walletUser));

        } catch (error) {
            throw new Error('Wallet connection failed');
        } finally {
            setLoading(false);
        }
    };

    // Business Registration
    const registerBusiness = async (businessData: BusinessRegistrationData) => {
        setLoading(true);
        try {
            const businesses: Business[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESSES) || '[]');
            const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

            // Create business
            const businessId = `business-${Date.now()}`;
            const newBusiness: Business = {
                id: businessId,
                name: businessData.businessName,
                ownerId: `owner-${Date.now()}`,
                plan: businessData.plan,
                trialExpiresAt: businessData.plan === 'free' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : undefined,
                settings: {
                    currency: businessData.currency,
                    taxRate: 14, // Default
                    country: businessData.country,
                    address: businessData.address,
                    timezone: 'Africa/Cairo' // Default
                },
                terminals: [],
                staff: [],
                isActive: true
            };

            // Create owner user
            const newUser: User = {
                id: newBusiness.ownerId,
                email: businessData.ownerEmail,
                firstName: businessData.ownerFirstName,
                lastName: businessData.ownerLastName,
                role: 'OWNER',
                businessId,
                businessName: businessData.businessName,
                isActive: true,
                authType: 'email',
                plan: businessData.plan,
                trialExpiresAt: newBusiness.trialExpiresAt,
                permissions: ['*'],
                terminals: [],
                lastLogin: new Date()
            };

            businesses.push(newBusiness);
            users.push(newUser);

            localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

            setUser(newUser);
            setBusiness(newBusiness);

            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
            localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(newBusiness));

        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Terminal Management
    const createTerminal = async (terminalData: Partial<Terminal>): Promise<Terminal> => {
        if (!business) throw new Error('No business context');

        const terminals: Terminal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TERMINALS) || '[]');

        const newTerminal: Terminal = {
            id: `terminal-${Date.now()}`,
            name: terminalData.name || 'New Terminal',
            businessId: business.id,
            pin: terminalData.pin || Math.floor(1000 + Math.random() * 9000).toString(),
            isActive: true,
            lastUsed: undefined
        };

        terminals.push(newTerminal);
        business.terminals.push(newTerminal);

        localStorage.setItem(STORAGE_KEYS.TERMINALS, JSON.stringify(terminals));
        localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(business));

        setBusiness({ ...business });
        return newTerminal;
    };

    const getTerminals = (): Terminal[] => {
        return business?.terminals || [];
    };

    // Business Settings
    const updateBusinessSettings = async (settings: Partial<Business['settings']>) => {
        if (!business) throw new Error('No business context');

        const updatedBusiness = {
            ...business,
            settings: { ...business.settings, ...settings }
        };

        const businesses: Business[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESSES) || '[]');
        const updatedBusinesses = businesses.map(b => b.id === business.id ? updatedBusiness : b);

        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(updatedBusinesses));
        localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(updatedBusiness));

        setBusiness(updatedBusiness);
    };

    // General Methods
    const logout = async () => {
        setUser(null);
        setBusiness(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_BUSINESS);
        localStorage.removeItem('nilelink_auth_token');
    };

    const refreshAuth = async () => {
        await checkAuthStatus();
    };

    // New registration methods to support POS and other apps
    const register = async (data: any) => {
        setLoading(true);
        try {
            const result = await authService.register(data);

            if (!result.success) {
                throw new Error(result.error || 'Registration failed');
            }

            if (result.user) {
                setUser(result.user);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
            }

            return { success: true };
        } catch (error: any) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationOTP = async (contact: string, type: 'email' | 'phone') => {
        setLoading(true);
        try {
            console.log(`Sending ${type} OTP to ${contact}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const verifyOTPAndCompleteRegistration = async (contact: string, otp: string, type: 'email' | 'phone') => {
        setLoading(true);
        try {
            console.log(`Verifying ${type} OTP ${otp} for ${contact}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real scenario, we would finalize the user here
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (email: string, purpose?: string) => {
        setLoading(true);
        try {
            console.log(`Sending OTP to ${email} for ${purpose || 'login'}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (email: string, otp: string) => {
        setLoading(true);
        try {
            console.log(`Verifying OTP ${otp} for ${email}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful verification
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const login = (token: string, newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
        localStorage.setItem('nilelink_auth_token', token);
    };

    const value: AuthContextType = {
        user,
        business,
        loading,
        loginWithEmail,
        loginWithPhone,
        loginWithPin,
        connectWallet,
        registerBusiness,
        register,
        sendVerificationOTP,
        verifyOTPAndCompleteRegistration,
        sendOtp,
        verifyOtp,
        login,
        logout,
        refreshAuth,
        createTerminal,
        getTerminals,
        updateBusinessSettings
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
