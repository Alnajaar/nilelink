/**
 * Unified Authentication and Wallet Context
 * Provides a unified authentication and wallet connection system for all apps
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

// Define user types
export type UserRole = 'CUSTOMER' | 'DRIVER' | 'RESTAURANT_OWNER' | 'ADMIN' | 'INVESTOR' | 'SUPPLIER';

export interface UserProfile {
  id: string;
  address: string;
  role: UserRole;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: number;
  lastLogin: number;
  businessId?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthWalletContextType {
  auth: AuthState;
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  signInWithEthereum: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  refreshUserProfile: () => Promise<void>;
  getAccessToken: () => string | null;
  hasRole: (role: UserRole) => boolean;
}

// Create context
const AuthWalletContext = createContext<AuthWalletContextType | undefined>(undefined);

// Provider component
export const AuthWalletProvider: React.FC<{ children: ReactNode; appName?: string }> = ({
  children,
  appName = 'NileLink'
}) => {
  // Auth state
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null
  });

  // Wallet state
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null
  });

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // Initialize wallet state when account changes
  useEffect(() => {
    if (isConnected && address) {
      // Get provider from wagmi
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      setWallet({
        isConnected: true,
        address,
        chainId: chain?.id || null,
        provider,
        signer
      });
    } else {
      setWallet({
        isConnected: false,
        address: null,
        chainId: null,
        provider: null,
        signer: null
      });
    }
  }, [isConnected, address, chain?.id]);

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        const savedToken = localStorage.getItem('nilelink_auth_token');
        const savedUser = localStorage.getItem('nilelink_user_profile');

        if (savedToken && savedUser) {
          try {
            const userProfile = JSON.parse(savedUser) as UserProfile;

            // Verify token is still valid (simple check)
            const tokenPayload = savedToken.split('.')[1];
            if (tokenPayload) {
              const decoded = JSON.parse(atob(tokenPayload));
              const currentTime = Date.now() / 1000;

              if (decoded.exp > currentTime) {
                setAuth({
                  isAuthenticated: true,
                  user: userProfile,
                  token: savedToken,
                  isLoading: false,
                  error: null
                });
                return;
              }
            }
          } catch (parseError) {
            console.error('Error parsing saved auth data:', parseError);
          }
        }

        // If no valid auth data, set as unauthenticated
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Initialization error'
        });
      }
    };

    initializeAuth();
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      // Find injected connector (MetaMask, etc.)
      const injectedConnector = connectors.find(connector => connector.id === 'injected');

      if (injectedConnector) {
        await connect({ connector: injectedConnector });
      } else {
        throw new Error('No injected wallet found');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setAuth(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Wallet connection failed'
      }));
    }
  }, [connect, connectors]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      // Sign out from app
      signOut();

      // Disconnect wallet
      if (isConnected) {
        wagmiDisconnect();
      }

      // Clear auth state
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null
      });

      // Clear local storage
      localStorage.removeItem('nilelink_auth_token');
      localStorage.removeItem('nilelink_user_profile');
    } catch (error) {
      console.error('Error disconnecting:', error);
      setAuth(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Disconnection failed'
      }));
    }
  }, [isConnected, wagmiDisconnect]);

  // Sign in with Ethereum using SIWE
  const signInWithEthereum = useCallback(async () => {
    if (!wallet.signer || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));

      // Create SIWE message
      const domain = typeof window !== 'undefined' ? window.location.host : 'nilelink.app';
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nilelink.app';

      const message = new SiweMessage({
        domain,
        address: wallet.address as `0x${string}`,
        statement: `Sign in to ${appName} with your Ethereum account`,
        uri: origin,
        version: '1',
        chainId: wallet.chainId || 80002, // Default to Polygon Amoy
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
      });

      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ message: preparedMessage });

      // Verify the signature and get a token (in a real app, this would be a backend call)
      // For now, we'll create a mock token
      const mockToken = `mock.jwt.token.${Date.now()}`;

      // Try to fetch existing profile from Graph
      let graphUser = null;
      try {
        // Dynamic import to avoid circular dependencies if any
        const { graphService } = await import('../services/GraphService');
        graphUser = await graphService.getUserByWallet(wallet.address);
      } catch (err) {
        console.warn('Failed to fetch user from Graph:', err);
      }

      // Get or create user profile
      const userProfile: UserProfile = {
        id: graphUser?.id || `user_${wallet.address.substring(2, 10)}`,
        address: wallet.address,
        role: (graphUser?.role as UserRole) || 'CUSTOMER',
        businessId: graphUser?.businessId || undefined,
        createdAt: graphUser?.registeredAt ? Number(graphUser.registeredAt) * 1000 : Date.now(),
        lastLogin: Date.now()
      };

      // Save to local storage
      localStorage.setItem('nilelink_auth_token', mockToken);
      localStorage.setItem('nilelink_user_profile', JSON.stringify(userProfile));

      // Update state
      setAuth({
        isAuthenticated: true,
        user: userProfile,
        token: mockToken,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error signing in with Ethereum:', error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
      throw error;
    }
  }, [wallet.signer, wallet.address, wallet.chainId, signMessageAsync, appName]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true }));

      // Clear auth state
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null
      });

      // Clear local storage
      localStorage.removeItem('nilelink_auth_token');
      localStorage.removeItem('nilelink_user_profile');
    } catch (error) {
      console.error('Error signing out:', error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback((profileUpdate: Partial<UserProfile>) => {
    setAuth(prev => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...profileUpdate } as UserProfile;

      // Update in local storage
      localStorage.setItem('nilelink_user_profile', JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser
      };
    });
  }, []);

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true }));

      // In a real app, this would fetch the latest user data from the backend/smart contract
      // For now, we'll just update the lastLogin time
      if (auth.user) {
        const updatedUser = {
          ...auth.user,
          lastLogin: Date.now()
        };

        localStorage.setItem('nilelink_user_profile', JSON.stringify(updatedUser));

        setAuth(prev => ({
          ...prev,
          user: updatedUser,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile refresh failed'
      }));
    }
  }, [auth.user]);

  // Get access token
  const getAccessToken = useCallback((): string | null => {
    return auth.token;
  }, [auth.token]);

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    return auth.isAuthenticated && auth.user?.role === role;
  }, [auth.isAuthenticated, auth.user?.role]);

  const contextValue: AuthWalletContextType = {
    auth,
    wallet,
    connectWallet,
    disconnect,
    signInWithEthereum,
    signOut,
    updateUserProfile,
    refreshUserProfile,
    getAccessToken,
    hasRole
  };

  return (
    <AuthWalletContext.Provider value={contextValue}>
      {children}
    </AuthWalletContext.Provider>
  );
};

// Custom hook to use the context
export const useAuthWallet = (): AuthWalletContextType => {
  const context = useContext(AuthWalletContext);
  if (context === undefined) {
    throw new Error('useAuthWallet must be used within an AuthWalletProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuthProtection = (
  Component: React.ComponentType<any>,
  requiredRole?: UserRole
) => {
  return (props: any) => {
    const { auth, wallet } = useAuthWallet();

    // Check if authenticated
    if (!auth.isAuthenticated) {
      // Redirect to login or show unauthorized message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-4">Please connect your wallet to access this feature</p>
            {/* Login button would go here */}
          </div>
        </div>
      );
    }

    // Check if wallet is connected
    if (!wallet.isConnected) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Wallet Required</h2>
            <p className="mb-4">Please connect your wallet to continue</p>
            {/* Connect wallet button would go here */}
          </div>
        </div>
      );
    }

    // Check role if required
    if (requiredRole && !auth.user?.role.includes(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="mb-4">You don't have the required permissions to access this feature</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Auth guard component
export const AuthGuard: React.FC<{
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}> = ({ children, requiredRole, fallback }) => {
  const { auth, wallet } = useAuthWallet();

  // Show fallback or redirect if not authenticated
  if (!auth.isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please connect your wallet to access this feature</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if wallet not connected
  if (!wallet.isConnected) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wallet Required</h2>
          <p className="mb-4">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if user doesn't have required role
  if (requiredRole && !auth.user?.role.includes(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You don't have the required permissions to access this feature</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};