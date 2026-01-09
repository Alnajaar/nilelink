import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { fraudService } from '../../services/FraudService';
import { marketplaceService } from '../../services/marketplace';

const router = Router();

// Validation schema for creating order
const createOrderSchema = z.object({
    restaurantId: z.string(),
    customerId: z.string().optional(),
    items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        specialInstructions: z.string().optional()
    })),
    deliveryAddress: z.string().optional(),
    specialInstructions: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'CRYPTO', 'WALLET', 'BANK_TRANSFER']).default('CASH')
});

// GET /api/orders - List orders (with basic filtering)
router.get('/', async (req, res) => {
    try {
        // Note: Order management not yet implemented in current schema
        // This endpoint exists for future order management features
        res.json({
            success: true,
            data: {
                orders: [],
                message: 'Order management system not yet implemented. Currently focused on subscription marketplace.'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const { restaurantId, customerId, items, deliveryAddress, paymentMethod } = createOrderSchema.parse(req.body);

        // 1. Fetch Menu Items to calculate total and verify availability
        const menuItems = await prisma.menuItem.findMany({
            where: {
                id: { in: items.map(i => i.menuItemId) },
                restaurantId
            }
        });

        if (menuItems.length !== items.length) {
            return res.status(400).json({ success: false, error: 'Some menu items not found' });
        }

        let totalAmount = 0;
        const orderItemsData = items.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId)!;
            const lineTotal = Number(menuItem.price) * item.quantity;
            totalAmount += lineTotal;
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: menuItem.price,
                totalPrice: lineTotal
            };
        });

        // 2. Award Loyalty Points (Task A)
        let loyaltyPointsEarned = 0;
        if (customerId) {
            // Simple rule: 1 point per $1
            loyaltyPointsEarned = Math.floor(totalAmount);
        }

        // 3. Create Order
        const order = await prisma.order.create({
            data: {
                restaurantId,
                customerId,
                totalAmount,
                status: 'PENDING',
                paymentStatus: 'UNPAID', // or PAID if online
                paymentMethod,
                loyaltyPointsEarned,
                items: {
                    create: orderItemsData
                },
                // If delivery, create delivery record (Task C preparation)
                ...(deliveryAddress ? {
                    delivery: {
                        create: {
                            pickupAddress: 'Restaurant Address Placeholder',
                            dropoffAddress: deliveryAddress,
                            status: 'PENDING'
                        }
                    }
                } : {})
            },
            include: { items: true, delivery: true }
        });

        // 4. Update Inventory (Task B) & Loyalty (Task A)
        // Run this asynchronously or blocking - blocking for safety here
        // 4. Update Inventory (Task B) & Loyalty (Task A)
        // Execute Smart Restock logic (Self-contained, handles its own DB writes)
        const { InventoryService } = require('../../services/InventoryService');
        // Note: checkAndRestock uses global prisma client, so we run it after or outside the transaction for strict isolation
        // or just accept it runs independently.
        await InventoryService.checkAndRestock(items, restaurantId);

        await prisma.$transaction(async (tx) => {
            // Update Customer Loyalty
            if (customerId && loyaltyPointsEarned > 0) {
                await tx.customerProfile.upsert({
                    where: { userId: customerId },
                    create: {
                        userId: customerId,
                        loyaltyPoints: loyaltyPointsEarned,
                        totalSpent: totalAmount,
                        orderCount: 1
                    },
                    update: {
                        loyaltyPoints: { increment: loyaltyPointsEarned },
                        totalSpent: { increment: totalAmount },
                        orderCount: { increment: 1 }
                    }
                });

                await tx.loyaltyTransaction.create({
                    data: {
                        profileId: (await tx.customerProfile.findUnique({ where: { userId: customerId } }))!.id,
                        amount: loyaltyPointsEarned,
                        type: 'EARN',
                        reason: `Order #${order.id.slice(-6)}`
                    }
                });
            }
        });

        // 5. Broadcast
        const io = req.app.get('io');
        if (io) {
            io.to(`restaurant_${restaurantId}`).emit('order:new', order);
        }

        res.json({ success: true, data: order });

    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

export default router;

