'use client';

/**
 * Re-export AuthWalletContext as AuthContext for backward compatibility
 * This ensures all existing imports continue to work
 */

import {
    AuthWalletProvider as BaseAuthWalletProvider,
    useAuthWallet,
    AuthWalletContextType,
    AuthState,
    WalletState,
    UserProfile,
    UserRole
} from './AuthWalletContext';

// Re-export types
export type { AuthState, WalletState, UserProfile, UserRole, AuthWalletContextType };

// Create a simplified useAuth hook that only returns auth-related data
export const useAuth = () => {
    const context = useAuthWallet();
    return {
        ...context.auth,
        signOut: context.signOut,
        updateUserProfile: context.updateUserProfile,
        refreshUserProfile: context.refreshUserProfile,
        hasRole: context.hasRole,
        isAuthenticated: context.auth.isAuthenticated,
        user: context.auth.user,
        isLoading: context.auth.isLoading,
        error: context.auth.error
    };
};

// Re-export AuthWalletProvider as AuthProvider for compatibility
export const AuthProvider = BaseAuthWalletProvider;

// Also export the full context hook
export { useAuthWallet };
