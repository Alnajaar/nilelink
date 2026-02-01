/**
 * FeeService - Backend Order Fee Calculation
 * 
 * Enforces server-side commission splits for supplier orders.
 * Prevents frontend manipulation of platform fees.
 */

import { prisma } from '@shared/utils/prisma';

export interface FeeCalculation {
    subtotal: number;
    platformFee: number;
    netAmount: number;
    commissionRate: number;
    commissionType: 'PERCENTAGE' | 'FIXED';
}

export class FeeService {
    /**
     * Calculate commission for POS/Merchant orders
     */
    static async calculatePOSOrderFees(
        businessId: string,
        orderTotal: number
    ): Promise<FeeCalculation> {
        // 1. Try to fetch specific override
        const override = await prisma.merchantCommissionRule.findUnique({
            where: { businessId }
        });

        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        // 2. Fallback to global rule or protocol default (8%)
        let rate = 8.0;
        let type: 'PERCENTAGE' | 'FIXED' = 'PERCENTAGE';

        if (override) {
            rate = override.orderCommissionPct;
        } else if (business) {
            const globalRule = await prisma.globalCommissionRule.findUnique({
                where: { businessType: business.businessType }
            });
            if (globalRule) rate = globalRule.orderCommissionPct;
        }

        const platformFee = (orderTotal * rate) / 100;
        const netAmount = orderTotal - platformFee;

        return {
            subtotal: orderTotal,
            platformFee,
            netAmount,
            commissionRate: rate,
            commissionType: type
        };
    }

    /**
     * Calculate supplier commission
     */
    static async calculateSupplierFees(
        supplierId: string,
        orderSubtotal: number
    ): Promise<FeeCalculation> {
        const supplier = await prisma.supplierProfile.findUnique({
            where: { id: supplierId },
            include: { commissionRule: true },
        });

        const commissionType = supplier?.commissionRule?.type || 'PERCENTAGE';
        const commissionValue = supplier?.commissionRule?.value || 5.0;

        let platformFee = 0;
        if (commissionType === 'PERCENTAGE') {
            platformFee = (orderSubtotal * commissionValue) / 100;
        } else {
            platformFee = commissionValue;
        }

        return {
            subtotal: orderSubtotal,
            platformFee,
            netAmount: orderSubtotal - platformFee,
            commissionRate: commissionValue,
            commissionType: commissionType as 'PERCENTAGE' | 'FIXED'
        };
    }

    /**
     * Calculate and apply affiliate earnings
     */
    static async processAffiliateCommission(
        orderId: string,
        orderTotal: number,
        referredUserId: string
    ) {
        // Find if this user was referred
        const referral = await prisma.referral.findFirst({
            where: { referredUserId, status: 'ACTIVE' },
            include: { affiliate: true }
        });

        if (!referral || !referral.affiliate) return null;

        const rate = referral.affiliate.commissionRate || 0.10; // 10% default
        const amount = orderTotal * rate;

        // Record the commission
        await prisma.commission.create({
            data: {
                referralId: referral.id,
                amount,
                orderId,
                status: 'PENDING',
                description: 'Order referral commission'
            }
        });

        // Update affiliate balances
        await prisma.affiliate.update({
            where: { id: referral.affiliateId },
            data: {
                balance: { increment: amount },
                pendingEarnings: { increment: amount }
            }
        });

        return { amount, rate };
    }

    /**
     * Finalize transaction and split funds in Ledgers
     */
    static async settleCommission(
        orderId: string,
        category: 'POS' | 'SUPPLIER',
        calculation: FeeCalculation
    ) {
        await prisma.orderCommission.upsert({
            where: { orderId },
            update: {
                status: 'SETTLED',
                platformRevenue: calculation.platformFee,
                settledAt: new Date()
            },
            create: {
                orderId,
                orderSubtotal: calculation.subtotal,
                deliveryFee: 0, // Separate logic if needed
                orderCommissionPct: calculation.commissionRate,
                deliveryCommissionPct: 0,
                orderCommissionAmount: calculation.platformFee,
                deliveryCommissionAmount: 0,
                platformRevenue: calculation.platformFee,
                status: 'SETTLED',
                calculatedAt: new Date(),
                settledAt: new Date()
            }
        });

        // Audit Log
        await prisma.financialAuditLog.create({
            data: {
                adminId: 'SYSTEM',
                action: 'SETTLEMENT',
                entityType: category,
                entityId: orderId,
                newValue: calculation as any,
                reason: 'Auto-settlement on order completion'
            }
        });
    }
}
