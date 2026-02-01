/**
 * LoyaltyEngine - Universal Rewards System for NileLink Ecosystem
 * Handles decentralized point accrual, tier management, and reward redemption.
 */

import { eventBus, createEvent } from '@shared/lib/EventBus';
import { OrderLedger, ImmutableReceipt } from './OrderLedger';

export interface LoyaltyTier {
    name: string;
    minPoints: number;
    color: string;
    benefits: string[];
}

export interface LoyaltyActivity {
    id: string;
    type: 'earn' | 'redeem';
    action: string;
    points: number;
    date: number;
}

export interface Reward {
    id: string;
    title: string;
    description: string;
    pointsCost: number;
    category: 'Food' | 'Credit' | 'Delivery' | 'Membership';
    available: boolean;
}

export class LoyaltyEngine {
    private pointsKey = 'nl_loyalty_points';
    private activityKey = 'nl_loyalty_activity';
    private ledger: OrderLedger;

    public tiers: LoyaltyTier[] = [
        { name: 'Bronze', minPoints: 0, color: 'bg-orange-600', benefits: ['Standard support', '1% Cashback'] },
        { name: 'Silver', minPoints: 5000, color: 'bg-gray-400', benefits: ['Priority support', '2% Cashback', 'Free delivery'] },
        { name: 'Gold', minPoints: 15000, color: 'bg-yellow-500', benefits: ['Exclusive offers', '5% Cashback', 'VIP access'] },
        { name: 'Platinum', minPoints: 50000, color: 'bg-blue-300', benefits: ['Personal assistant', '10% Cashback', 'Zero fees'] }
    ];

    constructor() {
        this.ledger = new OrderLedger();
        this.initialize();
    }

    private initialize(): void {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem(this.pointsKey)) {
                localStorage.setItem(this.pointsKey, '0');
            }
            if (!localStorage.getItem(this.activityKey)) {
                localStorage.setItem(this.activityKey, JSON.stringify([]));
            }
        }
    }

    /**
     * Get current loyalty points
     */
    getCurrentPoints(): number {
        if (typeof window === 'undefined') return 0;
        return parseInt(localStorage.getItem(this.pointsKey) || '0');
    }

    /**
     * Accrue points from a completed order
     * Rule: 100 points per $1 spent
     */
    async processOrderForPoints(receipt: ImmutableReceipt): Promise<number> {
        const pointsEarned = Math.floor(receipt.total * 100);
        if (pointsEarned <= 0) return 0;

        await this.addPoints(pointsEarned, `Earned from Order ${receipt.id}`, 'earn');
        return pointsEarned;
    }

    /**
     * Add points with activity tracking
     */
    private async addPoints(amount: number, action: string, type: 'earn' | 'redeem'): Promise<void> {
        const current = this.getCurrentPoints();
        const next = type === 'earn' ? current + amount : current - amount;

        localStorage.setItem(this.pointsKey, next.toString());

        const activity: LoyaltyActivity = {
            id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            type,
            action,
            points: amount,
            date: Date.now()
        };

        const history = this.getActivityHistory();
        history.unshift(activity); // Newest first
        localStorage.setItem(this.activityKey, JSON.stringify(history.slice(0, 50)));

        await eventBus.publish(createEvent('LOYALTY_UPDATED', {
            points: next,
            activity
        }, { source: 'LoyaltyEngine' }));
    }

    /**
     * Get full activity history
     */
    getActivityHistory(): LoyaltyActivity[] {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(this.activityKey);
        return raw ? JSON.parse(raw) : [];
    }

    /**
     * Resolve current tier based on points
     */
    getCurrentTier(): LoyaltyTier {
        const points = this.getCurrentPoints();
        return [...this.tiers].reverse().find(t => points >= t.minPoints) || this.tiers[0];
    }

    /**
     * Redeem a reward
     */
    async redeemReward(reward: Reward): Promise<boolean> {
        const currentPoints = this.getCurrentPoints();
        if (currentPoints < reward.pointsCost) return false;

        await this.addPoints(reward.pointsCost, `Redeemed ${reward.title}`, 'redeem');

        await eventBus.publish(createEvent('REWARD_REDEEMED', {
            rewardId: reward.id,
            title: reward.title
        }, { source: 'LoyaltyEngine', priority: 'high' }));

        return true;
    }

    /**
     * Get progress to next tier
     */
    getTierProgress() {
        const points = this.getCurrentPoints();
        const currentTier = this.getCurrentTier();
        const nextTier = this.tiers[this.tiers.indexOf(currentTier) + 1];

        if (!nextTier) return { current: points, target: points, percentage: 100 };

        const range = nextTier.minPoints - currentTier.minPoints;
        const progress = points - currentTier.minPoints;
        const percentage = Math.min(100, Math.floor((progress / range) * 100));

        return {
            current: points,
            target: nextTier.minPoints,
            percentage,
            needed: nextTier.minPoints - points
        };
    }
}

// Global loyalty engine instance
export const loyaltyEngine = new LoyaltyEngine();
