import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/authenticate';
import { multiCurrencyService } from '../../services/MultiCurrencyService';
import { complianceBridge } from '../../services/ComplianceBridge';
import { DomainEvent } from '../../models/Event';
import { EventStore } from '../../services/EventStore';

const router = Router();
const eventStore = new EventStore(prisma);


// Validation schemas
const settlementRequestSchema = z.object({
    restaurantId: z.string(),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    currency: z.string().default('USD'),
    countryCode: z.string().optional(), // e.g. 'AE' for UAE, 'SA' for KSA
    trigger: z.enum(['MANUAL', 'AUTOMATIC', 'SCHEDULED']).default('MANUAL')
});

const disputeSettlementSchema = z.object({
    settlementId: z.string(),
    reason: z.string().min(10).max(1000),
    evidence: z.array(z.string()).optional(), // URLs or file references
    requestedAmount: z.number().positive().optional()
});

// Settlement calculation logic
async function calculateSettlement(restaurantId: string, startDate: Date, endDate: Date, targetCurrency: string = 'USD', countryCode?: string): Promise<{
    grossRevenue: number;
    platformFee: number;
    deliveryFees: number;
    refunds: number;
    adjustments: number;
    regionalTax: number;
    netSettlement: number;
    orderCount: number;
    currency: string;
    breakdown: any;
}> {
    // Get all delivered orders in the period
    const orders = await prisma.order.findMany({
        where: {
            restaurantId,
            status: 'DELIVERED',
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    let grossRevenue = 0;
    let orderCount = orders.length;

    // Calculate gross revenue
    for (const order of orders) {
        grossRevenue += Number(order.totalAmount);
    }

    // Get refunds for the period (simplified - using system config as temporary storage)
    let refunds = 0;
    try {
        const refundRecords = await prisma.systemConfig.findMany({
            where: {
                key: { startsWith: 'order_refund_' }
            }
        });

        for (const record of refundRecords) {
            const refundData = JSON.parse(record.value as string);
            if (refundData.restaurantId === restaurantId &&
                new Date(refundData.createdAt) >= startDate &&
                new Date(refundData.createdAt) <= endDate) {
                refunds += Number(refundData.amount || 0);
            }
        }
    } catch (error) {
        logger.warn('Could not calculate refunds', { restaurantId, error });
    }

    // Get delivery fees (simplified calculation based on order volume)
    const deliveryFees = orderCount * 2.50; // $2.50 per order average delivery fee

    // Get adjustments from system config (temporary until proper adjustment table)
    let adjustments = 0;
    try {
        const adjustmentRecords = await prisma.systemConfig.findMany({
            where: {
                key: { startsWith: `restaurant_adjustment_${restaurantId}_` }
            }
        });

        for (const record of adjustmentRecords) {
            const adjustmentData = JSON.parse(record.value as string);
            if (adjustmentData.status === 'APPROVED') {
                adjustments += Number(adjustmentData.amount || 0);
            }
        }
    } catch (error) {
        logger.warn('Could not calculate adjustments', { restaurantId, error });
    }

    // Platform fee calculation (configurable via system config)
    let platformFeeRate = 0.1; // Default 10%
    try {
        const feeConfig = await prisma.systemConfig.findUnique({
            where: { key: `platform_fee_rate_${restaurantId}` }
        });
        if (feeConfig) {
            platformFeeRate = Number(JSON.parse(feeConfig.value as string));
        }
    } catch (error) {
        logger.warn('Could not get custom platform fee rate, using default', { restaurantId, error });
    }

    const platformFee = (grossRevenue - refunds) * platformFeeRate;

    // NET in USD (base protocol currency)
    const baseNetUSD = (grossRevenue - refunds - platformFee - deliveryFees) + adjustments;

    // Convert to target Arab currency if needed
    const netSettlement = multiCurrencyService.convert(baseNetUSD, 'USD', targetCurrency);

    // Calculate regional tax (VAT) based on converted net
    const regionalTax = countryCode ? complianceBridge.calculateRegionalTax(netSettlement, countryCode) : 0;
    const finalNetAfterTax = netSettlement - regionalTax;

    return {
        grossRevenue,
        platformFee,
        deliveryFees,
        refunds,
        adjustments,
        regionalTax,
        netSettlement: finalNetAfterTax,
        orderCount,
        currency: targetCurrency,
        breakdown: {
            orders: orderCount,
            baseNetUSD,
            regionalTax,
            exchangeRate: targetCurrency !== 'USD' ? multiCurrencyService.convert(1, 'USD', targetCurrency) : 1,
            averageOrderValue: orderCount > 0 ? grossRevenue / orderCount : 0,
            periodDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
            deliveryFeeBreakdown: {
                totalDeliveryFees: deliveryFees,
                averageDeliveryFee: orderCount > 0 ? deliveryFees / orderCount : 0
            },
            refundBreakdown: {
                totalRefunds: refunds,
                refundRate: orderCount > 0 ? (refunds / grossRevenue) * 100 : 0
            },
            adjustmentBreakdown: {
                totalAdjustments: adjustments
            }
        }
    };
}

// Automatic settlement trigger
async function triggerAutomaticSettlement(restaurantId: string, triggerReason: string = 'SCHEDULED'): Promise<void> {
    try {
        // Check if restaurant is eligible for settlement
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { tenant: true }
        });

        if (!restaurant || !restaurant.isActive) {
            return;
        }

        // Check minimum settlement thresholds
        const pendingOrders = await prisma.order.count({
            where: {
                restaurantId,
                status: 'DELIVERED',
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            }
        });

        if (pendingOrders < 10) { // Minimum 10 orders
            return;
        }

        // Calculate settlement period (last settlement to now, or last 30 days if no settlement)
        const lastSettlement = await prisma.settlement.findFirst({
            where: { restaurantId },
            orderBy: { periodEnd: 'desc' }
        });

        const periodStart = lastSettlement ? lastSettlement.periodEnd : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const periodEnd = new Date();

        // Create settlement
        await createSettlement(restaurantId, periodStart, periodEnd, triggerReason);

    } catch (error) {
        logger.error('Failed to trigger automatic settlement', { restaurantId, error });
    }
}

// Create settlement with full calculation
async function createSettlement(restaurantId: string, periodStart: Date, periodEnd: Date, currency: string = 'USD', countryCode?: string, trigger: string = 'MANUAL'): Promise<any> {
    const calculation = await calculateSettlement(restaurantId, periodStart, periodEnd, currency, countryCode);

    const settlement = await prisma.settlement.create({
        data: {
            restaurantId,
            periodStart,
            periodEnd,
            grossRevenue: calculation.grossRevenue,
            platformFee: calculation.platformFee,
            netSettlement: calculation.netSettlement,
            currency: calculation.currency,
            status: 'PENDING'
        }
    });

    // Emit settlement created event
    const event: DomainEvent = {
        id: `settlement-${settlement.id}`,
        eventType: 'SettlementCreated',
        aggregateId: restaurantId,
        aggregateType: 'Restaurant',
        eventData: {
            settlementId: settlement.id,
            restaurantId,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            netSettlement: calculation.netSettlement,
            orderCount: calculation.orderCount
        },
        version: 1,
        timestamp: new Date(),
        metadata: {
            trigger,
            userId: 'SYSTEM'
        }
    };

    await eventStore.saveEvents([event]);

    // Schedule notification
    await scheduleSettlementNotification(settlement);

    return settlement;
}

// Settlement notifications
async function scheduleSettlementNotification(settlement: any): Promise<void> {
    try {
        // Get restaurant contact info
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: settlement.restaurantId },
            include: { tenant: true }
        });

        if (!restaurant) {
            logger.warn('Restaurant not found for settlement notification', { settlementId: settlement.id });
            return;
        }

        // Create notification record
        const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const notification = {
            id: notificationId,
            settlementId: settlement.id,
            restaurantId: settlement.restaurantId,
            type: 'SETTLEMENT_READY',
            title: 'Settlement Ready for Review',
            message: `Your settlement for ${settlement.periodStart.toDateString()} - ${settlement.periodEnd.toDateString()} is ready. Net amount: ${settlement.netSettlement.toFixed(2)}`,
            data: {
                settlementId: settlement.id,
                periodStart: settlement.periodStart,
                periodEnd: settlement.periodEnd,
                netSettlement: settlement.netSettlement,
                currency: settlement.currency
            },
            status: 'PENDING',
            createdAt: new Date(),
            scheduledFor: new Date() // Immediate delivery
        };

        // Store notification (using system config temporarily)
        await prisma.systemConfig.upsert({
            where: { key: `notification_${notificationId}` },
            update: { value: JSON.stringify(notification) },
            create: {
                key: `notification_${notificationId}`,
                value: JSON.stringify(notification),
                description: 'Settlement notification record'
            }
        });

        // Send email notification if restaurant has email
        if (restaurant.email) {
            await sendSettlementEmail(restaurant, settlement, notification);
        }

        // Send push notification if restaurant has push tokens
        await sendSettlementPushNotification(restaurant, notification);

        // Emit notification event
        const event: DomainEvent = {
            id: notificationId,
            eventType: 'SettlementNotificationSent',
            aggregateId: settlement.restaurantId,
            aggregateType: 'Restaurant',
            eventData: {
                notificationId,
                settlementId: settlement.id,
                notificationType: 'SETTLEMENT_READY',
                deliveryMethods: ['email', 'push']
            },
            version: 1,
            timestamp: new Date(),
            metadata: {
                settlementId: settlement.id,
                restaurantId: settlement.restaurantId
            }
        };

        await eventStore.saveEvents([event]);

        logger.info('Settlement notification scheduled and sent', {
            settlementId: settlement.id,
            notificationId,
            restaurantId: settlement.restaurantId
        });

    } catch (error) {
        logger.error('Failed to schedule settlement notification', { settlementId: settlement.id, error });
    }
}

