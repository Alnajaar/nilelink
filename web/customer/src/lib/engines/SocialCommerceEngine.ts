/**
 * SocialCommerceEngine - Group Ordering & Viral Growth
 * Handles shared carts, referral tracking, and collaborative shopping.
 */

import { eventBus, createEvent } from '@shared/lib/EventBus';
import { loyaltyEngine } from './LoyaltyEngine';

export interface GroupCart {
    id: string;
    merchantId: string;
    ownerId: string;
    members: string[];
    items: GroupCartItem[];
    status: 'OPEN' | 'LOCKED' | 'PLACED';
    inviteCode: string;
}

export interface GroupCartItem {
    id: string;
    userId: string;
    userName: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export class SocialCommerceEngine {
    private activeGroupsKey = 'nl_active_groups';
    private referralKey = 'nl_referral_data';

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem(this.activeGroupsKey)) {
                localStorage.setItem(this.activeGroupsKey, JSON.stringify({}));
            }
            if (!localStorage.getItem(this.referralKey)) {
                localStorage.setItem(this.referralKey, JSON.stringify({ referrals: 0, code: this.generateReferralCode() }));
            }
        }
    }

    private generateReferralCode(): string {
        return `NL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    /**
     * Create a new group cart
     */
    async createGroupCart(merchantId: string, ownerId: string): Promise<GroupCart> {
        const cart: GroupCart = {
            id: `GRP-${Date.now()}`,
            merchantId,
            ownerId,
            members: [ownerId],
            items: [],
            status: 'OPEN',
            inviteCode: Math.random().toString(36).substring(2, 6).toUpperCase()
        };

        const groups = this.getAllGroups();
        groups[cart.id] = cart;
        this.saveGroups(groups);

        await eventBus.publish(createEvent('GROUP_CART_CREATED', {
            cartId: cart.id,
            inviteCode: cart.inviteCode
        }, { source: 'SocialCommerceEngine' }));

        return cart;
    }

    /**
     * Join an existing group cart
     */
    async joinGroupCart(inviteCode: string, userId: string): Promise<GroupCart | null> {
        const groups = this.getAllGroups();
        const cart = Object.values(groups).find(g => g.inviteCode === inviteCode && g.status === 'OPEN');

        if (!cart) return null;

        if (!cart.members.includes(userId)) {
            cart.members.push(userId);
            this.saveGroups(groups);

            await eventBus.publish(createEvent('GROUP_MEMBER_JOINED', {
                cartId: cart.id,
                userId
            }, { source: 'SocialCommerceEngine' }));
        }

        return cart;
    }

    /**
     * Add item to group cart
     */
    async addItemToGroup(cartId: string, item: GroupCartItem): Promise<void> {
        const groups = this.getAllGroups();
        const cart = groups[cartId];

        if (cart && cart.status === 'OPEN') {
            cart.items.push(item);
            this.saveGroups(groups);

            await eventBus.publish(createEvent('GROUP_CART_UPDATED', {
                cartId,
                itemCount: cart.items.length
            }, { source: 'SocialCommerceEngine' }));
        }
    }

    /**
     * Track a successful referral
     */
    async trackReferral(referralCode: string): Promise<void> {
        // In a real app, this would verify on-chain or via signed proof
        const data = this.getReferralData();
        data.referrals += 1;
        localStorage.setItem(this.referralKey, JSON.stringify(data));

        // Award loyalty points for referral
        await loyaltyEngine.processOrderForPoints({
            id: `REF-${Date.now()}`,
            merchantName: 'NileLink Referral',
            merchantId: 'SYSTEM',
            items: [],
            total: 10, // 1000 points (10 * 100)
            timestamp: Date.now(),
            status: 'COMPLETED',
            orderHash: 'referral'
        });

        await eventBus.publish(createEvent('REFERRAL_SUCCESS', {
            code: referralCode,
            totalReferrals: data.referrals
        }, { source: 'SocialCommerceEngine', priority: 'high' }));
    }

    private getAllGroups(): Record<string, GroupCart> {
        if (typeof window === 'undefined') return {};
        return JSON.parse(localStorage.getItem(this.activeGroupsKey) || '{}');
    }

    private saveGroups(groups: Record<string, GroupCart>): void {
        localStorage.setItem(this.activeGroupsKey, JSON.stringify(groups));
    }

    getReferralData() {
        if (typeof window === 'undefined') return { referrals: 0, code: '' };
        return JSON.parse(localStorage.getItem(this.referralKey) || '{}');
    }
}

// Global social commerce engine instance
export const socialCommerceEngine = new SocialCommerceEngine();
