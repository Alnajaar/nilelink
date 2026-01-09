import { Router } from 'express';
import { aiService } from '../../services/AIService';
import { logger } from '../../utils/logger';

const router = Router();

// POST /api/ai/persist - Persist AI request/result to DB
router.post('/persist', async (req, res) => {
    try {
        const { requestId, inputData, context, result, inventorySignal } = req.body;
        await aiService.persistMemory(requestId, inputData, context, result, inventorySignal);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to persist' });
    }
});

// POST /api/ai/sync-weights - Sync model weights to DB
router.post('/sync-weights', async (req, res) => {
    try {
        const { modelName, weights } = req.body;
        await aiService.syncWeights(modelName, weights);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to sync weights' });
    }
});

// GET /api/ai/weights/:modelName - Retrieve weights
router.get('/weights/:modelName', async (req, res) => {
    try {
        const { modelName } = req.params;
        const { prisma } = require('../../services/DatabasePoolService');
        const weight = await prisma.aIModelWeight.findUnique({ where: { modelName } });
        res.json({ success: true, data: weight });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch weights' });
    }
});

export default router;
