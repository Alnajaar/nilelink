import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { QRService } from '../../services/QRService';
import { logger } from '../../utils/logger';
import { AvailabilityType, PricingRuleType, AdjustmentType } from '@prisma/client';

const router = Router();

// GET /api/menus/restaurant/:restaurantId - List menus for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const menus = await prisma.menu.findMany({
            where: {
                restaurantId,
                deletedAt: null
            },
            include: {
                versions: {
                    where: { isActive: true },
                    include: {
                        items: {
                            include: {
                                menuItem: {
                                    include: {
                                        category: true
                                    }
                                }
                            },
                            orderBy: { displayOrder: 'asc' }
                        },
                        availabilities: true
                    },
                    orderBy: { version: 'desc' },
                    take: 1
                },
                qrCodes: {
                    where: { isActive: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: { menus } });
    } catch (error) {
        logger.error('Error fetching menus:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/menus/:menuId - Get menu details
router.get('/:menuId', async (req, res) => {
    try {
        const { menuId } = req.params;

        const menu = await prisma.menu.findUnique({
            where: { id: menuId },
            include: {
                versions: {
                    include: {
                        items: {
                            include: {
                                menuItem: {
                                    include: {
                                        category: true,
                                        dynamicPricingRules: true
                                    }
                                }
                            },
                            orderBy: { displayOrder: 'asc' }
                        },
                        availabilities: true,
                        qrCodes: {
                            where: { isActive: true }
                        }
                    },
                    orderBy: { version: 'desc' }
                },
                qrCodes: {
                    where: { isActive: true }
                }
            }
        });

        if (!menu) {
            return res.status(404).json({ success: false, error: 'Menu not found' });
        }

        res.json({ success: true, data: { menu } });
    } catch (error) {
        logger.error('Error fetching menu:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

const createMenuSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    restaurantId: z.string()
});

// POST /api/menus - Create new menu
router.post('/', async (req, res) => {
    try {
        const validatedData = createMenuSchema.parse(req.body);

        const menu = await prisma.menu.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                restaurantId: validatedData.restaurantId
            }
        });

        res.status(201).json({ success: true, data: menu });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            logger.error('Error creating menu:', error);
            res.status(500).json({ success: false, error: 'Failed to create menu' });
        }
    }
});

// PUT /api/menus/:menuId - Update menu
router.put('/:menuId', async (req, res) => {
    try {
        const { menuId } = req.params;
        const validatedData = createMenuSchema.partial().parse(req.body);

        const menu = await prisma.menu.update({
            where: { id: menuId },
            data: validatedData
        });

        res.json({ success: true, data: menu });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            logger.error('Error updating menu:', error);
            res.status(500).json({ success: false, error: 'Failed to update menu' });
        }
    }
});

// POST /api/menus/:menuId/publish - Publish menu
router.post('/:menuId/publish', async (req, res) => {
    try {
        const { menuId } = req.params;

        // Create new version if items have changed
        const latestVersion = await prisma.menuVersion.findFirst({
            where: { menuId },
            orderBy: { version: 'desc' }
        });

        let currentVersion = latestVersion;

        if (!currentVersion) {
            // Create initial version with all menu items
            const menu = await prisma.menu.findUnique({
                where: { id: menuId },
                include: { restaurant: { include: { menuItems: true } } }
            });

            if (!menu) {
                return res.status(404).json({ success: false, error: 'Menu not found' });
            }

            currentVersion = await prisma.menuVersion.create({
                data: {
                    menuId,
                    version: 1,
                    items: {
                        create: menu.restaurant.menuItems.map((item, index) => ({
                            menuItemId: item.id,
                            displayOrder: index
                        }))
                    }
                }
            });
        }

        // Publish the menu
        const menu = await prisma.menu.update({
            where: { id: menuId },
            data: {
                isPublished: true,
                isDraft: false,
                publishedAt: new Date()
            }
        });

        // Generate QR code if none exists
        const existingQR = await prisma.qRCode.findFirst({
            where: { menuId, isActive: true }
        });

        if (!existingQR) {
            await QRService.generateQRCode(menuId, { menuVersionId: currentVersion.id });
        }

        res.json({ success: true, data: { menu, version: currentVersion } });
    } catch (error) {
        logger.error('Error publishing menu:', error);
        res.status(500).json({ success: false, error: 'Failed to publish menu' });
    }
});

