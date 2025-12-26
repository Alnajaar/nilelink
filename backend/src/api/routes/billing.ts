import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { extractTenant } from '../middleware/tenantContext';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

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
            const { plan } = req.body; // 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'

            if (!['BASIC', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid plan'
                });
            }

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
            console.error('Create checkout error:', error);
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
            console.error('Webhook signature verification failed:', err.message);
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
                console.log('Payment succeeded:', invoice.id);
                break;

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object as any;
                await handlePaymentFailed(failedInvoice);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
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
            console.error('Create portal error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create billing portal session'
            });
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

    console.log(`✅ Tenant ${tenantId} upgraded to ${plan}`);
}

async function handleSubscriptionUpdated(subscription: any) {
    const customer = subscription.customer;

    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customer }
    });

    if (tenant) {
        // Handle plan changes, cancellations, etc.
        console.log(`Subscription updated for tenant ${tenant.id}`);
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

        console.log(`⚠️ Subscription cancelled for tenant ${tenant.id}`);
    }
}

async function handlePaymentFailed(invoice: any) {
    const customer = invoice.customer;

    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customer }
    });

    if (tenant) {
        console.error(`❌ Payment failed for tenant ${tenant.id}`);
        // TODO: Send email notification
    }
}

export default router;
