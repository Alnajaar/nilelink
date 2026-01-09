import { Router } from 'express';
import { prisma } from '../../services/DatabasePoolService';
import { NeuralLoyaltyService } from '../../services/NeuralLoyaltyService';
import { authenticate } from '../../middleware/authenticate';
import { logger } from '../../utils/logger';

const router = Router();
const loyaltyService = new NeuralLoyaltyService(prisma);

// GET /api/loyalty/profile - Get current user's loyalty profile and XP
router.get('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const profile = await prisma.neuralLoyaltyProfile.findUnique({
            where: { userId },
            include: {
                currentTier: {
                    include: { benefits: true }
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Loyalty profile not found' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        logger.error('Failed to get loyalty profile', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/loyalty/rewards - Get AI-personalized reward recommendations
router.get('/rewards', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const prediction = await loyaltyService.generatePersonalizedRewards(userId);
        res.json({ success: true, data: prediction });
    } catch (error) {
        logger.error('Failed to generate rewards', { error });
        res.status(500).json({ success: false, error: 'AI analysis failed' });
    }
});

// GET /api/loyalty/achievements - Get user achievements
router.get('/achievements', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const achievements = await prisma.neuralUserAchievement.findMany({
            where: { userId },
            include: { achievement: true }
        });
        res.json({ success: true, data: achievements });
    } catch (error) {
        logger.error('Failed to get achievements', { error });
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/loyalty/activity - Manually trigger activity (for testing/chaos events)
router.post('/activity', authenticate, async (req, res) => {
    try {
        const { type, amount } = req.body;
        const userId = req.user!.id;
        await loyaltyService.processEcosystemActivity(userId, type, amount);
        res.json({ success: true, message: 'Activity processed successfully' });
    } catch (error) {
        logger.error('Failed to process activity', { error });
        res.status(500).json({ success: false, error: 'Processing failed' });
    }
});

export default router;