// Send settlement email notification
async function sendSettlementEmail(restaurant: any, settlement: any, notification: any): Promise<void> {
    try {
        // For now, log the email that would be sent
        // TODO: Integrate with actual email service
        const emailData = {
            to: restaurant.email,
            subject: 'Settlement Ready - NileLink',
            template: 'settlement-ready',
            data: {
                restaurantName: restaurant.name,
                settlementId: settlement.id,
                periodStart: settlement.periodStart.toLocaleDateString(),
                periodEnd: settlement.periodEnd.toLocaleDateString(),
                netSettlement: settlement.netSettlement.toFixed(2),
                currency: settlement.currency || 'USD',
                reviewUrl: `${process.env.FRONTEND_URL}/settlements/${settlement.id}`,
                supportEmail: 'support@nilelink.com'
            }
        };

        logger.info('Settlement email would be sent', {
            settlementId: settlement.id,
            restaurantId: restaurant.id,
            email: restaurant.email,
            emailData
        });

        // Mark notification as sent (simulated)
        notification.status = 'SENT';
        notification.sentAt = new Date();

        await prisma.systemConfig.update({
            where: { key: `notification_${notification.id}` },
            data: { value: JSON.stringify(notification) }
        });

    } catch (error) {
        logger.error('Failed to send settlement email', {
            settlementId: settlement.id,
            restaurantId: restaurant.id,
            error
        });
    }
}

