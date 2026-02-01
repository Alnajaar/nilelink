import { LoyaltyProfile, LoyaltyData, Reward, LOYALTY_TIERS, LoyaltyActivity } from '../models/Loyalty';
import { db } from '../firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Global persistence for fallback
declare global {
    var __loyalty_store: Map<string, LoyaltyProfile> | undefined;
}

const inMemoryLoyalty = global.__loyalty_store || new Map<string, LoyaltyProfile>();

const AVAILABLE_REWARDS: Reward[] = [
    {
        id: 'RW-DEL-01',
        title: 'Unlimited Free Delivery',
        description: 'Waived delivery fee on all orders for 30 days',
        pointsCost: 1500,
        category: 'Delivery',
        available: true
    },
    {
        id: 'RW-CASH-05',
        title: '$5 NileCredit',
        description: 'Instant credit added to your ecosystem wallet',
        pointsCost: 500,
        category: 'Credit',
        available: true
    },
    {
        id: 'RW-MEM-GOLD',
        title: 'Gold Tier Upgrade',
        description: 'Instant promotion to Gold tier for 1 month',
        pointsCost: 2500,
        category: 'Membership',
        available: true
    }
];

export class LoyaltyService {
    private collection = db.collection('loyalty_profiles');
    private useFirestore = !!process.env.FIREBASE_PRIVATE_KEY;

    async getProfile(userId: string): Promise<LoyaltyData> {
        let profile: LoyaltyProfile | null = null;

        try {
            if (this.useFirestore) {
                const doc = await this.collection.doc(userId).get();
                if (doc.exists) {
                    const data = doc.data() as any;
                    profile = {
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    };
                }
            }
        } catch (e) {
            console.error('Loyalty Firestore error:', e);
        }

        if (!profile) {
            profile = {
                userId,
                currentPoints: 0,
                totalEarned: 0,
                currentTier: 'Bronze',
                recentActivity: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        };

        const nextTier = LOYALTY_TIERS.find(t => t.minPoints > profile!.currentPoints);
        const pointsToNextTier = nextTier ? nextTier.minPoints - profile!.currentPoints : 0;

        const calculatedTier = [...LOYALTY_TIERS].reverse().find(t => profile!.currentPoints >= t.minPoints)?.name || 'Bronze';
        profile.currentTier = calculatedTier;

        return {
            ...profile,
            tiers: LOYALTY_TIERS,
            nextTier: nextTier?.name,
            pointsToNextTier
        };
    }

    async getRewards(): Promise<Reward[]> {
        return AVAILABLE_REWARDS;
    }

    async redeemReward(userId: string, rewardId: string): Promise<boolean> {
        const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId);
        if (!reward) throw new Error('Reward not found');

        const now = new Date();

        try {
            if (!this.useFirestore) throw new Error('Firestore not available for redemption');

            const ref = this.collection.doc(userId);
            await db.runTransaction(async (t) => {
                const doc = await t.get(ref);
                if (!doc.exists) throw new Error('User profile not found');
                const data = doc.data() as LoyaltyProfile;

                if (data.currentPoints < reward.pointsCost) {
                    throw new Error('Insufficient points');
                }

                const newPoints = data.currentPoints - reward.pointsCost;
                const newActivity: LoyaltyActivity = {
                    id: uuidv4(),
                    date: now.toISOString(),
                    action: `Redeemed: ${reward.title}`,
                    points: -reward.pointsCost,
                    type: 'spend'
                };

                t.update(ref, {
                    currentPoints: newPoints,
                    recentActivity: [newActivity, ...(data.recentActivity || [])],
                    updatedAt: now
                });
            });
            return true;
        } catch (e) {
            console.error('Redeem error:', e);
            throw e;
        }
    }
}
}
