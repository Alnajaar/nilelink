import { Router } from 'express';

const router = Router();

// POST /api/payments/process
router.post('/process', async (req, res) => {
    res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
            transactionId: 'tx-' + Date.now(),
            amount: req.body.amount,
            status: 'COMPLETED'
        }
    });
});

// GET /api/payments/:id
router.get('/:id', async (req, res) => {
    res.json({
        success: true,
        data: {
            payment: {
                id: req.params.id,
                amount: 50.00,
                status: 'COMPLETED',
                method: 'CARD'
            }
        }
    });
});

export default router;