// Send settlement push notification
async function sendSettlementPushNotification(restaurant: any, notification: any): Promise<void> {
    try {
        // Get push tokens for restaurant staff
        const pushTokens = await prisma.systemConfig.findMany({
            where: {
                key: { startsWith: `push_token_restaurant_${restaurant.id}_` }
            }
        });

        if (pushTokens.length === 0) {
            logger.info('No push tokens available for restaurant', { restaurantId: restaurant.id });
            return;
        }

        // For now, log the push notifications that would be sent
        // TODO: Integrate with actual push notification service
        for (const tokenRecord of pushTokens) {
            const tokenData = JSON.parse(tokenRecord.value as string);

            logger.info('Push notification would be sent', {
                settlementId: notification.data.settlementId,
                restaurantId: restaurant.id,
                token: tokenData.token,
                title: notification.title,
                body: notification.message
            });
        }

    } catch (error) {
        logger.error('Failed to send settlement push notification', {
            settlementId: notification.data.settlementId,
            restaurantId: restaurant.id,
            error
        });
    }
}

// GET /api/settlements - List settlements with filtering
router.get('/', authenticate, async (req, res) => {
    try {
        const {
            restaurantId,
            status,
            limit = '20',
            offset = '0',
            sortBy = 'periodEnd',
            sortOrder = 'desc'
        } = req.query;

        const where: any = {};
        if (restaurantId) where.restaurantId = restaurantId;
        if (status) where.status = status;

        const settlements = await prisma.settlement.findMany({
            where,
            include: {
                restaurant: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { distributions: true }
                }
            },
            orderBy: { [sortBy as string]: sortOrder },
            take: parseInt(limit as string),
            skip: parseInt(offset as string)
        });

        const total = await prisma.settlement.count({ where });

        res.json({
            success: true,
            data: {
                settlements,
                pagination: {
                    total,
                    limit: parseInt(limit as string),
                    offset: parseInt(offset as string),
                    hasMore: parseInt(offset as string) + parseInt(limit as string) < total
                }
            }
        });
    } catch (error) {
        logger.error('Failed to list settlements', { error });
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/settlements/:id - Get settlement details
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const settlement = await prisma.settlement.findUnique({
            where: { id },
            include: {
                restaurant: {
                    select: { id: true, name: true, email: true }
                },
                distributions: true
            }
        });

        if (!settlement) {
            return res.status(404).json({ success: false, error: 'Settlement not found' });
        }

        res.json({ success: true, data: { settlement } });
    } catch (error) {
        logger.error('Failed to get settlement', { settlementId: req.params.id, error });
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST /api/settlements/request - Create settlement request
router.post('/request', authenticate, async (req, res) => {
    try {
        const validatedData = settlementRequestSchema.parse(req.body);
        const { restaurantId, periodStart, periodEnd, trigger } = validatedData;

        // Default to last 30 days if no period specified
        const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = periodEnd ? new Date(periodEnd) : new Date();

        const settlement = await createSettlement(restaurantId, startDate, endDate, validatedData.currency, validatedData.countryCode, trigger);

        res.status(201).json({ success: true, data: { settlement } });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors
            });
        }

        logger.error('Settlement request failed', { error });
        res.status(500).json({ success: false, error: 'Settlement creation failed' });
    }
});

