'use client';

import { useAuth } from '@shared/contexts/AuthContext';

export function useDriverAuth() {
  const { user, loading } = useAuth();
  
  const driverId = user?.id || null;
  const isAuthorized = user?.role === 'DRIVER' || false;
  
  return {
    driverId,
    isAuthorized,
    loading,
  };
}
