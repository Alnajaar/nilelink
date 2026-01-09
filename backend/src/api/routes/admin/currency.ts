import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { auditMiddleware } from '../../middleware/audit';

const router = Router();

// Validation schemas
const updateRateSchema = z.object({
    currency: z.string().length(3, 'Currency must be 3 characters'),
    rate: z.number().positive('Rate must be positive'),
    source: z.string().optional(),
});

const bulkUpdateRatesSchema = z.object({
    rates: z.array(updateRateSchema),
});

const getRatesSchema = z.object({
    baseCurrency: z.string().length(3).optional().default('USD'),
    date: z.string().optional(), // ISO date string
});

// Supported currencies for NileLink
const SUPPORTED_CURRENCIES = [
    'AED', 'SAR', 'EGP', 'KES', 'NGN', 'ZAR', 'EUR', 'GBP', 'USD'
];

/**
 * GET /api/admin/currency/rates
 * Get current exchange rates
 */
router.get('/rates', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const { baseCurrency = 'USD', date } = getRatesSchema.parse(req.query);

        // Get rates for the specified date or latest
        const where: any = {
            isActive: true
        };

        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            where.createdAt = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        const rates = await prisma.currencyRate.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        // Group by currency and get latest rate for each
        const latestRates = new Map<string, any>();
        rates.forEach(rate => {
            if (!latestRates.has(rate.currency) ||
                latestRates.get(rate.currency).createdAt < rate.createdAt) {
                latestRates.set(rate.currency, rate);
            }
        });

        const rateMap = Object.fromEntries(
            Array.from(latestRates.entries()).map(([currency, rate]) => [
                currency,
                {
                    rate: rate.rate,
                    lastUpdated: rate.createdAt,
                    source: rate.source
                }
            ])
        );

        res.json({
            success: true,
            data: {
                baseCurrency,
                rates: rateMap,
                supportedCurrencies: SUPPORTED_CURRENCIES,
                lastUpdated: rates.length > 0 ? rates[0].createdAt : null
            }
        });

        if (date) {
            logger.info(`Admin ${userId} retrieved currency rates for ${date}`);
        } else {
            logger.info(`Admin ${userId} retrieved current currency rates`);
        }
    } catch (error) {
        logger.error('Get currency rates error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/currency/rates
 * Update exchange rates (Admin only)
 */
router.put('/rates', auditMiddleware('CURRENCY_RATE', { 'PUT': 'RATE_UPDATE' }), async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const { rates } = bulkUpdateRatesSchema.parse(req.body);

        if (!rates || rates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one rate must be provided'
            });
        }

        // Validate currencies are supported
        const invalidCurrencies = rates
            .map(r => r.currency)
            .filter(currency => !SUPPORTED_CURRENCIES.includes(currency));

        if (invalidCurrencies.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Unsupported currencies: ${invalidCurrencies.join(', ')}`
            });
        }

        // Create new rate entries
        const rateEntries = rates.map(rateData => ({
            currency: rateData.currency,
            rate: rateData.rate,
            source: rateData.source || 'ADMIN_MANUAL',
            isActive: true
        }));

        const createdRates = await prisma.currencyRate.createMany({
            data: rateEntries,
            skipDuplicates: false
        });

        res.json({
            success: true,
            message: `Successfully updated ${createdRates.count} currency rates`,
            data: {
                updatedRates: rates.length,
                rates: rateEntries
            }
        });

        logger.info(`Admin ${adminUserId} updated ${createdRates.count} currency rates`);

        // TODO: Trigger cache invalidation for currency rates across all apps
        // This would notify all frontend apps to refresh their cached rates

    } catch (error) {
        logger.error('Update currency rates error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/admin/currency/rates/:currency
 * Update single currency rate (Admin only)
 */
router.put('/rates/:currency', async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        const currency = req.params.currency.toUpperCase();

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        if (!SUPPORTED_CURRENCIES.includes(currency)) {
            return res.status(400).json({
                success: false,
                error: `Unsupported currency: ${currency}`
            });
        }

        const { rate, source } = updateRateSchema.parse(req.body);

        // Create new rate entry
        const newRate = await prisma.currencyRate.create({
            data: {
                currency,
                rate,
                source: source || 'ADMIN_MANUAL',
                isActive: true
            }
        });

        res.json({
            success: true,
            message: `Successfully updated ${currency} rate`,
            data: {
                currency: newRate.currency,
                rate: newRate.rate,
                lastUpdated: newRate.createdAt,
                source: newRate.source
            }
        });

        logger.info(`Admin ${adminUserId} updated ${currency} rate to ${rate}`);

        // TODO: Broadcast rate change to all connected clients via WebSocket
        // This would immediately update all apps using real-time rates

    } catch (error) {
        logger.error('Update single currency rate error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/currency/history
 * Get historical rate data for analytics
 */
router.get('/history', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const { currency, days = 30 } = req.query;
        const limit = Math.min(parseInt(days as string) || 30, 365); // Max 1 year

        const where: any = {
            isActive: true
        };

        if (currency) {
            where.currency = (currency as string).toUpperCase();
        }

        const rates = await prisma.currencyRate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit * SUPPORTED_CURRENCIES.length // Rough estimate
        });

        // Group by currency and date
        const historicalData: Record<string, Array<{ date: string; rate: number; source: string }>> = {};

        rates.forEach(rate => {
            if (!historicalData[rate.currency]) {
                historicalData[rate.currency] = [];
            }

            // Only include one rate per day per currency (latest)
            const dateKey = rate.createdAt.toISOString().split('T')[0];
            const existingEntry = historicalData[rate.currency].find(entry => entry.date === dateKey);

            if (!existingEntry || new Date(existingEntry.date) < rate.createdAt) {
                historicalData[rate.currency] = historicalData[rate.currency]
                    .filter(entry => entry.date !== dateKey)
                    .concat({
                        date: dateKey,
                        rate: rate.rate,
                        source: rate.source || 'UNKNOWN'
                    });
            }
        });

        res.json({
            success: true,
            data: {
                history: historicalData,
                currencies: Object.keys(historicalData),
                period: `${limit} days`
            }
        });

        logger.info(`Admin ${userId} retrieved currency history for ${limit} days`);
    } catch (error) {
        logger.error('Get currency history error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/admin/currency/sync
 * Trigger manual sync with external rate providers
 */
router.post('/sync', async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        // TODO: Implement external API integration for rate syncing
        // For now, this is a placeholder that would integrate with:
        // - Fixer.io, CurrencyAPI, or other rate providers
        // - Central Bank APIs for local currencies

        // Simulate sync process
        const syncedCurrencies = ['EUR', 'GBP', 'AED', 'SAR', 'EGP'];

        res.json({
            success: true,
            message: 'Currency rates sync initiated',
            data: {
                syncedCurrencies,
                status: 'INITIATED',
                estimatedCompletion: '30 seconds'
            }
        });

        logger.info(`Admin ${adminUserId} initiated manual currency rate sync`);

        // TODO: Implement actual sync logic
        // This should run async and update rates in background

    } catch (error) {
        logger.error('Sync currency rates error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