// POST /api/menus/:menuId/unpublish - Unpublish menu
router.post('/:menuId/unpublish', async (req, res) => {
    try {
        const { menuId } = req.params;

        const menu = await prisma.menu.update({
            where: { id: menuId },
            data: {
                isPublished: false,
                publishedAt: null
            }
        });

        res.json({ success: true, data: menu });
    } catch (error) {
        logger.error('Error unpublishing menu:', error);
        res.status(500).json({ success: false, error: 'Failed to unpublish menu' });
    }
});

// POST /api/menus/:menuId/versions - Create new version
router.post('/:menuId/versions', async (req, res) => {
    try {
        const { menuId } = req.params;
        const { name } = req.body;

        const latestVersion = await prisma.menuVersion.findFirst({
            where: { menuId },
            orderBy: { version: 'desc' }
        });

        const newVersionNumber = (latestVersion?.version || 0) + 1;

        const newVersion = await prisma.menuVersion.create({
            data: {
                menuId,
                version: newVersionNumber,
                name: name || `Version ${newVersionNumber}`,
                items: latestVersion ? {
                    create: await prisma.menuVersionItem.findMany({
                        where: { menuVersionId: latestVersion.id },
                        select: {
                            menuItemId: true,
                            displayOrder: true,
                            isActive: true
                        }
                    }).then(items => items.map(item => ({
                        menuItemId: item.menuItemId,
                        displayOrder: item.displayOrder,
                        isActive: item.isActive
                    })))
                } : undefined
            }
        });

        res.status(201).json({ success: true, data: newVersion });
    } catch (error) {
        logger.error('Error creating menu version:', error);
        res.status(500).json({ success: false, error: 'Failed to create version' });
    }
});

