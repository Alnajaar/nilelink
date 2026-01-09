
import { PrismaClient } from '@prisma/client';
import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';

export class InventoryService {
    /**
     * 🚀 Smart-Restock Logic for $50 Supplier Hub Tier
     * Automatically creates supplier purchase orders when inventory is low
     * NileLink earns commission (8%) on every supplier order
     */
    static async checkAndRestock(orderItems: any[], restaurantId: string): Promise<void> {
        try {
            // Map order items to inventory items (Simple name matching for now)
            // In refined version, use OrderItem -> MenuItem -> Recipe -> Inventory mapping

            for (const orderItem of orderItems) {
                // Find inventory item matching the name
                // Note: This is fuzzy. In prod, use explicit IDs.
                const inventoryItem = await prisma.inventory.findFirst({
                    where: {
                        restaurantId,
                        name: { contains: orderItem.name || orderItem.menuItem?.name || '', mode: 'insensitive' }
                    }
                });

                if (inventoryItem) {
                    // 1. Deduct Inventory
                    // Convert order quantity (e.g. 1 Burger) to ingredient usage (e.g. 0.2kg Meat)
                    // Simplified: 1:1 match for demo commodities (e.g. Selling 'Tomatoes' directly) or simple decrement
                    const deductQty = (orderItem.quantity || 1) * 0.5; // Placeholder conversion factor

                    const updatedItem = await prisma.inventory.update({
                        where: { id: inventoryItem.id },
                        data: { quantity: { decrement: deductQty } }
                    });

                    // 2. Check Reorder Level
                    if (Number(updatedItem.quantity) <= Number(updatedItem.reorderLevel)) {
                        // Trigger Auto-Restock
                        const restockQty = 50; // Standard batch
                        const cost = Number(updatedItem.unitCost) * restockQty;
                        const commission = cost * 0.08;

                        if (updatedItem.supplierId) {
                            const po = await prisma.purchaseOrder.create({
                                data: {
                                    restaurantId,
                                    supplierId: updatedItem.supplierId,
                                    status: 'SENT',
                                    totalCost: cost,
                                    items: JSON.stringify([{
                                        name: updatedItem.name,
                                        quantity: restockQty,
                                        cost: cost
                                    }])
                                }
                            });

                            // Log Event
                            logger.info(`🤖 Smart-Restock Triggered: PO #${po.id.slice(-6)} for ${updatedItem.name}`, {
                                commissionEarned: commission
                            });

                            // Auto-update inventory (Instant delivery simulation for demo)
                            await prisma.inventory.update({
                                where: { id: inventoryItem.id },
                                data: { quantity: { increment: restockQty } }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('❌ Smart-Restock failed:', error);
        }
    }
}
