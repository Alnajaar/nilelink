import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/authenticate';
import { requireFeature } from '../../middleware/featureGate';

const router = Router();

// GET /api/deliveries/available - List orders ready for delivery
router.get('/available', authenticate, requireFeature('delivery_fleet'), async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        // Find orders with status 'READY' that don't have a delivery assigned yet
        // OR deliveries with status 'PENDING'

        // First get restaurants for this tenant
        const restaurants = await prisma.restaurant.findMany({
            where: { tenantId },
            select: { id: true }
        });
        const restaurantIds = restaurants.map(r => r.id);

        const availableDeliveries = await prisma.delivery.findMany({
            where: {
                order: {
                    restaurantId: { in: restaurantIds }
                },
                status: 'PENDING'
            },
            include: {
                order: {
                    select: {
                        id: true,
                        restaurant: { select: { name: true, address: true } },
                        totalAmount: true,
                        paymentMethod: true
                    }
                }
            }
        });

        res.json({ success: true, data: availableDeliveries });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch deliveries' });
    }
});

const assignDriverSchema = z.object({
    orderId: z.string(),
    driverId: z.string()
});

// POST /api/deliveries/assign - Manual dispatch (Admin/Manager)
router.post('/assign', authenticate, requireFeature('delivery_fleet'), async (req, res) => {
    try {
        const { orderId, driverId } = assignDriverSchema.parse(req.body);

        const driver = await prisma.user.findUnique({ where: { id: driverId } });
        if (!driver || driver.role !== 'DELIVERY_DRIVER') {
            return res.status(400).json({ success: false, error: 'Invalid driver' });
        }

        // Check if delivery exists or create it
        let delivery = await prisma.delivery.findUnique({ where: { orderId } });

        if (!delivery) {
            // Should have been created when order became READY, but create if missing
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

            delivery = await prisma.delivery.create({
                data: {
                    orderId,
                    pickupAddress: 'Restaurant Address Placeholder', // Todo: fetch from restaurant
                    dropoffAddress: 'Customer Address Placeholder', // Todo: fetch from order
                    status: 'ASSIGNED',
                    driverId
                }
            });
        } else {
            delivery = await prisma.delivery.update({
                where: { id: delivery.id },
                data: {
                    driverId,
                    status: 'ASSIGNED'
                }
            });
        }

        // Notify Driver (Socket.IO)
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${driverId}`).emit('delivery:assigned', { deliveryId: delivery.id, orderId });
        }

        res.json({ success: true, message: 'Driver assigned successfully', data: delivery });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ success: false, error: 'Assignment failed' });
    }
});

// POST /api/deliveries/:id/accept - Driver accepts
router.post('/:id/accept', authenticate, async (req, res) => {
    try {
        const deliveryId = req.params.id;
        const driverId = req.user!.id; // Authenticated driver

        const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });

        if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });
        if (delivery.driverId && delivery.driverId !== driverId) {
            return res.status(403).json({ success: false, error: 'Delivery assigned to another driver' });
        }

        const updated = await prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                status: 'ASSIGNED', // If it was pending
                driverId: driverId // Claim it
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Action failed' });
    }
});


// POST /api/deliveries/:id/status - Update status
router.post('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = z.object({
            status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'])
        }).parse(req.body);

        const delivery = await prisma.delivery.update({
            where: { id: req.params.id },
            data: {
                status: status as any,
                ...(status === 'PICKED_UP' ? { pickupTime: new Date() } : {}),
                ...(status === 'DELIVERED' ? { deliveryTime: new Date() } : {})
            }
        });

        // Sync Order Status
        if (status === 'DELIVERED') {
            await prisma.order.update({
                where: { id: delivery.orderId },
                data: { status: 'COMPLETED', paymentStatus: 'PAID' } // Assume COD paid
            });
        } else if (status === 'PICKED_UP') {
            // Maybe update order to 'IN_DELIVERY' if we had that status
        }

        res.json({ success: true, data: delivery });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

// GET /api/deliveries/my-history - Driver history
router.get('/my-history', authenticate, async (req, res) => {
    try {
        const deliveries = await prisma.delivery.findMany({
            where: { driverId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ success: true, data: deliveries });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Fetch failed' });
    }
});

export default router;