// GET /api/menus/qr/:qrCode - Public endpoint for QR menu
router.get('/qr/:qrCode', async (req, res) => {
    try {
        const { qrCode } = req.params;

        const qr = await QRService.validateQRCode(qrCode);

        if (!qr) {
            return res.status(404).json({ success: false, error: 'Menu not found' });
        }

        const menu = qr.menu;
        if (!menu.isPublished) {
            return res.status(404).json({ success: false, error: 'Menu not available' });
        }

        // Get current version with real-time availability
        const currentVersion = qr.menuVersion || qr.menu.versions[0];
        if (!currentVersion) {
            return res.status(404).json({ success: false, error: 'Menu version not found' });
        }

        // Check real-time availability based on inventory and dynamic pricing
        const menuItemsWithAvailability = await Promise.all(
            currentVersion.items.map(async (item) => {
                const menuItem = item.menuItem;

                // Check inventory availability
                let realTimeAvailable = menuItem.isAvailable;
                if (menuItem.stock !== undefined && menuItem.stock <= 0) {
                    realTimeAvailable = false;
                }

                // Check dynamic availability rules
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0 = Sunday
                const currentTime = now.toTimeString().slice(0, 5); // HH:MM

                for (const availability of currentVersion.availabilities) {
                    if (!availability.isActive) continue;

                    switch (availability.type) {
                        case 'ALWAYS':
                            // Always available
                            break;
                        case 'TIME_BASED':
                            if (availability.startTime && availability.endTime) {
                                const startTime = availability.startTime.toTimeString().slice(0, 5);
                                const endTime = availability.endTime.toTimeString().slice(0, 5);
                                if (currentTime < startTime || currentTime > endTime) {
                                    realTimeAvailable = false;
                                }
                            }
                            break;
                        case 'DAY_BASED':
                            if (availability.daysOfWeek && !availability.daysOfWeek.includes(dayOfWeek)) {
                                realTimeAvailable = false;
                            }
                            break;
                        case 'EVENT_BASED':
                            // Custom event logic can be added here
                            break;
                    }
                }

                // Apply dynamic pricing
                let effectivePrice = menuItem.price;
                for (const rule of menuItem.dynamicPricingRules) {
                    if (!rule.isActive) continue;

                    const now = new Date();
                    if (rule.validFrom && now < rule.validFrom) continue;
                    if (rule.validTo && now > rule.validTo) continue;

                    // Check rule conditions
                    let applies = false;
                    switch (rule.type) {
                        case 'TIME_BASED':
                            // Similar to availability time check
                            break;
                        case 'DAY_BASED':
                            // Similar to availability day check
                            break;
                        case 'EVENT_BASED':
                            // Custom logic
                            break;
                        case 'STOCK_BASED':
                            if (menuItem.stock !== undefined) {
                                const condition = rule.condition as any;
                                if (condition.operator === 'less_than' && menuItem.stock < condition.value) {
                                    applies = true;
                                }
                            }
                            break;
                    }

                    if (applies) {
                        if (rule.adjustmentType === 'PERCENTAGE') {
                            effectivePrice *= (1 + rule.adjustment / 100);
                        } else {
                            effectivePrice += rule.adjustment;
                        }
                    }
                }

                return {
                    ...item,
                    menuItem: {
                        ...menuItem,
                        isAvailable: realTimeAvailable,
                        price: effectivePrice
                    }
                };
            })
        );

        // Update the current version with real-time data
        const menuWithRealTimeData = {
            ...menu,
            versions: [{
                ...currentVersion,
                items: menuItemsWithAvailability
            }]
        };

        // Record scan
        await QRService.recordScan(qrCode, {
            userAgent: req.headers['user-agent'] as string,
            ipAddress: req.ip,
            language: req.headers['accept-language']?.split(',')[0],
            currency: req.query.currency as string
        });

        res.json({ success: true, data: { menu: menuWithRealTimeData, qr } });
    } catch (error) {
        logger.error('Error fetching QR menu:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/menus/qr/:qrCode/order - Place order from QR
router.post('/qr/:qrCode/order', async (req, res) => {
    try {
        const { qrCode } = req.params;
        const { items, customerInfo } = req.body;

        const qr = await QRService.validateQRCode(qrCode);

        if (!qr) {
            return res.status(404).json({ success: false, error: 'Invalid QR code' });
        }

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                restaurantId: qr.menu.restaurantId,
                totalAmount: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
                status: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.price * item.quantity,
                        customizations: item.customizations
                    }))
                }
            }
        });

        // 🚀 SUPPLIER SYNC LOGIC: Implement Smart-Restock for $50 tier
        // Check if the restaurant has the supplier hub feature (from $50 tier)
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: qr.menu.restaurantId },
            include: {
                tenant: {
                    include: {
                        subscriptions: {
                            where: { status: 'ACTIVE' },
                            include: { plan: true }
                        }
                    }
                }
            }
        });

        if (restaurant?.tenant?.subscriptions?.length) {
            // Check if any active subscription includes supplier_hub feature
            const hasSupplierHub = restaurant.tenant.subscriptions.some(sub =>
                sub.plan?.features?.includes('supplier_hub')
            );

            if (hasSupplierHub) {
                // Implement Smart-Restock: Automatically restock low inventory items
                // Using centralized service
                const { InventoryService } = require('../../services/InventoryService');
                await InventoryService.checkAndRestock(items, qr.menu.restaurantId);
            }
        }

        // Record analytics
        await prisma.menuAnalytics.create({
            data: {
                qrCodeId: qr.id,
                eventType: 'ORDER_START',
                userAgent: req.headers['user-agent'] as string,
                language: req.headers['accept-language']?.split(',')[0],
                currency: req.query.currency as string
            }
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        logger.error('Error creating QR order:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// Helper functions
// POST /api/menus/cache/:menuVersionId - Cache menu data for offline use
router.post('/cache/:menuVersionId', async (req, res) => {
    try {
        const { menuVersionId } = req.params;

        const menuVersion = await prisma.menuVersion.findUnique({
            where: { id: menuVersionId },
            include: {
                menu: true,
                items: {
                    include: {
                        menuItem: {
                            include: {
                                category: true,
                                dynamicPricingRules: true
                            }
                        }
                    },
                    orderBy: { displayOrder: 'asc' }
                },
                availabilities: true
            }
        });

        if (!menuVersion) {
            return res.status(404).json({ success: false, error: 'Menu version not found' });
        }

        // Create cached data
        const cacheData = {
            menu: menuVersion.menu,
            version: menuVersion,
            cachedAt: new Date(),
            items: menuVersion.items,
            availabilities: menuVersion.availabilities
        };

        // Upsert cache
        await prisma.menuCache.upsert({
            where: { menuVersionId },
            update: {
                data: cacheData,
                version: { increment: 1 },
                updatedAt: new Date()
            },
            create: {
                menuVersionId,
                data: cacheData,
                version: 1
            }
        });

        res.json({ success: true, message: 'Menu cached successfully' });
    } catch (error) {
        logger.error('Error caching menu:', error);
        res.status(500).json({ success: false, error: 'Failed to cache menu' });
    }
});

// GET /api/menus/offline-cache/:qrCode - Get cached menu for offline use
router.get('/offline-cache/:qrCode', async (req, res) => {
    try {
        const { qrCode } = req.params;

        const qr = await prisma.qRCode.findUnique({
            where: { code: qrCode },
            include: {
                menuVersion: {
                    include: {
                        caches: true
                    }
                }
            }
        });

        if (!qr || !qr.menuVersion) {
            return res.status(404).json({ success: false, error: 'QR code or cached menu not found' });
        }

        const cache = qr.menuVersion.caches[0];
        if (!cache) {
            return res.status(404).json({ success: false, error: 'No cached menu available' });
        }

        // Check if cache is still valid
        if (cache.expiresAt && cache.expiresAt < new Date()) {
            return res.status(404).json({ success: false, error: 'Cached menu expired' });
        }

        // Record offline access (still track analytics)
        await QRService.recordScan(qrCode, {
            userAgent: req.headers['user-agent'] as string,
            ipAddress: req.ip,
            language: req.headers['accept-language']?.split(',')[0],
            currency: req.query.currency as string
        });

        res.json({ success: true, data: { ...cache.data, isOffline: true }, cache: { version: cache.version, cachedAt: cache.cachedAt } });
    } catch (error) {
        logger.error('Error fetching cached menu:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cached menu' });
    }
});

// POST /api/menus/sync-orders - Sync offline orders when back online
router.post('/sync-orders', async (req, res) => {
    try {
        const { orders } = req.body; // Array of cached orders

        const syncedOrders = [];

        for (const cachedOrder of orders) {
            try {
                // Create the order
                const order = await prisma.order.create({
                    data: {
                        orderNumber: cachedOrder.orderNumber || generateOrderNumber(),
                        restaurantId: cachedOrder.restaurantId,
                        totalAmount: cachedOrder.totalAmount,
                        status: 'PENDING', // Or based on cached status
                        items: {
                            create: cachedOrder.items
                        }
                    }
                });

                syncedOrders.push(order);
            } catch (error) {
                logger.error('Error syncing order:', cachedOrder, error);
                // Continue with other orders
            }
        }

        res.json({ success: true, data: { syncedOrders, count: syncedOrders.length } });
    } catch (error) {
        logger.error('Error syncing orders:', error);
        res.status(500).json({ success: false, error: 'Failed to sync orders' });
    }
});

function generateOrderNumber(): string {
    return 'QR' + Date.now().toString();
}

export default router;
