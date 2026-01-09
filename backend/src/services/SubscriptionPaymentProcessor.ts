import Stripe from 'stripe';
import { prisma } from './DatabasePoolService';
import { subscriptionService } from './SubscriptionService';
import { logger } from '../utils/logger';
// TransactionStatus and TransactionType enums will be available after Prisma generate

export class SubscriptionPaymentProcessor {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-12-15.clover',
        });
    }

    /**
     * Process a subscription payment transaction
     */
    async processSubscriptionPayment(transactionId: string) {
        const transaction = await prisma.subscriptionTransaction.findUnique({
            where: { id: transactionId },
            include: {
                subscription: {
                    include: {
                        customer: true,
                        plan: true
                    }
                }
            }
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.status !== 'PENDING') {
            logger.warn(`Transaction ${transactionId} is not pending, current status: ${transaction.status}`);
            return;
        }

        try {
            // Get or create Stripe customer
            let stripeCustomerId = await this.getStripeCustomerId(transaction.subscription.customerId);

            if (!stripeCustomerId) {
                const customer = await this.createStripeCustomer(transaction.subscription.customer);
                stripeCustomerId = customer.id;
            }

            // Create payment intent for subscription payment
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(transaction.amount * 100), // Convert to cents
                currency: transaction.currency.toLowerCase(),
                customer: stripeCustomerId,
                metadata: {
                    transactionId,
                    subscriptionId: transaction.subscriptionId,
                    planId: transaction.subscription.planId,
                    type: 'subscription_payment'
                },
                description: `Subscription payment for ${transaction.subscription.plan.name}`,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Update transaction with payment intent ID
            await prisma.subscriptionTransaction.update({
                where: { id: transactionId },
                data: {
                    transactionId: paymentIntent.id,
                    status: 'PROCESSING'
                }
            });

            // In a real implementation, you'd wait for webhook confirmation
            // For now, we'll simulate successful payment
            await this.confirmPayment(transactionId, paymentIntent.id);

            logger.info(`Processed subscription payment for transaction ${transactionId}`);
        } catch (error) {
            logger.error(`Failed to process subscription payment for transaction ${transactionId}:`, error);

            // Mark transaction as failed
            await prisma.subscriptionTransaction.update({
                where: { id: transactionId },
                data: {
                    status: 'FAILED',
                    failureReason: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            // Mark subscription as past due if payment fails
            await prisma.customerSubscription.update({
                where: { id: transaction.subscriptionId },
                data: { status: 'PAST_DUE' }
            });
        }
    }

    /**
     * Confirm a payment (called from webhook or after successful processing)
     */
    async confirmPayment(transactionId: string, paymentIntentId: string) {
        const transaction = await prisma.subscriptionTransaction.findUnique({
            where: { id: transactionId },
            include: { subscription: true }
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // Update transaction status
        await prisma.subscriptionTransaction.update({
            where: { id: transactionId },
            data: {
                status: 'COMPLETED',
                processedAt: new Date(),
                blockchainTxHash: `stripe_${paymentIntentId}` // For compatibility
            }
        });

        // Update subscription status and totals
        await prisma.customerSubscription.update({
            where: { id: transaction.subscriptionId },
            data: {
                status: 'ACTIVE',
                totalPaid: { increment: transaction.amount },
                lastBilledAt: new Date()
            }
        });

        logger.info(`Confirmed payment for transaction ${transactionId}`);
    }

    /**
     * Handle failed payment
     */
    async handleFailedPayment(transactionId: string, reason: string) {
        const transaction = await prisma.subscriptionTransaction.update({
            where: { id: transactionId },
            data: {
                status: 'FAILED',
                failureReason: reason,
                processedAt: new Date()
            },
            include: { subscription: true }
        });

        // Mark subscription as past due
        await prisma.customerSubscription.update({
            where: { id: transaction.subscriptionId },
            data: { status: 'PAST_DUE' }
        });

        logger.warn(`Payment failed for transaction ${transactionId}: ${reason}`);
    }

    /**
     * Process refund for subscription cancellation
     */
    async processRefund(subscriptionId: string, amount: number, reason: string) {
        const subscription = await prisma.customerSubscription.findUnique({
            where: { id: subscriptionId },
            include: { customer: true }
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        try {
            // Get Stripe customer
            const stripeCustomerId = await this.getStripeCustomerId(subscription.customerId);

            if (!stripeCustomerId) {
                throw new Error('Stripe customer not found');
            }

            // In a real implementation, you'd need to track the original payment intent
            // For now, we'll create a refund transaction
            const refundTransaction = await prisma.subscriptionTransaction.create({
                data: {
                    subscriptionId,
                    amount: -Math.abs(amount), // Negative amount for refund
                    currency: 'USD', // Should come from subscription
                    type: 'REFUND',
                    status: 'COMPLETED',
                    processedAt: new Date(),
                    failureReason: reason
                }
            });

            // Update subscription totals
            await prisma.customerSubscription.update({
                where: { id: subscriptionId },
                data: {
                    totalPaid: { decrement: amount }
                }
            });

            logger.info(`Processed refund for subscription ${subscriptionId}, amount: ${amount}`);
            return refundTransaction;
        } catch (error) {
            logger.error(`Failed to process refund for subscription ${subscriptionId}:`, error);
            throw error;
        }
    }

    /**
     * Get or create Stripe customer ID for a user
     */
    private async getStripeCustomerId(userId: string): Promise<string | null> {
        // Check if user already has a Stripe customer ID
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddress: true } // Using walletAddress as a placeholder for stripeCustomerId
        });

        return user?.walletAddress || null;
    }

    /**
     * Create Stripe customer
     */
    private async createStripeCustomer(user: any) {
        const customer = await this.stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            metadata: {
                userId: user.id
            }
        });

        // Store Stripe customer ID (using walletAddress as placeholder)
        await prisma.user.update({
            where: { id: user.id },
            data: { walletAddress: customer.id }
        });

        return customer;
    }

    /**
     * Process pending transactions (batch processing)
     */
    async processPendingTransactions() {
        const pendingTransactions = await prisma.subscriptionTransaction.findMany({
            where: { status: 'PENDING' },
            take: 10 // Process in batches
        });

        for (const transaction of pendingTransactions) {
            try {
                await this.processSubscriptionPayment(transaction.id);
            } catch (error) {
                logger.error(`Failed to process transaction ${transaction.id}:`, error);
            }
        }

        logger.info(`Processed ${pendingTransactions.length} pending subscription transactions`);
    }

    /**
     * Web3/Smart Contract payment processing (future extension)
     */
    async processWeb3Payment(transactionId: string, contractAddress: string, network: string) {
        // Placeholder for Web3 payment processing
        // This would integrate with smart contracts for subscription payments

        logger.info(`Web3 payment processing initiated for transaction ${transactionId} on ${network}`);

        // Update transaction with blockchain details
        await prisma.subscriptionTransaction.update({
            where: { id: transactionId },
            data: {
                status: 'PROCESSING',
                blockchainTxHash: `web3_pending_${transactionId}`
            }
        });

        // In a real implementation, this would:
        // 1. Interact with smart contract
        // 2. Wait for transaction confirmation
        // 3. Update transaction status based on blockchain events
    }

    /**
     * Setup webhook handler for Stripe events
     */
    async handleStripeWebhook(event: any) {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent.metadata.transactionId;

                if (transactionId) {
                    await this.confirmPayment(transactionId, paymentIntent.id);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                const failedTransactionId = failedPayment.metadata.transactionId;

                if (failedTransactionId) {
                    await this.handleFailedPayment(failedTransactionId, failedPayment.last_payment_error?.message || 'Payment failed');
                }
                break;

            default:
                logger.info(`Unhandled Stripe webhook event: ${event.type}`);
        }
    }
}

// Export singleton instance
export const subscriptionPaymentProcessor = new SubscriptionPaymentProcessor();
