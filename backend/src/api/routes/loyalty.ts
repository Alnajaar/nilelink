import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { NeuralLoyaltyService } from '../../services/NeuralLoyaltyService';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
const loyaltyService = new NeuralLoyaltyService(prisma);

// GET /api/loyalty/profile - Get current user's loyalty profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;

        let profile = await prisma.neuralLoyaltyProfile.findUnique({
            where: { userId },
            include: {
                currentTier: {
                    include: { benefits: true }
                }
            }
        });

        if (!profile) {
            // Lazy create profile
            profile = await prisma.neuralLoyaltyProfile.create({
                data: {
                    userId,
                    totalPoints: 0,
                    experiencePoints: 0,
                    neuralScore: 0.5,
                    streakCount: 0
                },
                include: {
                    currentTier: {
                        include: { benefits: true }
                    }
                }
            });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/loyalty/history - Get transaction history
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;

        const history = await prisma.neuralLoyaltyTransaction.findMany({
            where: {
                profile: { userId }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/loyalty/rewards - Get AI-personalized reward recommendations
router.get('/rewards', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const prediction = await loyaltyService.generatePersonalizedRewards(userId);
        res.json({ success: true, data: prediction });
    } catch (error) {
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
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/loyalty/activity - Process ecosystem activity
router.post('/activity', authenticate, async (req, res) => {
    try {
        const { type, amount } = z.object({
            type: z.enum(['ORDER', 'SETTLEMENT', 'CHAOS']),
            amount: z.number().positive()
        }).parse(req.body);

        await loyaltyService.processEcosystemActivity(req.user!.id, type, amount);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Processing failed' });
    }
});

export default router;
