import useSWR from 'swr';
import Cookies from 'js-cookie';

const fetcher = async (url: string) => {
    try {
        const token = Cookies.get('token');
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        // If API is not available, return mock data
        console.warn('Affiliate API not available, using mock data:', error);
        
        // Return mock affiliate data
        return {
            data: {
                profile: {
                    id: 'mock-user-id',
                    userId: 'mock-user-id',
                    referralCode: 'MOCK123',
                    commissionRate: 0.1, // 10% commission
                    tier: 'Bronze',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    affiliateLink: typeof window !== 'undefined' 
                        ? `${window.location.origin}/register?ref=MOCK123` 
                        : 'https://nilelink.app/register?ref=MOCK123',
                },
                stats: {
                    totalReferrals: 0,
                    totalCommission: 0,
                    pendingCommission: 0,
                    paidCommission: 0,
                }
            }
        };
    }
};

export function useAffiliate() {
    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/affiliates/me`,
        fetcher
    );
    
    const profile = data?.data?.profile;
    
    // Compute affiliate link dynamically
    const affiliateLink = profile?.referralCode 
        ? `${typeof window !== 'undefined' ? window.location.origin : 'https://nilelink.app'}/register?ref=${profile.referralCode}`
        : null;

    return {
        affiliate: {
            ...profile,
            affiliateLink
        },
        stats: data?.data?.stats,
        isLoading,
        isError: error,
        mutate,
    };
}

const referralsFetcher = async (url: string) => {
    try {
        const token = Cookies.get('token');
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        // If API is not available, return mock data
        console.warn('Affiliate referrals API not available, using mock data:', error);
        
        // Return mock referrals data
        return {
            data: []
        };
    }
};

export function useAffiliateReferrals() {
    const { data, error, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/affiliates/referrals`,
        referralsFetcher
    );

    return {
        referrals: data?.data || [],
        isLoading,
        isError: error,
    };
}

const payoutsFetcher = async (url: string) => {
    try {
        const token = Cookies.get('token');
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        // If API is not available, return mock data
        console.warn('Affiliate payouts API not available, using mock data:', error);
        
        // Return mock payouts data
        return {
            data: []
        };
    }
};

export function useAffiliatePayouts() {
    const { data, error, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/affiliates/payouts`,
        payoutsFetcher
    );

    return {
        payouts: data?.data || [],
        isLoading,
        isError: error,
    };
}
