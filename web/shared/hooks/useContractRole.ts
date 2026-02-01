/**
 * useContractRole.ts
 * React Hook for Smart Contract Role Verification
 * 
 * Provides easy access to user role and profile from blockchain
 * Usage: const { role, profile, hasRole } = useContractRole(userAddress);
 */

import { useEffect, useState, useCallback } from 'react';
import ContractService, { UserRole } from '@shared/services/web3/ContractService';

interface UserProfile {
  address: string;
  role: UserRole | null;
  isRestaurantOwner: boolean;
  isDriver: boolean;
  isSupplier: boolean;
  restaurantName?: string;
  driverDeliveries?: number;
  supplierName?: string;
}

interface UseContractRoleReturn {
  role: UserRole | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to get user's role and profile from smart contracts
 * @param address - User's wallet address
 * @param enabled - Whether to fetch role (default: true)
 */
export function useContractRole(
  address: string | null | undefined,
  enabled: boolean = true
): UseContractRoleReturn {
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const contractService = ContractService.getInstance();

  const fetchRole = useCallback(async () => {
    if (!address || !enabled) {
      setRole(null);
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user role
      const userRole = await contractService.getRole(address);
      setRole(userRole);

      // Get full profile
      const userProfile = await contractService.getUserProfile(address);
      setProfile(userProfile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch role');
      setError(error);
      console.error('Error fetching contract role:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, enabled, contractService]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const hasRole = useCallback(
    (requiredRole: UserRole | UserRole[]): boolean => {
      if (!role) {
        return false;
      }

      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return requiredRoles.includes(role);
    },
    [role]
  );

  return {
    role,
    profile,
    isLoading,
    error,
    hasRole,
    refetch: fetchRole,
  };
}

/**
 * Helper hook to check if user has specific role
 * @param address - User's wallet address
 * @param requiredRole - Role(s) to check
 * @param enabled - Whether to check (default: true)
 */
export function useHasRole(
  address: string | null | undefined,
  requiredRole: UserRole | UserRole[],
  enabled: boolean = true
): {
  hasRole: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { hasRole, isLoading, error } = useContractRole(address, enabled);

  return {
    hasRole: hasRole(requiredRole),
    isLoading,
    error,
  };
}

/**
 * Helper hook to check if user is restaurant owner
 */
export function useIsRestaurantOwner(address: string | null | undefined): {
  isOwner: boolean;
  isLoading: boolean;
  restaurantName?: string;
} {
  const { role, profile, isLoading } = useContractRole(address);

  return {
    isOwner: role === UserRole.OWNER,
    isLoading,
    restaurantName: profile?.restaurantName,
  };
}

/**
 * Helper hook to check if user is driver
 */
export function useIsDriver(address: string | null | undefined): {
  isDriver: boolean;
  isLoading: boolean;
  deliveries?: number;
} {
  const { role, profile, isLoading } = useContractRole(address);

  return {
    isDriver: role === UserRole.DRIVER,
    isLoading,
    deliveries: profile?.driverDeliveries,
  };
}

/**
 * Helper hook to check if user is supplier
 */
export function useIsSupplier(address: string | null | undefined): {
  isSupplier: boolean;
  isLoading: boolean;
  supplierName?: string;
} {
  const { role, profile, isLoading } = useContractRole(address);

  return {
    isSupplier: role === UserRole.SUPPLIER,
    isLoading,
    supplierName: profile?.supplierName,
  };
}

export default useContractRole;
