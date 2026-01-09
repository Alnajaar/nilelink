import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/authenticate';
import { requireFeature } from '../../middleware/featureGate';

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

const createRestaurantSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    address: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isActive: z.boolean().default(true)
});

// POST /api/restaurants - Create new restaurant
router.post('/',
    authenticate,
    requireFeature('multi_location'),
    async (req, res) => {
        try {
            const validatedData = createRestaurantSchema.parse(req.body);

            // Ensure there's a default tenant for the restaurant if not provided
            const globalTenant = await prisma.tenant.findFirst({ where: { subdomain: 'global' } });
            const tenantId = globalTenant?.id;

            if (!tenantId) {
                return res.status(400).json({ success: false, error: 'System not fully initialized: Global tenant missing' });
            }

            const restaurant = await prisma.restaurant.create({
                data: {
                    ...validatedData,
                    tenant: {
                        connect: { id: tenantId }
                    }
                }
            });

            res.status(201).json({ success: true, data: restaurant });
        } catch (error) {
            console.error(error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            } else {
                res.status(500).json({ success: false, error: 'Failed to create restaurant' });
            }
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

const createMenuItemSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    category: z.string().min(1),
    isAvailable: z.boolean().default(true),
    preparationTime: z.number().optional()
});

// POST /api/restaurants/:id/menu - Add item to menu
router.post('/:id/menu', async (req, res) => {
    try {
        const validatedData = createMenuItemSchema.parse(req.body);
        const restaurantId = req.params.id;

        const menuItem = await prisma.menuItem.create({
            data: {
                ...validatedData,
                restaurantId
            }
        });

        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            res.status(500).json({ success: false, error: 'Failed to create menu item' });
        }
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