// POST /api/settlements/:id/dispute - Dispute a settlement
router.post('/:id/dispute', async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = disputeSettlementSchema.parse(req.body);

        // Verify settlement exists and is in disputable state
        const settlement = await prisma.settlement.findUnique({
            where: { id },
            include: {
                restaurant: {
                    select: { id: true, name: true, tenantId: true }
                }
            }
        });

        if (!settlement) {
            return res.status(404).json({ success: false, error: 'Settlement not found' });
        }

        if (!['PENDING', 'COMPLETED'].includes(settlement.status)) {
            return res.status(400).json({
                success: false,
                error: 'Settlement cannot be disputed in current status'
            });
        }

        // Create comprehensive dispute record
        const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const dispute = {
            id: disputeId,
            settlementId: id,
            restaurantId: settlement.restaurantId,
            tenantId: settlement.restaurant.tenantId,
            reason: validatedData.reason,
            evidence: validatedData.evidence || [],
            requestedAmount: validatedData.requestedAmount,
            originalAmount: settlement.netSettlement,
            status: 'OPEN',
            priority: determineDisputePriority(validatedData.reason),
            initiatedBy: 'RESTAURANT',
            assignedTo: null, // Will be assigned by admin
            resolution: null,
            resolvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Store dispute in system config (temporary - should be proper table)
        await prisma.systemConfig.upsert({
            where: { key: `settlement_dispute_${disputeId}` },
            update: { value: JSON.stringify(dispute) },
            create: {
                key: `settlement_dispute_${disputeId}`,
                value: JSON.stringify(dispute),
                description: 'Settlement dispute record'
            }
        });

        // Update settlement status to DISPUTED if possible
        // Note: This assumes DISPUTED status exists in SettlementStatus enum
        try {
            await prisma.settlement.update({
                where: { id },
                data: { status: 'DISPUTED' }
            });
        } catch (error) {
            logger.warn('Could not update settlement status to DISPUTED', { settlementId: id });
        }

        // Create dispute timeline entry
        const timelineEntry = {
            disputeId,
            action: 'DISPUTE_OPENED',
            description: `Dispute opened: ${validatedData.reason}`,
            performedBy: 'RESTAURANT',
            timestamp: new Date()
        };

        await prisma.systemConfig.upsert({
            where: { key: `dispute_timeline_${disputeId}_${Date.now()}` },
            update: { value: JSON.stringify(timelineEntry) },
            create: {
                key: `dispute_timeline_${disputeId}_${Date.now()}`,
                value: JSON.stringify(timelineEntry),
                description: 'Dispute timeline entry'
            }
        });

        logger.warn('Settlement dispute filed', {
            settlementId: id,
            disputeId,
            reason: validatedData.reason,
            requestedAmount: validatedData.requestedAmount
        });

        // Emit dispute event
        const event: DomainEvent = {
            id: disputeId,
            eventType: 'SettlementDisputed',
            aggregateId: settlement.restaurantId,
            aggregateType: 'Restaurant',
            eventData: {
                disputeId,
                settlementId: id,
                reason: validatedData.reason,
                requestedAmount: validatedData.requestedAmount,
                originalAmount: settlement.netSettlement
            },
            version: 1,
            timestamp: new Date(),
            metadata: {
                settlementId: id,
                disputeId,
                tenantId: settlement.restaurant.tenantId
            }
        };

        await eventStore.saveEvents([event]);

        // Notify admin/support team
        await notifyDisputeToAdmins(dispute, settlement);

        logger.info('Settlement dispute created and notifications sent', { disputeId, settlementId: id });

        res.json({ success: true, data: { dispute } });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors
            });
        }

        logger.error('Settlement dispute failed', { settlementId: req.params.id, error });
        res.status(500).json({ success: false, error: 'Dispute creation failed' });
    }
});

