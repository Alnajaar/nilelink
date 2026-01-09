import { PrismaClient, EscrowStatus, MarketplaceOrderStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { EventStore } from './EventStore';

export class EscrowManager {
    constructor(
        private prisma: PrismaClient,
        private eventStore: EventStore
    ) { }

    /**
     * Locks funds in escrow for a marketplace order.
     * This should be called after payment authorization.
     */
    async lockFunds(marketplaceOrderId: string, amount: number, blockchainTxHash?: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const order = await tx.marketplaceOrder.findUnique({
                    where: { id: marketplaceOrderId },
                    include: { escrow: true }
                });

                if (!order) throw new Error('Marketplace order not found');
                if (order.escrow) throw new Error('Escrow already exists for this order');

                // Create escrow record
                await tx.marketplaceEscrow.create({
                    data: {
                        orderId: marketplaceOrderId,
                        amount: amount,
                        status: EscrowStatus.LOCKED,
                        lockedAt: new Date(),
                        blockchainTxHash: blockchainTxHash
                    }
                });

                // Update order status
                await tx.marketplaceOrder.update({
                    where: { id: marketplaceOrderId },
                    data: { status: MarketplaceOrderStatus.FUNDS_LOCKED }
                });

                // Emit event
                // Note: In a real system, we'd use a more sophisticated event emission bridge
                await this.eventStore.saveEvents([{
                    id: crypto.randomUUID(),
                    eventType: 'EscrowLocked',
                    aggregateId: marketplaceOrderId,
                    aggregateType: 'MarketplaceOrder',
                    eventData: { amount, blockchainTxHash },
                    version: 1, // Simplified for this example
                    timestamp: new Date(),
                    metadata: {}
                } as any]);
            });

            logger.info(`Funds locked in escrow for order ${marketplaceOrderId}`, { amount });
        } catch (error) {
            logger.error(`Failed to lock funds for order ${marketplaceOrderId}`, { error });
            throw error;
        }
    }

    /**
     * Releases funds from escrow to the seller.
     * Called when buyer confirms receipt or auto-timeout triggers.
     */
    async releaseFunds(marketplaceOrderId: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const order = await tx.marketplaceOrder.findUnique({
                    where: { id: marketplaceOrderId },
                    include: { escrow: true }
                });

                if (!order || !order.escrow) throw new Error('Escrow not found for this order');
                if (order.escrow.status !== EscrowStatus.LOCKED) {
                    throw new Error(`Escrow in invalid state for release: ${order.escrow.status}`);
                }

                // Update escrow record
                await tx.marketplaceEscrow.update({
                    where: { id: order.escrow.id },
                    data: {
                        status: EscrowStatus.RELEASED,
                        releasedAt: new Date()
                    }
                });

                // Update order status
                await tx.marketplaceOrder.update({
                    where: { id: marketplaceOrderId },
                    data: { status: MarketplaceOrderStatus.COMPLETED }
                });

                // Emit event
                await this.eventStore.saveEvents([{
                    id: crypto.randomUUID(),
                    eventType: 'FundsReleased',
                    aggregateId: marketplaceOrderId,
                    aggregateType: 'MarketplaceOrder',
                    eventData: { amount: order.escrow.amount },
                    version: 2, // Simplified
                    timestamp: new Date(),
                    metadata: {}
                } as any]);
            });

            logger.info(`Funds released from escrow for order ${marketplaceOrderId}`);
        } catch (error) {
            logger.error(`Failed to release funds for order ${marketplaceOrderId}`, { error });
            throw error;
        }
    }

    /**
     * Refunds funds from escrow to the buyer.
     * Called when order is cancelled or dispute resolved in buyer's favor.
     */
    async refundFunds(marketplaceOrderId: string, reason: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const order = await tx.marketplaceOrder.findUnique({
                    where: { id: marketplaceOrderId },
                    include: { escrow: true }
                });

                if (!order || !order.escrow) throw new Error('Escrow not found for this order');
                if (order.escrow.status !== EscrowStatus.LOCKED) {
                    throw new Error(`Escrow in invalid state for refund: ${order.escrow.status}`);
                }

                // Update escrow record
                await tx.marketplaceEscrow.update({
                    where: { id: order.escrow.id },
                    data: {
                        status: EscrowStatus.REFUNDED,
                        refundedAt: new Date()
                    }
                });

                // Create refund record for audits
                await tx.marketplaceRefund.create({
                    data: {
                        escrowId: order.escrow.id,
                        amount: order.escrow.amount,
                        reason: reason,
                        status: 'COMPLETED'
                    }
                });

                // Update order status
                await tx.marketplaceOrder.update({
                    where: { id: marketplaceOrderId },
                    data: { status: MarketplaceOrderStatus.REFUNDED }
                });

                // Emit event
                await this.eventStore.saveEvents([{
                    id: crypto.randomUUID(),
                    eventType: 'FundsRefunded',
                    aggregateId: marketplaceOrderId,
                    aggregateType: 'MarketplaceOrder',
                    eventData: { amount: order.escrow.amount, reason },
                    version: 2, // Simplified
                    timestamp: new Date(),
                    metadata: {}
                } as any]);
            });

            logger.info(`Funds refunded from escrow for order ${marketplaceOrderId}`, { reason });
        } catch (error) {
            logger.error(`Failed to refund funds for order ${marketplaceOrderId}`, { error });
            throw error;
        }
    }
}
