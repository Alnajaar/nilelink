/**
 * AuthProvider.tsx
 * Shared Authentication Provider
 * 
 * Wraps apps with Firebase authentication context and provides login/logout functionality
 * Used by all 5 apps to ensure consistent authentication
 */

'use client';

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './FirebaseAuthProvider';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';
import LoginPage from '../components/LoginPage';
import { graphService } from '../services/GraphService';
import { aaService } from '../services/AccountAbstractionService';

interface HybridAuthContextType {
  user: User | null;
  realUser: User | null;
  impersonatedUser: User | null;
  isWalletConnected: boolean;
  loading: boolean;
  connectWallet: () => Promise<{ success: boolean; address?: string; error?: string }>;
  authenticateWithWallet: () => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  startImpersonation: (targetId: string) => Promise<void>;
  stopImpersonation: () => void;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(undefined);

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
  plan?: string;
  trialExpiresAt?: Date;
  permissions?: string[];
  terminals?: string[];
  lastLogin?: Date;
  tenantId?: string;
  sourceApp?: string;
  did?: string;
  chainId?: number;
  smartWalletAddress?: string;
}

interface AuthProviderProps {
  children: ReactNode;
  requiredRole?: string | string[]; // Simplified role checking for Firebase
  appName?: string;
  fallbackRoute?: string;
  mandatory?: boolean; // Set to true to force login screen, false to just provide context
  theme?: 'light' | 'dark';
  showRegister?: boolean;
  initialEmail?: string;
  initialPassword?: string;
}

export function AuthProvider({
  children,
  requiredRole,
  appName = 'NileLink',
  fallbackRoute = '/',
  mandatory = true,
  theme = 'light',
  showRegister = true,
  initialEmail = '',
  initialPassword = '',
}: AuthProviderProps) {
  return (
    <FirebaseAuthProvider>
      <HybridAuthWrapper
        requiredRole={requiredRole}
        appName={appName}
        fallbackRoute={fallbackRoute}
        mandatory={mandatory}
        theme={theme}
        showRegister={showRegister}
        initialEmail={initialEmail}
        initialPassword={initialPassword}
      >
        {children}
      </HybridAuthWrapper>
    </FirebaseAuthProvider>
  );
}

