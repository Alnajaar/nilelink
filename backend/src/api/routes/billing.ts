import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { auditService } from '../../services/AuditService';
import { extractTenant } from '../../middleware/tenantContext';
import { logger } from '../../utils/logger';

const router = Router();

// Initialize Stripe only if secret key is provided
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
}) : null;

const PLAN_PRICES = {
    BASIC: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    PROFESSIONAL: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_pro',
    ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
};

// ============================================================================
// SUBSCRIPTION & BILLING ROUTES
// ============================================================================

/**
 * POST /api/billing/create-checkout
 * Create Stripe checkout session for subscription upgrade
 */
router.post('/create-checkout',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            if (!stripe) {
                return res.status(503).json({
                    success: false,
                    error: 'Stripe integration not configured. Please configure STRIPE_SECRET_KEY in environment variables.'
                });
            }

            const CreateCheckoutSchema = z.object({
                plan: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
            });

            const { plan } = CreateCheckoutSchema.parse(req.body);
            const tenant = req.tenant;
            const priceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                customer: tenant.stripeCustomerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `https://${tenant.subdomain}.nilelink.app/billing/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `https://${tenant.subdomain}.nilelink.app/billing`,
                metadata: {
                    tenantId: tenant.id,
                    plan: plan,
                },
            });

            res.json({
                success: true,
                data: {
                    sessionId: session.id,
                    url: session.url,
                }
            });
        } catch (error: any) {
            logger.error('Create checkout error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create checkout session'
            });
        }
    }
);

/**
 * POST /api/billing/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
        } catch (err: any) {
            logger.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as any;
                await handleCheckoutCompleted(session);
                break;

            case 'customer.subscription.updated':
                const subscription = event.data.object as any;
                await handleSubscriptionUpdated(subscription);
                break;

            case 'customer.subscription.deleted':
                const deletedSub = event.data.object as any;
                await handleSubscriptionDeleted(deletedSub);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as any;
                logger.info('Payment succeeded:', { invoiceId: invoice.id });
                break;

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object as any;
                await handlePaymentFailed(failedInvoice);
                break;

            default:
                logger.info(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    }
);

/**
 * GET /api/billing/portal
 * Create Stripe billing portal session
 */
router.get('/portal',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const tenant = req.tenant;

            const session = await stripe.billingPortal.sessions.create({
                customer: tenant.stripeCustomerId,
                return_url: `https://${tenant.subdomain}.nilelink.app/billing`,
            });

            res.json({
                success: true,
                data: {
                    url: session.url
                }
            });
        } catch (error) {
            logger.error('Create portal error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create billing portal session'
            });
        }
    }
);

/**
 * GET /api/billing/payouts
 * Retrieve recent payouts for the tenant
 */
router.get('/payouts',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const tenant = req.tenant;

            // Get payouts from Stripe
            const payouts = await stripe.payouts.list({
                limit: 20
            }, {
                stripeAccount: tenant.stripeConnectId // Assuming Connect is used for payouts
            });

            res.json({
                success: true,
                data: payouts.data
            });
        } catch (error) {
            logger.error('Fetch payouts error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch payouts'
            });
        }
    }
);

/**
 * POST /api/billing/payouts
 * Trigger a manual payout for a merchant or driver
 */
router.post('/payouts',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const PayoutSchema = z.object({
                amount: z.number().min(0.01),
                currency: z.string().default('usd'),
                destination: z.string().optional(),
            });

            const { amount, currency = 'usd', destination } = PayoutSchema.parse(req.body);
            const tenant = req.tenant;

            // Create transfer to Connect account
            const transfer = await stripe.transfers.create({
                amount: Math.round(amount * 100),
                currency,
                destination: destination || tenant.stripeConnectId,
                metadata: {
                    tenantId: tenant.id,
                    type: 'MANUAL_SETTLEMENT'
                }
            });

            res.json({
                success: true,
                data: transfer
            });
        } catch (error: any) {
            logger.error('Payout error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to process payout'
            });
        }
    }
);

/**
 * GET /api/billing/settlements
 * Get settlement stats for the dashboard
 */
router.get('/settlements',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const tenant = req.tenant;

            // Get settlements for all restaurants in this tenant
            const settlements = await prisma.settlement.findMany({
                where: {
                    restaurant: {
                        tenantId: tenant.id
                    }
                },
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { periodEnd: 'desc' },
                take: 50
            });

            // Calculate pending and available balances
            const pendingSettlements = settlements.filter(s => s.status === 'PENDING');
            const processedSettlements = settlements.filter(s => s.status === 'PROCESSED');

            const pendingBalance = pendingSettlements.reduce((sum, s) => sum + Number(s.netSettlement), 0);
            const availableBalance = processedSettlements.reduce((sum, s) => sum + Number(s.netSettlement), 0);

            res.json({
                success: true,
                data: {
                    history: settlements.map(s => ({
                        id: s.id,
                        date: s.periodEnd.toISOString().split('T')[0],
                        amount: Number(s.netSettlement),
                        status: s.status,
                        type: 'REVENUE_SHARE',
                        restaurantName: s.restaurant?.name || 'Unknown'
                    })),
                    pendingBalance,
                    availableBalance
                }
            });
        } catch (error) {
            logger.error('Fetch settlements error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch settlements' });
        }
    }
);

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

async function handleCheckoutCompleted(session: any) {
    const { tenantId, plan } = session.metadata;

    await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            plan: plan,
            subscriptionId: session.subscription,
        }
    });

    logger.info(`Tenant ${tenantId} upgraded to ${plan}`);
}

async function handleSubscriptionUpdated(subscription: any) {
    const customer = subscription.customer;

    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customer }
    });

    if (tenant) {
        // Handle plan changes, cancellations, etc.
        logger.info(`Subscription updated for tenant ${tenant.id}`);
    }
}

async function handleSubscriptionDeleted(subscription: any) {
    const customer = subscription.customer;

    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customer }
    });

    if (tenant) {
        // Downgrade to trial or disable account
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                plan: 'TRIAL',
                subscriptionId: null,
                isActive: false,
            }
        });

        logger.warn(`Subscription cancelled for tenant ${tenant.id}`);
    }
}

async function handlePaymentFailed(invoice: any) {
    const customer = invoice.customer;

    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customer }
    });

    if (tenant) {
        logger.error(`Payment failed for tenant ${tenant.id}`);
        // TODO: Send email notification
    }
}

export default router;
