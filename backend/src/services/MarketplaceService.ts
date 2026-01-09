import { PrismaClient, MarketplaceOrderStatus, ListingType, VerificationStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { EventStore } from './EventStore';
import { EscrowManager } from './EscrowManager';

export class MarketplaceService {
    constructor(
        private prisma: PrismaClient,
        private eventStore: EventStore,
        private escrowManager: EscrowManager
    ) { }

    // --- SELLER MANAGEMENT ---

    async registerSeller(userId: string, restaurantId?: string): Promise<any> {
        try {
            const seller = await this.prisma.marketplaceSeller.create({
                data: {
                    userId,
                    restaurantId,
                    verificationStatus: VerificationStatus.PENDING,
                    trustScore: 100
                }
            });

            await this.eventStore.saveEvents([{
                id: crypto.randomUUID(),
                eventType: 'SellerRegistered',
                aggregateId: seller.id,
                aggregateType: 'MarketplaceSeller',
                eventData: { userId, restaurantId },
                version: 1,
                timestamp: new Date(),
                metadata: {}
            } as any]);

            return seller;
        } catch (error) {
            logger.error('Failed to register seller', { error, userId });
            throw error;
        }
    }

    // --- LISTING MANAGEMENT ---

    async createListing(sellerId: string, data: {
        name: string,
        description?: string,
        price: number,
        stock: number,
        type: ListingType,
        category?: string,
        images?: string[],
        menuItemId?: string
    }): Promise<any> {
        try {
            const listing = await this.prisma.marketplaceListing.create({
                data: {
                    sellerId,
                    ...data,
                    isAvailable: true
                }
            });

            await this.eventStore.saveEvents([{
                id: crypto.randomUUID(),
                eventType: 'ListingCreated',
                aggregateId: listing.id,
                aggregateType: 'MarketplaceListing',
                eventData: listing,
                version: 1,
                timestamp: new Date(),
                metadata: {}
            } as any]);

            return listing;
        } catch (error) {
            logger.error('Failed to create listing', { error, sellerId });
            throw error;
        }
    }

    async updateListing(listingId: string, data: any): Promise<any> {
        try {
            const listing = await this.prisma.marketplaceListing.update({
                where: { id: listingId },
                data
            });

            await this.eventStore.saveEvents([{
                id: crypto.randomUUID(),
                eventType: 'ListingUpdated',
                aggregateId: listingId,
                aggregateType: 'MarketplaceListing',
                eventData: data,
                version: 2, // Simplified versioning
                timestamp: new Date(),
                metadata: {}
            } as any]);

            return listing;
        } catch (error) {
            logger.error('Failed to update listing', { error, listingId });
            throw error;
        }
    }

    // --- ORDER MANAGEMENT ---

    /**
     * Places a marketplace order.
     * Integrates with the core Ecosystem Order system.
     */
    async placeOrder(buyerId: string, sellerId: string, items: { listingId: string, quantity: number }[]): Promise<any> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Calculate totals and validate stock
                let totalAmount = 0;
                const orderItemsData = [];

                for (const item of items) {
                    const listing = await tx.marketplaceListing.findUnique({
                        where: { id: item.listingId }
                    });

                    if (!listing || !listing.isAvailable || listing.stock < item.quantity) {
                        throw new Error(`Listing ${item.listingId} is unavailable or out of stock`);
                    }

                    const itemTotal = Number(listing.price) * item.quantity;
                    totalAmount += itemTotal;

                    orderItemsData.push({
                        listingId: item.listingId,
                        quantity: item.quantity,
                        unitPrice: listing.price,
                        totalPrice: itemTotal
                    });

                    // Update stock
                    await tx.marketplaceListing.update({
                        where: { id: item.listingId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }

                // 2. Create the core Ecosystem Order
                // For marketplace orders, we link them to a restaurant if the seller has one, 
                // or a default "Marketplace" restaurant/tenant if they don't.
                const seller = await tx.marketplaceSeller.findUnique({
                    where: { id: sellerId },
                    include: { restaurant: true }
                });

                if (!seller) throw new Error('Seller not found');

                const ecosystemOrder = await tx.order.create({
                    data: {
                        orderNumber: `MP-${Date.now()}`,
                        customerId: buyerId,
                        restaurantId: seller.restaurantId || 'MARKETPLACE_SYSTEM', // Assuming this exists or is handled
                        totalAmount: totalAmount,
                        status: 'PENDING',
                        paymentStatus: 'PENDING'
                    }
                });

                // 3. Create the Marketplace Order wrapper
                const marketplaceOrder = await tx.marketplaceOrder.create({
                    data: {
                        orderNumber: ecosystemOrder.orderNumber,
                        buyerId,
                        sellerId,
                        ecosystemOrderId: ecosystemOrder.id,
                        status: MarketplaceOrderStatus.PENDING,
                        items: {
                            create: orderItemsData
                        }
                    }
                });

                // 4. Emit OrderPlaced Event
                await this.eventStore.saveEvents([{
                    id: crypto.randomUUID(),
                    eventType: 'OrderPlaced',
                    aggregateId: marketplaceOrder.id,
                    aggregateType: 'MarketplaceOrder',
                    eventData: { totalAmount, items: orderItemsData },
                    version: 1,
                    timestamp: new Date(),
                    metadata: {}
                } as any]);

                return marketplaceOrder;
            });
        } catch (error) {
            logger.error('Failed to place marketplace order', { error, buyerId });
            throw error;
        }
    }

    async confirmOrder(marketplaceOrderId: string): Promise<void> {
        try {
            await this.prisma.marketplaceOrder.update({
                where: { id: marketplaceOrderId },
                data: { status: MarketplaceOrderStatus.SELLER_CONFIRMED }
            });

            // Trigger delivery initiation logic here or via event subscriber
            await this.eventStore.saveEvents([{
                id: crypto.randomUUID(),
                eventType: 'SellerConfirmed',
                aggregateId: marketplaceOrderId,
                aggregateType: 'MarketplaceOrder',
                eventData: {},
                version: 2,
                timestamp: new Date(),
                metadata: {}
            } as any]);
        } catch (error) {
            logger.error('Failed to confirm order', { error, marketplaceOrderId });
            throw error;
        }
    }

    // --- INTEGRATION HANDLERS ---

    async handleOrderPickedUp(ecosystemOrderId: string): Promise<void> {
        try {
            const marketplaceOrder = await this.prisma.marketplaceOrder.findUnique({
                where: { ecosystemOrderId }
            });

            if (marketplaceOrder) {
                await this.prisma.marketplaceOrder.update({
                    where: { id: marketplaceOrder.id },
                    data: { status: MarketplaceOrderStatus.SHIPPED }
                });

                await this.eventStore.saveEvents([{
                    id: crypto.randomUUID(),
                    eventType: 'DeliveryStarted',
                    aggregateId: marketplaceOrder.id,
                    aggregateType: 'MarketplaceOrder',
                    eventData: {},
                    version: 3,
                    timestamp: new Date(),
                    metadata: {}
                } as any]);
            }
        } catch (error) {
            logger.error('Failed to handle order pickup event', { error, ecosystemOrderId });
        }
    }

    async handleOrderDelivered(ecosystemOrderId: string): Promise<void> {
        try {
            const marketplaceOrder = await this.prisma.marketplaceOrder.findUnique({
                where: { ecosystemOrderId },
                include: { escrow: true }
            });

            if (marketplaceOrder) {
                await this.prisma.marketplaceOrder.update({
                    where: { id: marketplaceOrder.id },
                    data: { status: MarketplaceOrderStatus.DELIVERED }
                });

                await this.eventStore.saveEvents([{
                    id: crypto.randomUUID(),
                    eventType: 'DeliveryCompleted',
                    aggregateId: marketplaceOrder.id,
                    aggregateType: 'MarketplaceOrder',
                    eventData: {},
                    version: 4,
                    timestamp: new Date(),
                    metadata: {}
                } as any]);

                // Auto-release funds if no dispute is open (or wait for buyer confirmation)
                // In production, we might have an auto-timeout or require manual confirmation.
                // For this implementation, we follow the "Auto-release vs manual" rule by releasing on delivery.
                if (marketplaceOrder.escrow?.status === 'LOCKED') {
                    await this.escrowManager.releaseFunds(marketplaceOrder.id);
                }
            }
        } catch (error) {
            logger.error('Failed to handle order delivery event', { error, ecosystemOrderId });
        }
    }
}

