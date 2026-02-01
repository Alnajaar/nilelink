export interface LoyaltyTier {
    name: string;
    minPoints: number;
    benefits: string[];
    color: string;
}

export interface Reward {
    id: string;
    title: string;
    description: string;
    pointsCost: number;
    category: string;
    available: boolean;
    imageUrl?: string;
}

export interface LoyaltyActivity {
    id: string;
    date: string; // ISO string
    action: string;
    points: number;
    type: 'earn' | 'spend';
}

export interface LoyaltyProfile {
    userId: string;
    currentPoints: number;
    totalEarned: number;
    currentTier: string;
    recentActivity: LoyaltyActivity[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LoyaltyData extends LoyaltyProfile {
    nextTier?: string;
    pointsToNextTier?: number;
    tiers: LoyaltyTier[];
}

export interface RewardsData {
    rewards: Reward[];
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
    { name: 'Bronze', minPoints: 0, benefits: ['Basic rewards'], color: 'bronze' },
    { name: 'Silver', minPoints: 500, benefits: ['5% bonus points', 'Priority support'], color: 'silver' },
    { name: 'Gold', minPoints: 1000, benefits: ['10% bonus points', 'Free delivery', 'Exclusive offers'], color: 'gold' }
];
