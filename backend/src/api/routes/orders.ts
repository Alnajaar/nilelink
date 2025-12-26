import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// Validation schema for creating order
const createOrderSchema = z.object({
    restaurantId: z.string(),
    customerId: z.string().optional(),
    items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        specialInstructions: z.string().optional()
    }))
});

// GET /api/orders - List orders (with basic filtering)
router.get('/', async (req, res) => {
    try {
        const { restaurantId, status } = req.query;

        const whereClause: any = {};
        if (restaurantId) whereClause.restaurantId = String(restaurantId);
        if (status) whereClause.status = status;

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                items: {
                    include: { menuItem: true }
                },
                customer: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: { orders } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const data = createOrderSchema.parse(req.body);

        // 1. Fetch items to calculate price and validate
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: data.items.map((i: any) => i.menuItemId) } }
        });

        const itemsMap = new Map(menuItems.map((i: any) => [i.id, i]));
        let totalAmount = 0;

        const orderItemsData = data.items.map((item: any) => {
            const menuItem = itemsMap.get(item.menuItemId);
            if (!menuItem) throw new Error(`Item ${item.menuItemId} not found`);

            const unitPrice = Number(menuItem.price);
            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;

            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                specialInstructions: item.specialInstructions
            };
        });

        // 2. Create Order Transaction
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`, // Simple generation for now
                restaurantId: data.restaurantId,
                customerId: data.customerId,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: orderItemsData
                },
                payments: {
                    // Auto-create pending payment for simplicity in this phase
                    create: {
                        amount: totalAmount,
                        method: 'CASH', // Default
                        status: 'PENDING'
                    }
                }
            },
            include: { items: true }
        });

        // 3. Emit Real-time Event
        const io = req.app.get('io');
        if (io) {
            io.to(`restaurant_${data.restaurantId}`).emit('order:new', order);
        }

        res.status(201).json({ success: true, data: { order } });

    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        // Validate status enum
        const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status }
        });

        // Emit update event
        const io = req.app.get('io');
        if (io) {
            io.to(`order_${order.id}`).emit('order:updated', order);
            io.to(`restaurant_${order.restaurantId}`).emit('order:updated', order);
        }

        res.json({ success: true, data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

export default router;

