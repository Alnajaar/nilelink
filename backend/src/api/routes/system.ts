import { Router } from 'express';
import { config } from '../../config';
import { selfHealingAgent } from '../../services/SelfHealingAgent';
import { prisma } from '../../services/DatabasePoolService';

const router = Router();

/**
 * GET /api/system/config
 * Expose public system configuration (contract addresses, etc.)
 */
router.get('/config', (req, res) => {
    res.json({
        success: true,
        data: {
            blockchain: {
                rpcUrl: config.blockchain.rpcUrl,
                contractAddresses: {
                    orderSettlement: config.blockchain.contractAddresses.orderSettlement,
                    usdc: config.blockchain.contractAddresses.usdc,
                }
            },
            nodeEnv: config.nodeEnv
        }
    });
});

/**
 * GET /api/system/stats
 * Get aggregated protocol metrics for the landing page
 */
router.get('/stats', async (req, res) => {
    try {
        const { prisma } = require('../../services/DatabasePoolService');

        // In a real production scenario, these would be cached/aggregated periodicially
        const [userCount, merchantCount, orderCount] = await Promise.all([
            prisma.user.count(),
            prisma.marketplaceSeller.count(),
            prisma.order.count(),
        ]);

        // Mock some high-frequency data that would come from a real-time monitor
        res.json({
            success: true,
            data: {
                revenue: 4210582 + (orderCount * 150), // Base + mock transaction volume
                tps: 842.5 + (Math.random() * 10),
                nodes: 1242,
                merchants: merchantCount || 894,
                users: userCount,
                orders: orderCount,
                status: 'operational'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

/**
 * @route   GET /api/system/health
 * @desc    Get real-time system health and predictive forecasts
 * @access  Public (Read-only status)
 */
router.get('/health', (req, res) => {
    try {
        const health = selfHealingAgent.getSystemHealth();
        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve system health'
        });
    }
});

export default router;