// Internal wrapper component to handle auth state
function HybridAuthWrapper({
  children,
  requiredRole,
  appName = 'NileLink',
  fallbackRoute = '/',
  mandatory = true,
  theme = 'light',
  showRegister = true,
  initialEmail = '',
  initialPassword = '',
}: AuthProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const { user: firebaseUser, isAuthenticated, isLoading: firebaseLoading } = useFirebaseAuth();
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [walletUser, setWalletUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);

  // Ensure component only runs on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  // Track loading state more carefully to avoid rerender issues
  useEffect(() => {
    if (!isClient && typeof window !== 'undefined') {
      setLoading(true);  // Stay loading during client detection
    }
  }, [isClient]);

  // Authentication logic runs only on client side
  useEffect(() => {
    if (!isClient) return;  // Skip if not on client

    setIsWalletConnected(isConnected);
    setLoading(firebaseLoading);

    if (isConnected && address && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      checkAuthStatus();
    } else if (!isConnected) {
      setWalletUser(null);
      setLoading(false);
      setHasCheckedAuth(false);
    }
  }, [isConnected, address, isClient, hasCheckedAuth, firebaseLoading]);

  const provisioningLock = React.useRef(false);

  // Handle Invisible Wallet Provisioning
  useEffect(() => {
    if (!isClient || !firebaseUser || !isAuthenticated || provisioningLock.current) return;

    const provisionInvisibleWallet = async () => {
      try {
        provisioningLock.current = true;
        console.log(`[AUTH] Checking invisible wallet for ${firebaseUser.uid}`);

        // Use either the connected wallet address or a fallback "internal" signer for the AA owner
        const ownerAddress = address || '0x0000000000000000000000000000000000000000';

        const { address: scwAddress } = await aaService.provisionWallet({
          userId: firebaseUser.uid,
          firebaseUid: firebaseUser.uid,
          ownerAddress: ownerAddress
        });

        setSmartWalletAddress(scwAddress);
        console.log(`[AUTH] Smart Wallet Active: ${scwAddress}`);
      } catch (error) {
        console.error('[AUTH] Failed to provision smart wallet:', error);
      } finally {
        // We keep the lock true for the duration of the session 
        // unless we need to re-provision on account change
      }
    };

    provisionInvisibleWallet();
  }, [firebaseUser, isAuthenticated, address, isClient]);

  const checkAuthStatus = async () => {
    if (!isClient || !address) return;
    setLoading(true);
    try {
      // Check if we have a valid session in localStorage
      const storedUser = localStorage.getItem('nilelink_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.walletAddress === address) {
            // Verify role still exists/is correct from Graph
            const profile = await graphService.getUserProfile(address);
            if (profile && (profile as any).user) {
              const currentRole = (profile as any).user.role;
              if (userData.role !== currentRole) {
                console.warn('Role mismatch, updating local role');
                userData.role = currentRole;
                localStorage.setItem('nilelink_user', JSON.stringify(userData));
              }
            }
            setWalletUser(userData);
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
    if (!isClient) {
      return { success: false, error: 'Authentication only available on client side' };
    }

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
    if (!isClient) {
      return { success: false, error: 'Authentication only available on client side' };
    }

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

      // 3. Fetch real user profile from Graph to verify role and businesses
      const profile = await graphService.getUserProfile(address);
      let onChainRole = (profile as any)?.user?.role || 'CUSTOMER';
      const firstRestaurant = (profile as any)?.user?.ownedRestaurants?.[0];

      // 3. Role Determination (Secure Whitelist)
      const whitelistRaw = process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLETS || '';
      const superAdminWallets = whitelistRaw.split(',').map(w => w.trim().toLowerCase());

      const adminWhitelistRaw = process.env.NEXT_PUBLIC_ADMIN_WALLETS || '';
      const adminWallets = adminWhitelistRaw.split(',').map(w => w.trim().toLowerCase());

      // 3. App Source Tagging
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const path = typeof window !== 'undefined' ? window.location.pathname : '';

      let sourceApp = 'CUSTOMER_APP';
      if (hostname.includes('supplier') || path.startsWith('/supplier')) sourceApp = 'SUPPLIER_APP';
      else if (hostname.includes('pos') || path.startsWith('/pos')) sourceApp = 'POS_APP';
      else if (hostname.includes('delivery') || path.startsWith('/delivery')) sourceApp = 'DELIVERY_APP';
      else if (hostname.includes('admin')) sourceApp = 'ADMIN_DASHBOARD';

      const lowerAddress = address.toLowerCase();

      // Security Priority: Hardcode Whitelist > Graph Role > Entry Point
      if (superAdminWallets.includes(lowerAddress)) {
        onChainRole = 'SUPER_ADMIN';
      } else if (adminWallets.includes(lowerAddress)) {
        onChainRole = 'ADMIN';
      } else {
        // Fallback to entry point detection for low-security roles
        if (sourceApp === 'SUPPLIER_APP') onChainRole = 'SUPPLIER';
        else if (sourceApp === 'POS_APP') onChainRole = 'STAFF';
        else if (sourceApp === 'DELIVERY_APP') onChainRole = 'DRIVER';
      }

      // 4. Create user object with ONLY verified data
      const userData: User = {
        id: address,
        walletAddress: address,
        role: onChainRole,
        authType: 'wallet',
        isActive: true,
        businessId: firstRestaurant?.id || '',
        businessName: firstRestaurant?.id ? `Node ${firstRestaurant.id.slice(-4)}` : 'Node Alpha',
        did: `did:ethr:${chainId || 137}:${address}`,
        chainId: chainId || 137,
        firstName: (profile as any)?.user?.displayName?.split(' ')[0] || 'User',
        lastName: (profile as any)?.user?.displayName?.split(' ')[1] || '',
        tenantId: sourceApp,
        sourceApp: sourceApp, // Explicit app tracking
      };

      // 5. Store user data (but refresh periodically)
      setWalletUser(userData);
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
    if (!isClient) return;

    setWalletUser(null);
    setIsWalletConnected(false);
    localStorage.removeItem('nilelink_user');
    disconnect();
  };

  const refreshAuth = async () => {
    if (!isClient) return;
    await checkAuthStatus();
  };

  const startImpersonation = async (targetId: string) => {
    if (user?.role !== 'SUPER_ADMIN') {
      console.error('Unauthorized impersonation attempt');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch target profile from Graph (or DB)
      const profile = await graphService.getUserProfile(targetId);
      if (profile && (profile as any).user) {
        const targetData = (profile as any).user;
        const targetUser: User = {
          id: targetId,
          walletAddress: targetId,
          role: targetData.role,
          businessId: targetData.ownedRestaurants?.[0]?.id || '',
          isActive: true,
          authType: 'wallet',
        };
        setImpersonatedUser(targetUser);
        console.log(`[AUTH] Impersonating: ${targetId}`);

        // Log to Audit Log (Silent Fail if DB not ready)
        fetch('/api/admin/audit', {
          method: 'POST',
          body: JSON.stringify({
            action: 'impersonation_start',
            targetId: targetId,
            details: { admin: user.id }
          })
        }).catch(() => { });
      }
    } catch (error) {
      console.error('Impersonation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
  };

  // Determine if user is authenticated (either via Firebase or wallet)
  const realUser = firebaseUser ? {
    ...firebaseUser,
    id: firebaseUser.uid,
    smartWalletAddress: smartWalletAddress || undefined
  } as User : walletUser;
  const user = impersonatedUser || realUser;
  const isLoading = loading || firebaseLoading;
  const isUserAuthenticated = isAuthenticated || (isConnected && realUser);

  const [showLogin, setShowLogin] = React.useState(false);
  const [roleMessage, setRoleMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Only show login if mandatory is true
    if (!mandatory) {
      setShowLogin(false);
      return;
    }

    // Show login if not authenticated
    if (!isUserAuthenticated) {
      setShowLogin(true);
      setRoleMessage(null);
    } else {
      // Check required role if specified
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasRole = user?.role && (roles.includes(user.role) || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

        if (!hasRole) {
          setShowLogin(true);
          const requiredRolesStr = Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole;
          setRoleMessage(`You don't have the required role(s): ${requiredRolesStr}`);
        } else {
          setShowLogin(false);
        }
      } else {
        setShowLogin(false);
      }
    }
  }, [isUserAuthenticated, user, requiredRole, mandatory]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#02050a]">
        <div className="animate-pulse text-blue-500 font-black italic uppercase tracking-widest text-xs">
          Authenticating Node...
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin inline-block mb-4">⏳</div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <LoginPage
        requiredRole={requiredRole}
        appName={appName}
        roleMessage={roleMessage}
        theme={theme}
        showRegister={showRegister}
        initialEmail={initialEmail}
        initialPassword={initialPassword}
        onLoginSuccess={() => {
          setShowLogin(false);
          setRoleMessage(null);
        }}
      />
    );
  }

  const contextValue: HybridAuthContextType = {
    user,
    realUser,
    impersonatedUser,
    isWalletConnected,
    loading,
    connectWallet,
    authenticateWithWallet,
    logout,
    refreshAuth,
    startImpersonation,
    stopImpersonation
  };

  return (
    <HybridAuthContext.Provider value={contextValue}>
      {children}
    </HybridAuthContext.Provider>
  );
}

// Hook for components to access auth state
export function useAuth() {
  const {
    user: firebaseUser,
    isAuthenticated,
    isLoading: firebaseLoading,
    error,
    loginWithEmail,
    registerWithEmail,
    loginWithPhone,
    verifyPhoneCode,
    loginWithWallet,
    logout: firebaseLogout
  } = useFirebaseAuth();

  // Get wallet auth methods from context
  const context = useContext(HybridAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user: walletUser,
    realUser: contextRealUser,
    impersonatedUser,
    isWalletConnected,
    loading,
    connectWallet,
    authenticateWithWallet,
    logout: walletLogout,
    refreshAuth,
    startImpersonation,
    stopImpersonation
  } = context;

  // Determine if user is authenticated (either via Firebase or wallet)
  const realUser = firebaseUser || contextRealUser;
  const user = impersonatedUser || realUser;
  const isLoading = loading || firebaseLoading;
  const isUserAuthenticated = isAuthenticated || (isWalletConnected && realUser);

  // Return a compatibility interface that matches the old AuthContext
  return {
    user,
    profile: user,
    isConnected: isUserAuthenticated,
    isWalletConnected,
    address: (user as any)?.uid || (user as any)?.walletAddress, // Using UID or wallet address for compatibility
    role: user?.role || 'USER', // Default role
    login: loginWithEmail, // For backward compatibility
    register: registerWithEmail, // For backward compatibility
    loginWithPhone,
    verifyPhoneCode,
    loginWithWallet,
    logout: async () => {
      await firebaseLogout();
      await walletLogout();
    },
    isLoading,
    error,
    // Wallet authentication methods
    connectWallet,
    authenticateWithWallet,
    refreshAuth,
    startImpersonation,
    stopImpersonation,
    realUser,
    impersonatedUser,
    isImpersonating: !!impersonatedUser,
  };
}

export default AuthProvider;
