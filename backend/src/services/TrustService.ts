import { PrismaClient, DisputeStatus, DisputeDecision } from '@prisma/client';
import { logger } from '../utils/logger';
import { EventStore } from './EventStore';
import { EscrowManager } from './EscrowManager';

export class TrustService {
    constructor(
        private prisma: PrismaClient,
        private eventStore: EventStore,
        private escrowManager: EscrowManager
    ) { }

    // --- TRUST SCORING ---

    /**
     * Recomputes a seller's trust score based on their performance.
     * Formula: (CompletedOrders * 0.7) - (DisputesLost * 0.3) + (AverageRating * 0.1)
     */
    async recomputeSellerScore(sellerId: string): Promise<number> {
        try {
            const seller = await this.prisma.marketplaceSeller.findUnique({
                where: { id: sellerId },
                include: {
                    orders: {
                        include: {
                            review: true,
                            dispute: true
                        }
                    }
                }
            });

            if (!seller) throw new Error('Seller not found');

            const completedOrders = seller.orders.filter(o => o.status === 'COMPLETED').length;
            const disputesLost = seller.orders.filter(o => o.dispute?.decision === 'REFUND_TO_BUYER').length;

            const reviews = seller.orders.map(o => o.review).filter(Boolean);
            const avgRating = reviews.length > 0
                ? reviews.reduce((acc, r) => acc + (r?.rating || 0), 0) / reviews.length
                : 5; // Default to 5 if no reviews

            const score = (completedOrders * 0.7) - (disputesLost * 0.3) + (avgRating * 0.1);
            const normalizedScore = Math.max(0, Math.min(100, score)); // Clamp between 0-100 if needed, or keep raw

            await this.prisma.marketplaceSeller.update({
                where: { id: sellerId },
                data: { trustScore: normalizedScore }
            });

            // Auto-freeze if score is too low
            if (normalizedScore < 20 && !seller.isFrozen) {
                await this.freezeSeller(sellerId, 'Trust score dropped below threshold');
            }

            return normalizedScore;
        } catch (error) {
            logger.error('Failed to recompute seller score', { error, sellerId });
            throw error;
        }
    }

    async freezeSeller(sellerId: string, reason: string): Promise<void> {
        await this.prisma.marketplaceSeller.update({
            where: { id: sellerId },
            data: { isFrozen: true }
        });

        await this.eventStore.saveEvents([{
            id: crypto.randomUUID(),
            eventType: 'SellerFrozen',
            aggregateId: sellerId,
            aggregateType: 'MarketplaceSeller',
            eventData: { reason },
            version: 3,
            timestamp: new Date(),
            metadata: {}
        } as any]);

        logger.warn(`Seller ${sellerId} frozen: ${reason}`);
    }

    // --- DISPUTE SYSTEM ---

    async openDispute(orderId: string, reason: string, evidenceUrls: string[]): Promise<any> {
        try {
            const dispute = await this.prisma.marketplaceDispute.create({
                data: {
                    orderId,
                    reason,
                    evidenceUrls,
                    status: DisputeStatus.OPEN
                }
            });

            await this.prisma.marketplaceOrder.update({
                where: { id: orderId },
                data: { status: 'DISPUTED' }
            });

            await this.eventStore.saveEvents([{
                id: crypto.randomUUID(),
                eventType: 'DisputeOpened',
                aggregateId: orderId,
                aggregateType: 'MarketplaceOrder',
                eventData: { reason, evidenceUrls },
                version: 3,
                timestamp: new Date(),
                metadata: {}
            } as any]);

            return dispute;
        } catch (error) {
            logger.error('Failed to open dispute', { error, orderId });
            throw error;
        }
    }

    async resolveDispute(disputeId: string, decision: DisputeDecision, arbitratorId: string): Promise<void> {
        try {
            const dispute = await this.prisma.marketplaceDispute.findUnique({
                where: { id: disputeId },
                include: { order: true }
            });

            if (!dispute) throw new Error('Dispute not found');

            await this.prisma.marketplaceDispute.update({
                where: { id: disputeId },
                data: {
                    status: DisputeStatus.RESOLVED,
                    decision,
                    arbitratorId
                }
            });

            // Execute financial movement based on decision
            if (decision === 'RELEASE_TO_SELLER') {
                await this.escrowManager.releaseFunds(dispute.orderId);
            } else if (decision === 'REFUND_TO_BUYER') {
                await this.escrowManager.refundFunds(dispute.orderId, 'Dispute resolved in favor of buyer');
            } else if (decision === 'PARTIAL_REFUND') {
                // Partial refund logic would require amount specification
                // Simplified here to 50/50 for demo or needs API parameter
                await this.escrowManager.refundFunds(dispute.orderId, 'Partial refund via dispute resolution');
            }

            await this.eventStore.saveEvents([{
                id: crypto.randomUUID(),
                eventType: 'DisputeResolved',
                aggregateId: dispute.orderId,
                aggregateType: 'MarketplaceOrder',
                eventData: { decision, arbitratorId },
                version: 4,
                timestamp: new Date(),
                metadata: {}
            } as any]);

            // Recompute score for the seller
            await this.recomputeSellerScore(dispute.order.sellerId);

        } catch (error) {
            logger.error('Failed to resolve dispute', { error, disputeId });
            throw error;
        }
    }
}
