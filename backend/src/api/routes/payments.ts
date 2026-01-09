import express from 'express';
import { authenticate } from '../../middleware/authenticate';
import { prisma } from '../../services/DatabasePoolService';

const router = express.Router();

// POST /api/payments/methods - Add payment method
router.post('/methods', authenticate, async (req, res) => {
    try {
        const { type, ...paymentData } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // For now, just create a mock payment method record
        // In production, this would integrate with Stripe/PayPal
        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                userId,
                stripePaymentMethodId: `pm_mock_${Date.now()}`, // Mock for now
                type,
                isDefault: false // TODO: Check if this is the first method
            }
        });

        res.json({
            success: true,
            message: 'Payment method added successfully',
            data: {
                id: paymentMethod.id,
                type,
                isDefault: paymentMethod.isDefault,
                createdAt: paymentMethod.createdAt
            }
        });

    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add payment method'
        });
    }
});

// GET /api/payments/methods - Get payment methods
router.get('/methods', authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Transform the data to match frontend expectations
        const transformedMethods = paymentMethods.map(method => ({
            id: method.id,
            type: method.type,
            isDefault: method.isDefault,
            createdAt: method.createdAt.toISOString(),
            // Mock card data for demo
            cardLast4: method.type === 'credit_card' ? '4242' : undefined,
            cardBrand: method.type === 'credit_card' ? 'Visa' : undefined
        }));

        res.json({
            success: true,
            data: transformedMethods
        });

    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment methods'
        });
    }
});

// PUT /api/payments/methods/:id/default - Set default payment method
router.put('/methods/:id/default', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // First, unset all default methods for this user
        await prisma.paymentMethod.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        });

        // Then set the specified method as default
        const paymentMethod = await prisma.paymentMethod.update({
            where: { id, userId },
            data: { isDefault: true }
        });

        res.json({
            success: true,
            message: 'Default payment method updated',
            data: paymentMethod
        });

    } catch (error) {
        console.error('Set default payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set default payment method'
        });
    }
});

// DELETE /api/payments/methods/:id - Delete payment method
router.delete('/methods/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        await prisma.paymentMethod.delete({
            where: { id, userId }
        });

        res.json({
            success: true,
            message: 'Payment method deleted successfully'
        });

    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete payment method'
        });
    }
});

export default router;
