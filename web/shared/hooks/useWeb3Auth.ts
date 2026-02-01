'use client';

import { useState, useCallback, useEffect } from 'react';
import { web3AuthService, type AuthSession } from '../services/web3/Web3AuthService';

export interface UseWeb3AuthReturn {
  isConnected: boolean;
  address: string | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Hook for wallet-first authentication using SIWE
 * Usage in all apps:
 * - POS App (Owner, Manager, Cashier roles)
 * - Customer App (Customer role)
 * - Driver App (Driver role)
 * - Admin App (Admin roles)
 * - Supplier App (Supplier role)
 */
export function useWeb3Auth(): UseWeb3AuthReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = web3AuthService.getSession();
    if (existingSession) {
      setSession(existingSession);
      setAddress(existingSession.address);
    }
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await web3AuthService.connectAndAuthenticate();
      if (result.success && result.user) {
        const newSession: AuthSession = {
          address: result.user.walletAddress,
          user: result.user,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        setSession(newSession);
        setAddress(newSession.address);
        web3AuthService.saveSession(newSession);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    web3AuthService.logout();
    setSession(null);
    setAddress(null);
    setError(null);
  }, []);

  return {
    isConnected: address !== null,
    address,
    session,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: web3AuthService.isAuthenticated(),
  };
}
