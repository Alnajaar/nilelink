'use client';

import { useWallet as useSharedWallet } from '@shared/contexts/WalletContext';

// Export the shared wallet hook as the driver app's wallet hook
export function useWallet() {
  return useSharedWallet();
}