// Helper function to determine dispute priority
function determineDisputePriority(reason: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    const lowerReason = reason.toLowerCase();

    if (lowerReason.includes('payment not received') || lowerReason.includes('missing payment')) {
        return 'URGENT';
    }

    if (lowerReason.includes('incorrect calculation') || lowerReason.includes('wrong amount')) {
        return 'HIGH';
    }

    if (lowerReason.includes('timing') || lowerReason.includes('period')) {
        return 'MEDIUM';
    }

    return 'LOW';
}

// Notify dispute to admin/support team
async function notifyDisputeToAdmins(dispute: any, settlement: any): Promise<void> {
    try {
        // Find admin users for the tenant
        const adminUsers = await prisma.user.findMany({
            where: {
                tenantId: dispute.tenantId,
                role: { in: ['ADMIN', 'SUPER_ADMIN'] },
                isActive: true
            },
            select: { id: true, email: true, firstName: true, lastName: true }
        });

        // Create admin notifications
        for (const admin of adminUsers) {
            const notificationId = `admin_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const notification = {
                id: notificationId,
                disputeId: dispute.id,
                settlementId: dispute.settlementId,
                adminId: admin.id,
                type: 'SETTLEMENT_DISPUTE',
                title: 'New Settlement Dispute Requires Review',
                message: `Settlement ${settlement.id} has been disputed by restaurant. Reason: ${dispute.reason}`,
                data: {
                    disputeId: dispute.id,
                    settlementId: dispute.settlementId,
                    restaurantId: dispute.restaurantId,
                    reason: dispute.reason,
                    requestedAmount: dispute.requestedAmount,
                    originalAmount: dispute.originalAmount,
                    priority: dispute.priority
                },
                status: 'PENDING',
                createdAt: new Date()
            };

            // Store admin notification
            await prisma.systemConfig.upsert({
                where: { key: `admin_notification_${notificationId}` },
                update: { value: JSON.stringify(notification) },
                create: {
                    key: `admin_notification_${notificationId}`,
                    value: JSON.stringify(notification),
                    description: 'Admin dispute notification'
                }
            });

            // Log email that would be sent to admin
            logger.info('Admin dispute notification created', {
                disputeId: dispute.id,
                adminId: admin.id,
                adminEmail: admin.email,
                priority: dispute.priority
            });
        }

    } catch (error) {
        logger.error('Failed to notify admins of dispute', {
            disputeId: dispute.id,
            error
        });
    }
}

// POST /api/settlements/disputes/:disputeId/resolve - Resolve a dispute (Admin only)
router.post('/disputes/:disputeId/resolve', async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, adjustedAmount, notes } = req.body;

        // Get dispute
        const disputeRecord = await prisma.systemConfig.findUnique({
            where: { key: `settlement_dispute_${disputeId}` }
        });

        if (!disputeRecord) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }

        const dispute = JSON.parse(disputeRecord.value as string);

        if (dispute.status !== 'OPEN') {
            return res.status(400).json({ success: false, error: 'Dispute is not in open status' });
        }

        // Update dispute
        dispute.status = 'RESOLVED';
        dispute.resolution = resolution;
        dispute.adjustedAmount = adjustedAmount;
        dispute.resolvedAt = new Date();
        dispute.updatedAt = new Date();

        await prisma.systemConfig.update({
            where: { key: `settlement_dispute_${disputeId}` },
            data: { value: JSON.stringify(dispute) }
        });

        // Update settlement if amount was adjusted
        if (adjustedAmount !== undefined && adjustedAmount !== dispute.originalAmount) {
            await prisma.settlement.update({
                where: { id: dispute.settlementId },
                data: {
                    netSettlement: adjustedAmount,
                    status: 'COMPLETED'
                }
            });
        }

        // Add timeline entry
        const timelineEntry = {
            disputeId,
            action: 'DISPUTE_RESOLVED',
            description: `Dispute resolved: ${resolution}. ${notes || ''}`,
            performedBy: 'ADMIN',
            timestamp: new Date()
        };

        await prisma.systemConfig.upsert({
            where: { key: `dispute_timeline_${disputeId}_${Date.now()}` },
            update: { value: JSON.stringify(timelineEntry) },
            create: {
                key: `dispute_timeline_${disputeId}_${Date.now()}`,
                value: JSON.stringify(timelineEntry),
                description: 'Dispute resolution timeline entry'
            }
        });

        // Emit resolution event
        const event: DomainEvent = {
            id: `resolution_${disputeId}`,
            eventType: 'SettlementDisputeResolved',
            aggregateId: dispute.restaurantId,
            aggregateType: 'Restaurant',
            eventData: {
                disputeId,
                settlementId: dispute.settlementId,
                resolution,
                adjustedAmount,
                originalAmount: dispute.originalAmount
            },
            version: 1,
            timestamp: new Date(),
            metadata: {
                disputeId,
                settlementId: dispute.settlementId
            }
        };

        await eventStore.saveEvents([event]);

        // Notify restaurant of resolution
        await notifyDisputeResolution(dispute, resolution, adjustedAmount);

        logger.info('Settlement dispute resolved', {
            disputeId,
            settlementId: dispute.settlementId,
            resolution,
            adjustedAmount
        });

        res.json({ success: true, data: { dispute } });

    } catch (error) {
        logger.error('Dispute resolution failed', { disputeId: req.params.disputeId, error });
        res.status(500).json({ success: false, error: 'Resolution failed' });
    }
});

// Notify dispute resolution to restaurant
async function notifyDisputeResolution(dispute: any, resolution: string, adjustedAmount?: number): Promise<void> {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: dispute.restaurantId },
            select: { id: true, name: true, email: true }
        });

        if (!restaurant) return;

        logger.info('Dispute resolution notification would be sent', {
            disputeId: dispute.id,
            restaurantId: dispute.restaurantId,
            resolution,
            adjustedAmount
        });

        // TODO: Send actual email/SMS notification to restaurant

    } catch (error) {
        logger.error('Failed to notify dispute resolution', {
            disputeId: dispute.id,
            error
        });
    }
}

// GET /api/settlements/disputes - List disputes (Admin only)
router.get('/disputes', async (req, res) => {
    try {
        const {
            status,
            priority,
            restaurantId,
            limit = '20',
            offset = '0'
        } = req.query;

        // Get all dispute records
        const disputeRecords = await prisma.systemConfig.findMany({
            where: {
                key: { startsWith: 'settlement_dispute_' }
            },
            take: parseInt(limit as string) * 2, // Get more to filter
            skip: 0
        });

        let disputes = disputeRecords.map(record => JSON.parse(record.value as string));

        // Apply filters
        if (status) {
            disputes = disputes.filter(d => d.status === status);
        }
        if (priority) {
            disputes = disputes.filter(d => d.priority === priority);
        }
        if (restaurantId) {
            disputes = disputes.filter(d => d.restaurantId === restaurantId);
        }

        // Apply pagination
        const startIndex = parseInt(offset as string);
        const endIndex = startIndex + parseInt(limit as string);
        const paginatedDisputes = disputes.slice(startIndex, endIndex);

        // Add restaurant info
        const disputesWithRestaurant = await Promise.all(
            paginatedDisputes.map(async (dispute) => {
                const restaurant = await prisma.restaurant.findUnique({
                    where: { id: dispute.restaurantId },
                    select: { id: true, name: true }
                });
                return {
                    ...dispute,
                    restaurant: restaurant || { id: dispute.restaurantId, name: 'Unknown' }
                };
            })
        );

        res.json({
            success: true,
            data: {
                disputes: disputesWithRestaurant,
                pagination: {
                    total: disputes.length,
                    limit: parseInt(limit as string),
                    offset: parseInt(offset as string),
                    hasMore: endIndex < disputes.length
                }
            }
        });

    } catch (error) {
        logger.error('Failed to list disputes', { error });
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET /api/settlements/report - Settlement reporting
router.get('/report/summary', async (req, res) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        const where: any = {};
        if (restaurantId) where.restaurantId = restaurantId;
        if (startDate && endDate) {
            where.periodStart = { gte: new Date(startDate as string) };
            where.periodEnd = { lte: new Date(endDate as string) };
        }

        const settlements = await prisma.settlement.findMany({
            where,
            include: {
                restaurant: {
                    select: { name: true }
                }
            }
        });

        // Calculate summary statistics
        const summary = {
            totalSettlements: settlements.length,
            totalGrossRevenue: settlements.reduce((sum, s) => sum + Number(s.grossRevenue), 0),
            totalPlatformFees: settlements.reduce((sum, s) => sum + Number(s.platformFee), 0),
            totalNetSettlement: settlements.reduce((sum, s) => sum + Number(s.netSettlement), 0),
            settlementsByStatus: settlements.reduce((acc, s) => {
                acc[s.status] = (acc[s.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            averageSettlementAmount: settlements.length > 0
                ? settlements.reduce((sum, s) => sum + Number(s.netSettlement), 0) / settlements.length
                : 0
        };

        res.json({ success: true, data: { summary, settlements } });

    } catch (error) {
        logger.error('Settlement report failed', { error });
        res.status(500).json({ success: false, error: 'Report generation failed' });
    }
});

// POST /api/settlements/bridge/trigger - Simulate autonomous bridge payout
router.post('/bridge/trigger', authenticate, async (req, res) => {
    try {
        const { orderId } = req.body;

        // Fetch order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                restaurant: true,
                delivery: { include: { driver: true } }
            }
        });

        if (!order || order.status !== 'DELIVERED') {
            return res.status(400).json({ success: false, error: 'Order not found or not delivered' });
        }

        const amount = Number(order.totalAmount);

        // Distribution Logic (Simulated)
        // 70% Restaurant, 15% Platform, 10% Driver, 5% Supplier fund
        const distributions = [
            { recipient: order.restaurant.walletAddress || '0xrestaurant_vault', amount: (amount * 0.7).toString(), type: 'RESTAURANT' },
            { recipient: '0xplatform_treasury', amount: (amount * 0.15).toString(), type: 'PLATFORM' },
            { recipient: order.delivery?.driver?.walletAddress || '0xdriver_wallet', amount: (amount * 0.1).toString(), type: 'DRIVER' },
            { recipient: '0xsupplier_escrow', amount: (amount * 0.05).toString(), type: 'SUPPLIER' }
        ];

        const txs = [];
        for (const dist of distributions) {
            const tx = await prisma.crossChainTx.create({
                data: {
                    sourceChain: 'nilelink-mainnet',
                    targetChain: 'polygon-pos',
                    sourceTxHash: `0x${Math.random().toString(36).substr(2, 32)}`,
                    status: 'COMPLETED',
                    amount: dist.amount,
                    sender: '0xnilelink_bridge',
                    receiver: dist.recipient,
                    bridgeProvider: 'layerzero-v2',
                    metadata: { type: dist.type, orderId }
                }
            });
            txs.push(tx);
        }

        res.json({ success: true, message: 'Autonomous bridge payouts executed', data: txs });
    } catch (error) {
        logger.error('Bridge payout failed', { error });
        res.status(500).json({ success: false, error: 'Bridge execution failed' });
    }
});

export default router;
