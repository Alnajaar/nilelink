import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { z } from 'zod';

export class StripeService {
    private stripe: Stripe;
    private readonly webhookSecret: string;

    constructor() {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY environment variable is required');
        }

        this.stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2024-12-18.acacia',
            typescript: true,
        });

        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    }

    // ========================================
    // PAYMENT METHODS
    // ========================================

    async createSetupIntent(customerId?: string) {
        try {
            const setupIntent = await this.stripe.setupIntents.create({
                payment_method_types: ['card'],
                customer: customerId,
                usage: 'off_session', // Allow future payments
            });

            return {
                clientSecret: setupIntent.client_secret,
                setupIntentId: setupIntent.id,
            };
        } catch (error) {
            logger.error('Failed to create setup intent', { error });
            throw new Error('Failed to create payment setup');
        }
    }

    async savePaymentMethod(userId: string, paymentMethodId: string) {
        try {
            const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

            // Create Stripe customer if not exists
            let customer = await this.getOrCreateStripeCustomer(userId);

            // Attach payment method to customer
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customer.id,
            });

            // Save to database
            const savedPaymentMethod = await prisma.paymentMethod.create({
                data: {
                    userId,
                    stripePaymentMethodId: paymentMethodId,
                    type: paymentMethod.type,
                    cardBrand: paymentMethod.card?.brand,
                    cardLast4: paymentMethod.card?.last4,
                    cardExpMonth: paymentMethod.card?.exp_month,
                    cardExpYear: paymentMethod.card?.exp_year,
                    isDefault: false, // Will be updated if needed
                },
            });

            return savedPaymentMethod;
        } catch (error) {
            logger.error('Failed to save payment method', { error, userId, paymentMethodId });
            throw new Error('Failed to save payment method');
        }
    }

    async getPaymentMethods(userId: string) {
        return await prisma.paymentMethod.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
        // Update default status
        await prisma.$transaction([
            prisma.paymentMethod.updateMany({
                where: { userId },
                data: { isDefault: false },
            }),
            prisma.paymentMethod.update({
                where: { id: paymentMethodId, userId },
                data: { isDefault: true },
            }),
        ]);

        const customer = await this.getOrCreateStripeCustomer(userId);
        await this.stripe.customers.update(customer.id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
    }

    // ========================================
    // SUBSCRIPTIONS
    // ========================================

    async createSubscription(
        userId: string,
        planId: string,
        paymentMethodId?: string
    ) {
        try {
            const customer = await this.getOrCreateStripeCustomer(userId);
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { id: planId },
                include: { seller: true },
            });

            if (!plan) {
                throw new Error('Subscription plan not found');
            }

            // Create subscription data
            const subscriptionData: Stripe.SubscriptionCreateParams = {
                customer: customer.id,
                items: [{
                    price_data: {
                        currency: plan.currency.toLowerCase(),
                        product_data: {
                            name: plan.name,
                            description: plan.description || undefined,
                        },
                        unit_amount: Math.round(plan.price * 100), // Convert to cents
                        recurring: {
                            interval: plan.billingCycle.toLowerCase() as 'month' | 'year',
                            interval_count: 1,
                        },
                    },
                }],
                metadata: {
                    userId,
                    planId,
                    sellerId: plan.seller.id,
                },
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
            };

            if (paymentMethodId) {
                subscriptionData.default_payment_method = paymentMethodId;
            }

            const subscription = await this.stripe.subscriptions.create(subscriptionData);

            // Save subscription to database
            const customerSubscription = await prisma.customerSubscription.create({
                data: {
                    customerId: userId,
                    planId,
                    stripeSubscriptionId: subscription.id,
                    status: this.mapStripeSubscriptionStatus(subscription.status),
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
                },
            });

            return {
                subscription: customerSubscription,
                clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
            };
        } catch (error) {
            logger.error('Failed to create subscription', { error, userId, planId });
            throw new Error('Failed to create subscription');
        }
    }

    async cancelSubscription(userId: string, subscriptionId: string, cancelAtPeriodEnd = true) {
        try {
            const subscription = await prisma.customerSubscription.findFirst({
                where: {
                    id: subscriptionId,
                    customerId: userId,
                },
            });

            if (!subscription?.stripeSubscriptionId) {
                throw new Error('Subscription not found');
            }

            if (cancelAtPeriodEnd) {
                await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });

                await prisma.customerSubscription.update({
                    where: { id: subscriptionId },
                    data: { cancelAtPeriodEnd: true },
                });
            } else {
                await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
                await prisma.customerSubscription.update({
                    where: { id: subscriptionId },
                    data: { status: 'CANCELLED' },
                });
            }
        } catch (error) {
            logger.error('Failed to cancel subscription', { error, userId, subscriptionId });
            throw new Error('Failed to cancel subscription');
        }
    }

    async updateSubscription(userId: string, subscriptionId: string, newPlanId: string) {
        try {
            const subscription = await prisma.customerSubscription.findFirst({
                where: {
                    id: subscriptionId,
                    customerId: userId,
                },
            });

            if (!subscription?.stripeSubscriptionId) {
                throw new Error('Subscription not found');
            }

            const newPlan = await prisma.subscriptionPlan.findUnique({
                where: { id: newPlanId },
            });

            if (!newPlan) {
                throw new Error('New plan not found');
            }

            // Update subscription in Stripe
            await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                items: [{
                    id: subscription.stripeSubscriptionId, // This needs to be the subscription item ID
                    price_data: {
                        currency: newPlan.currency.toLowerCase(),
                        product_data: {
                            name: newPlan.name,
                        },
                        unit_amount: Math.round(newPlan.price * 100),
                        recurring: {
                            interval: newPlan.billingCycle.toLowerCase() as 'month' | 'year',
                        },
                    },
                }],
                proration_behavior: 'create_prorations',
            });

            // Update in database
            await prisma.customerSubscription.update({
                where: { id: subscriptionId },
                data: { planId: newPlanId },
            });

            // Create upgrade transaction record
            await prisma.subscriptionTransaction.create({
                data: {
                    subscriptionId,
                    amount: newPlan.price,
                    currency: newPlan.currency,
                    type: 'UPGRADE',
                    status: 'COMPLETED',
                },
            });
        } catch (error) {
            logger.error('Failed to update subscription', { error, userId, subscriptionId, newPlanId });
            throw new Error('Failed to update subscription');
        }
    }

    // ========================================
    // PAYMENTS & CHARGES
    // ========================================

    async createPaymentIntent(
        amount: number,
        currency: string,
        userId: string,
        metadata?: Record<string, any>
    ) {
        try {
            const customer = await this.getOrCreateStripeCustomer(userId);

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                customer: customer.id,
                metadata: {
                    userId,
                    ...metadata,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        } catch (error) {
            logger.error('Failed to create payment intent', { error, userId, amount, currency });
            throw new Error('Failed to create payment intent');
        }
    }

    async processRefund(paymentIntentId: string, amount?: number) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
            });

            return refund;
        } catch (error) {
            logger.error('Failed to process refund', { error, paymentIntentId });
            throw new Error('Failed to process refund');
        }
    }

    // ========================================
    // WEBHOOKS
    // ========================================

    async constructEventFromPayload(payload: Buffer, signature: string) {
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
        } catch (error) {
            logger.error('Webhook signature verification failed', { error });
            throw new Error('Webhook signature verification failed');
        }
    }

    async handleWebhook(event: Stripe.Event) {
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                    break;
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
                    break;
                default:
                    logger.info('Unhandled webhook event', { eventType: event.type });
            }
        } catch (error) {
            logger.error('Webhook handling failed', { error, eventType: event.type });
            throw error;
        }
    }

    // ========================================
    // PRIVATE METHODS
    // ========================================

    private async getOrCreateStripeCustomer(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.stripeCustomerId) {
                return await this.stripe.customers.retrieve(user.stripeCustomerId);
            }

            // Create new Stripe customer
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
                metadata: {
                    userId,
                },
            });

            // Save customer ID to user
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customer.id },
            });

            return customer;
        } catch (error) {
            logger.error('Failed to get or create Stripe customer', { error, userId });
            throw new Error('Failed to setup customer');
        }
    }

    private mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): string {
        const statusMap: Record<string, string> = {
            'incomplete': 'PENDING',
            'incomplete_expired': 'EXPIRED',
            'trialing': 'ACTIVE',
            'active': 'ACTIVE',
            'past_due': 'PAST_DUE',
            'canceled': 'CANCELLED',
            'unpaid': 'SUSPENDED',
        };
        return statusMap[status] || 'PENDING';
    }

    // ========================================
    // WEBHOOK HANDLERS
    // ========================================

    private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
        const { userId, planId } = subscription.metadata || {};
        if (!userId || !planId) return;

        await prisma.customerSubscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: this.mapStripeSubscriptionStatus(subscription.status),
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        await prisma.customerSubscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: this.mapStripeSubscriptionStatus(subscription.status),
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            },
        });
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        await prisma.customerSubscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: 'CANCELLED' },
        });
    }

    private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
        if (invoice.subscription) {
            // This is a subscription payment
            const subscription = await prisma.customerSubscription.findFirst({
                where: { stripeSubscriptionId: invoice.subscription as string },
            });

            if (subscription) {
                // Record successful payment
                await prisma.subscriptionTransaction.create({
                    data: {
                        subscriptionId: subscription.id,
                        amount: invoice.amount_paid / 100, // Convert from cents
                        currency: invoice.currency.toUpperCase(),
                        type: 'SUBSCRIPTION_PAYMENT',
                        status: 'COMPLETED',
                        transactionId: invoice.id,
                        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : undefined,
                        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
                    },
                });

                // Update subscription billing dates
                await prisma.customerSubscription.update({
                    where: { id: subscription.id },
                    data: {
                        lastBilledAt: new Date(),
                        nextBillingDate: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
                    },
                });
            }
        }
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        if (invoice.subscription) {
            const subscription = await prisma.customerSubscription.findFirst({
                where: { stripeSubscriptionId: invoice.subscription as string },
            });

            if (subscription) {
                await prisma.subscriptionTransaction.create({
                    data: {
                        subscriptionId: subscription.id,
                        amount: invoice.amount_due / 100,
                        currency: invoice.currency.toUpperCase(),
                        type: 'SUBSCRIPTION_PAYMENT',
                        status: 'FAILED',
                        failureReason: invoice.last_payment_error?.message,
                    },
                });
            }
        }
    }

    private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
        // Handle one-time payments or other payment intents
        logger.info('Payment intent succeeded', { paymentIntentId: paymentIntent.id });
    }

    private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
        logger.error('Payment intent failed', {
            paymentIntentId: paymentIntent.id,
            lastError: paymentIntent.last_payment_error,
        });
    }
}

// Export singleton instance
export const stripeService = new StripeService();
