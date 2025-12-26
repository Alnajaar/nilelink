import { Router } from 'express';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
    res.json({
        success: true,
        data: {
            totalOrders: 150,
            totalRevenue: 5000.00,
            activeUsers: 45,
            topProducts: [
                { name: 'Burger', sales: 50 },
                { name: 'Pizza', sales: 30 }
            ]
        }
    });
});

export default router;