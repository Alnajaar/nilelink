import useSWR from 'swr';
import { auth } from '@shared/providers/FirebaseAuthProvider';
import { LoyaltyData, RewardsData } from '@/lib/models/Loyalty';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Use relative path to avoid CORS/Network configuration issues
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data as T;
}

const fetcher = async (url: string) => {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  return apiRequest(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
};

export function useLoyalty(userId?: string) {
  // Only fetch if userId is available to build the URL (and implicitly wait for Auth)
  const key = userId ? `/api/loyalty/profile?userId=${userId}` : null;

  const { data, error, isLoading, mutate } = useSWR<LoyaltyData>(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    loyalty: data || null,
    isLoading, // SWR isLoading is true if key is not null and no data. If key is null, it's false.
    isError: error,
    mutate,
  };
}

export function useRewards() {
  const { data, error, isLoading } = useSWR<RewardsData>(
    '/api/loyalty/rewards',
    fetcher, // Use fetcher to allow future authenticated rewards
    {
      revalidateOnFocus: false,
    }
  );

  return {
    rewards: data?.rewards || [],
    isLoading,
    isError: error,
  };
}

export async function redeemReward(rewardId: string): Promise<void> {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

  await apiRequest('/api/loyalty/redeem', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: JSON.stringify({ rewardId }),
  });
}
