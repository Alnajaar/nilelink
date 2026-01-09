import { Router } from 'express';
import { marketDynamicsService } from '../../services/MarketDynamicsService';
import { authenticate } from '../../middleware/authenticate';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/market/pulse
 * Returns the current economic state, suggested fees, and demand hotspots.
 */
router.get('/pulse', async (req, res) => {
    try {
        const pulse = await marketDynamicsService.getMarketPulse();
        res.json({ success: true, data: pulse });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch market pulse' });
    }
});

/**
 * GET /api/market/forecast
 * Returns 30-day revenue and volume projections for institutional delegates.
 */
router.get('/forecast', authenticate, async (req, res) => {
    try {
        const forecast = await marketDynamicsService.getInstitutionalForecast();
        res.json({ success: true, data: forecast });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate forecast' });
    }
});

/**
 * POST /api/market/incentive/trigger
 * Allows the DAO or AI to trigger localized incentives for drivers/merchants.
 */
router.post('/incentive/trigger', authenticate, async (req, res) => {
    const { region, type, value } = req.body;
    logger.warn(`MARKET INCENTIVE TRIGGERED: ${type} in ${region} at ${value}x multiplier`);

    // In a real implementation, this would emit a socket event or update a Redis cache
    res.json({ success: true, message: `Incentive mesh active for ${region}` });
});

export default router;
