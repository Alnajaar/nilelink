import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Use shared prisma instance
const prisma = new PrismaClient();
const router = Router();

// GET /api/restaurants - List all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: { isActive: true },
            include: {
                menuItems: {
                    where: { isAvailable: true }
                }
            }
        });
        res.json({ success: true, data: { restaurants } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/restaurants/:id - Get details with menu
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: req.params.id },
            include: {
                menuItems: true
            }
        });

        if (!restaurant) {
            return res.status(404).json({ success: false, error: 'Restaurant not found' });
        }

        res.json({ success: true, data: { restaurant } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/restaurants/:id/inventory - Get inventory (Protected)
// TODO: Add auth middleware
router.get('/:id/inventory', async (req, res) => {
    try {
        const inventory = await prisma.inventory.findMany({
            where: { restaurantId: req.params.id },
            include: { supplier: true }
        });
        res.json({ success: true, data: { inventory } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

export default router;
