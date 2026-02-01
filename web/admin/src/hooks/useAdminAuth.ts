'use client';

import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';

type AdminRole = 'PROTOCOL_ADMIN' | 'SUPER_ADMIN' | 'GOVERNANCE_ROLE' | null;

export function useAdminAuth() {
  const { address } = useWallet();
  const [role, setRole] = useState<AdminRole>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    verifyAdminRole();
  }, [address]);

  const verifyAdminRole = async () => {
    try {
      // TODO: Call smart contract to verify role
      // For now, placeholder implementation
      const adminAddresses = process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',') || [];
      
      if (adminAddresses.includes(address?.toLowerCase() || '')) {
        setRole('PROTOCOL_ADMIN');
        setIsAuthorized(true);
      } else {
        setRole(null);
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Failed to verify admin role:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    isAuthorized,
    loading,
  };
}
