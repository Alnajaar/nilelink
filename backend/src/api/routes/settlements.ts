import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/settlements - List settlements for a restaurant
router.get('/', async (req, res) => {
    try {
        const { restaurantId } = req.query;
        if (!restaurantId) {
            return res.status(400).json({ success: false, error: 'Restaurant ID required' });
        }

        const settlements = await prisma.settlement.findMany({
            where: { restaurantId: String(restaurantId) },
            orderBy: { periodEnd: 'desc' }
        });

        res.json({ success: true, data: { settlements } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/settlements/request
router.post('/request', async (req, res) => {
    try {
        const { restaurantId, start, end } = req.body;

        // 1. Calculate Revenue
        const orders = await prisma.order.findMany({
            where: {
                restaurantId,
                status: 'DELIVERED', // Only settled orders
                createdAt: {
                    gte: new Date(start),
                    lte: new Date(end)
                }
            }
        });

        const grossRevenue = orders.reduce((acc: number, order: any) => acc + Number(order.totalAmount), 0);
        const platformFee = grossRevenue * 0.1; // 10% Platform Fee
        const netSettlement = grossRevenue - platformFee;

        // 2. Create Settlement Record
        const settlement = await prisma.settlement.create({
            data: {
                restaurantId,
                periodStart: new Date(start),
                periodEnd: new Date(end),
                grossRevenue,
                platformFee,
                netSettlement,
                status: 'PENDING'
            }
        });

        res.status(201).json({ success: true, data: { settlement } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Settlement creation failed' });
    }
});

export default router;
