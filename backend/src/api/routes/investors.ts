import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Validation schemas
const voteSchema = z.object({
    proposalId: z.string(),
    support: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
    reason: z.string().optional()
});

const stakeSchema = z.object({
    poolId: z.string(),
    amount: z.string() // Wei or smallest unit as string
});

// GET /api/investors/portfolio - Retrieve persistent portfolio data
router.get('/portfolio', authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const walletAddress = req.user?.walletAddress;

        // Fetch staking positions
        const stakes = await prisma.stakePosition.findMany({
            where: { userAddress: walletAddress || '0xdev_wallet' },
            include: { pool: true }
        });

        // Calculate totals (Mock logic for ROI based on stake duration)
        const totalInvested = stakes.reduce((acc, s) => acc + Number(s.amount), 0);
        const currentValue = totalInvested * 1.15; // Simulated 15% growth
        const totalDividends = stakes.reduce((acc, s) => acc + Number(s.rewards), 0);

        res.json({
            success: true,
            data: {
                totalInvested,
                currentValue,
                totalDividends,
                availableDividends: totalDividends * 0.1, // 10% unlocked
                stakes: stakes.map(s => ({
                    id: s.id,
                    poolName: s.pool.name,
                    amount: s.amount,
                    rewards: s.rewards,
                    roi: Number(s.pool.rewardRate)
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch portfolio' });
    }
});

// GET /api/investors/governance - Active proposals
router.get('/governance/proposals', authenticate, async (req, res) => {
    try {
        const proposals = await prisma.governanceProposal.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: proposals });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch proposals' });
    }
});

// POST /api/investors/governance/vote - Submit a vote
router.post('/governance/vote', authenticate, async (req, res) => {
    try {
        const { proposalId, support, reason } = voteSchema.parse(req.body);
        const voter = req.user?.walletAddress || '0xdev_voter';

        const vote = await prisma.governanceVote.upsert({
            where: {
                proposalId_voter: { proposalId, voter }
            },
            create: {
                proposalId,
                voter,
                support,
                votes: "1000", // Simplified voting power
                reason
            },
            update: {
                support,
                reason
            }
        });

        // Update proposal tallies
        const updateData: any = {};
        if (support === 'FOR') updateData.forVotes = { increment: 1000 };
        if (support === 'AGAINST') updateData.againstVotes = { increment: 1000 };
        if (support === 'ABSTAIN') updateData.abstainVotes = { increment: 1000 };

        await prisma.governanceProposal.update({
            where: { id: proposalId },
            data: updateData
        });

        res.json({ success: true, message: 'Vote recorded', data: vote });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Voting failed' });
    }
});

export default router;
