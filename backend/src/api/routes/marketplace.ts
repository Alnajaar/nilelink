import { Router } from 'express';
import { z } from 'zod';
import { marketplaceService, trustService, escrowManager } from '../../services/marketplace';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// --- VALIDATION SCHEMAS ---

const createListingSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    type: z.enum(['PHYSICAL', 'SERVICE']),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
    menuItemId: z.string().optional(),
});

const placeOrderSchema = z.object({
    sellerId: z.string(),
    items: z.array(z.object({
        listingId: z.string(),
        quantity: z.number().int().positive(),
    })),
});

const disputeSchema = z.object({
    reason: z.string().min(10),
    evidenceUrls: z.array(z.string()).optional(),
});

// --- BUYER APIS ---

/**
 * GET /api/marketplace/listings
 * Browse listings with filters
 */
router.get('/listings', async (req, res) => {
    try {
        const { category, type, minPrice, maxPrice, search } = req.query;

        const where: any = { isAvailable: true };
        if (category) where.category = category;
        if (type) where.type = type;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const listings = await prisma.marketplaceListing.findMany({
            where,
            include: { seller: { include: { restaurant: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: listings });
    } catch (error) {
        logger.error('Failed to fetch listings', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/marketplace/orders
 * Place a new marketplace order
 */
router.post('/orders', authenticate, async (req, res) => {
    try {
        const { sellerId, items } = placeOrderSchema.parse(req.body);
        const userId = (req as any).user.userId;

        const order = await marketplaceService.placeOrder(userId, sellerId, items);

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to place order', { error });
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
    }
});

/**
 * POST /api/marketplace/orders/:id/receive
 * Buyer confirms receipt of order (releases escrow)
 */
router.post('/orders/:id/receive', authenticate, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = (req as any).user.userId;

        const order = await prisma.marketplaceOrder.findUnique({ where: { id: orderId } });
        if (!order || order.buyerId !== userId) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        await escrowManager.releaseFunds(orderId);

        res.json({ success: true, message: 'Receipt confirmed and funds released' });
    } catch (error) {
        logger.error('Failed to confirm receipt', { error, orderId: req.params.id });
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
    }
});

// --- SELLER APIS ---

/**
 * POST /api/marketplace/listings
 * Create a new listing (Seller only)
 */
router.post('/listings', authenticate, async (req, res) => {
    try {
        const data = createListingSchema.parse(req.body);
        const userId = (req as any).user.userId;

        const seller = await prisma.marketplaceSeller.findUnique({ where: { userId } });
        if (!seller) {
            return res.status(403).json({ success: false, error: 'Not a registered seller' });
        }

        const listing = await marketplaceService.createListing(seller.id, data);
        res.status(201).json({ success: true, data: listing });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to create listing', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/marketplace/orders/:id/accept
 * Seller confirms order readiness
 */
router.post('/orders/:id/accept', authenticate, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = (req as any).user.userId;

        const seller = await prisma.marketplaceSeller.findUnique({ where: { userId } });
        const order = await prisma.marketplaceOrder.findUnique({ where: { id: orderId } });

        if (!order || !seller || order.sellerId !== seller.id) {
            return res.status(404).json({ success: false, error: 'Order not found or unauthorized' });
        }

        await marketplaceService.confirmOrder(orderId);
        res.json({ success: true, message: 'Order accepted' });
    } catch (error) {
        logger.error('Failed to accept order', { error, orderId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// --- DISPUTE APIS ---

/**
 * POST /api/marketplace/orders/:id/dispute
 * Buyer raises a dispute
 */
router.post('/orders/:id/dispute', authenticate, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { reason, evidenceUrls = [] } = disputeSchema.parse(req.body);
        const userId = (req as any).user.userId;

        const order = await prisma.marketplaceOrder.findUnique({ where: { id: orderId } });
        if (!order || order.buyerId !== userId) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const dispute = await trustService.openDispute(orderId, reason, evidenceUrls);
        res.status(201).json({ success: true, data: dispute });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to open dispute', { error, orderId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// --- ADMIN APIS ---

/**
 * POST /api/marketplace/disputes/:id/resolve
 * Admin resolves a dispute
 */
router.post('/disputes/:id/resolve', authenticate, async (req, res) => {
    try {
        const disputeId = req.params.id;
        const { decision } = req.body; // enum: RELEASE_TO_SELLER, REFUND_TO_BUYER, PARTIAL_REFUND
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        if (userRole !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Unauthorized. Admin only.' });
        }

        await trustService.resolveDispute(disputeId, decision, userId);
        res.json({ success: true, message: 'Dispute resolved' });
    } catch (error) {
        logger.error('Failed to resolve dispute', { error, disputeId: req.params.id });
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
    }
});

import { neuralLogistics } from '../../services/NeuralLogisticsService';

// ... existing imports ...

// --- NEURAL LOGISTICS ENDPOINTS ---

// GET /api/marketplace/neural/predict-demand
router.get('/neural/predict-demand', async (req, res) => {
    try {
        const { regionId, category } = req.query;
        // Mock region ID for now if not provided
        const suggestion = await neuralLogistics.predictDemandPreStaging(
            String(regionId || 'downtown-hub-01'),
            String(category || 'GENERAL')
        );

        res.json({ success: true, data: suggestion });
    } catch (error) {
        res.status(500).json({ success: false, error: 'AI Prediction Failed' });
    }
});

// GET /api/marketplace/neural/dynamic-price/:listingId
router.get('/neural/dynamic-price/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params;
        const { basePrice } = req.query;

        if (!basePrice) return res.status(400).json({ error: 'Base price required' });

        const newPrice = await neuralLogistics.calculateDynamicPrice(listingId, Number(basePrice));
        res.json({ success: true, data: { listingId, originalPrice: basePrice, dynamicPrice: newPrice } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Dynamic Pricing Failed' });
    }
});

// ... existing routes ...

import { defiService } from '../../services/DeFiService';

// --- DEFI FINANCING ENDPOINTS ---

// GET /api/marketplace/defi/credit-limit
router.get('/defi/credit-limit', async (req, res) => {
    try {
        const sellerId = String(req.query.sellerId || 'current-user');
        const limit = await defiService.getCreditLimit(sellerId);
        res.json({ success: true, data: limit });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Credit Check Failed' });
    }
});

// POST /api/marketplace/defi/request-capital
router.post('/defi/request-capital', async (req, res) => {
    try {
        const { sellerId, amount } = req.body;
        const offer = await defiService.requestCapital({
            sellerId,
            amount,
            orderIds: [] // assume rolling credit for now
        });
        res.json({ success: true, data: offer });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message || 'Loan Denied' });
    }
});

// ... existing routes ...

import { agentNegotiation } from '../../services/AgentNegotiationService';

// --- A2A NEGOTIATION ENDPOINTS ---

// POST /api/marketplace/negotiation/start
router.post('/negotiation/start', async (req, res) => {
    try {
        const { buyerId, listingId, initialOffer, maxBudget } = req.body;
        const negotiation = await agentNegotiation.startNegotiation(
            buyerId,
            listingId,
            Number(initialOffer),
            Number(maxBudget)
        );
        res.json({ success: true, data: negotiation });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Negotiation Failed to Start' });
    }
});

// GET /api/marketplace/negotiation/:id
router.get('/negotiation/:id', async (req, res) => {
    try {
        const negotiation = agentNegotiation.getNegotiation(req.params.id);
        if (!negotiation) return res.status(404).json({ error: 'Negotiation not found' });
        res.json({ success: true, data: negotiation });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Fetch Failed' });
    }
});

// ... existing routes ...

import { juryService } from '../../services/JuryService';

// --- DECENTRALIZED JURY ENDPOINTS ---

// GET /api/marketplace/jury/cases
router.get('/jury/cases', async (req, res) => {
    try {
        const userId = String(req.query.userId || 'current-user');
        const cases = await juryService.getCasesForJuror(userId);
        res.json({ success: true, data: cases });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Fetch Jury Cases Failed' });
    }
});

// POST /api/marketplace/jury/vote
router.post('/jury/vote', async (req, res) => {
    try {
        const { caseId, userId, vote } = req.body;
        await juryService.castVote(caseId, userId, vote);
        res.json({ success: true, message: 'Vote Recorded' });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message || 'Voting Failed' });
    }
});

export default router;
