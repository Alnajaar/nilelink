import QRCode from 'qrcode';
import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';

export class QRService {
    private static readonly BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

    /**
     * Generate a unique QR code for a menu
     */
    static async generateQRCode(menuId: string, options: {
        expiresAt?: Date;
        tableNumber?: string;
        branchId?: string;
        menuVersionId?: string;
    } = {}): Promise<{ code: string; url: string; qrDataUrl: string }> {
        try {
            // Generate unique code
            const code = this.generateUniqueCode();

            // Create full URL
            const url = `${this.BASE_URL}/menu/${code}`;

            // Generate QR code as data URL
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#0A2540', // Primary color
                    light: '#FFFFFF'
                }
            });

            // Save to database
            await prisma.qRCode.create({
                data: {
                    menuId,
                    menuVersionId: options.menuVersionId,
                    code,
                    url,
                    expiresAt: options.expiresAt,
                    tableNumber: options.tableNumber,
                    branchId: options.branchId
                }
            });

            return { code, url, qrDataUrl };
        } catch (error) {
            logger.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Validate and get QR code details
     */
    static async validateQRCode(code: string): Promise<any> {
        try {
            const qr = await prisma.qRCode.findUnique({
                where: { code },
                include: {
                    menu: {
                        include: {
                            versions: {
                                where: { isActive: true },
                                include: {
                                    items: {
                                        include: {
                                            menuItem: {
                                                include: {
                                                    category: true,
                                                    dynamicPricingRules: true
                                                }
                                            }
                                        },
                                        orderBy: { displayOrder: 'asc' }
                                    },
                                    availabilities: true
                                },
                                orderBy: { version: 'desc' },
                                take: 1
                            }
                        }
                    }
                }
            });

            if (!qr || !qr.isActive) {
                return null;
            }

            // Check expiration
            if (qr.expiresAt && qr.expiresAt < new Date()) {
                return null;
            }

            return qr;
        } catch (error) {
            logger.error('Error validating QR code:', error);
            return null;
        }
    }

    /**
     * Update QR code scan count
     */
    static async recordScan(code: string, metadata: {
        userAgent?: string;
        ipAddress?: string;
        language?: string;
        currency?: string;
    } = {}): Promise<void> {
        try {
            const qr = await prisma.qRCode.findUnique({ where: { code } });
            if (!qr) return;

            await prisma.qRCode.update({
                where: { id: qr.id },
                data: {
                    scanCount: { increment: 1 },
                    lastScannedAt: new Date()
                }
            });

            // Record analytics
            await prisma.menuAnalytics.create({
                data: {
                    qrCodeId: qr.id,
                    eventType: 'VIEW',
                    userAgent: metadata.userAgent,
                    ipAddress: metadata.ipAddress,
                    language: metadata.language,
                    currency: metadata.currency
                }
            });
        } catch (error) {
            logger.error('Error recording QR scan:', error);
        }
    }

    /**
     * Regenerate QR code (for updates)
     */
    static async regenerateQRCode(menuId: string, oldCode: string): Promise<{ code: string; url: string; qrDataUrl: string }> {
        try {
            // Deactivate old QR code
            await prisma.qRCode.updateMany({
                where: { menuId, code: oldCode },
                data: { isActive: false }
            });

            // Generate new one
            return await this.generateQRCode(menuId);
        } catch (error) {
            logger.error('Error regenerating QR code:', error);
            throw new Error('Failed to regenerate QR code');
        }
    }

    /**
     * Generate unique code
     */
    private static generateUniqueCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 12; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Get QR analytics
     */
    static async getQRAnalytics(qrCodeId: string, dateRange?: { start: Date; end: Date }) {
        try {
            const where: any = { qrCodeId };
            if (dateRange) {
                where.timestamp = {
                    gte: dateRange.start,
                    lte: dateRange.end
                };
            }

            const analytics = await prisma.menuAnalytics.findMany({
                where,
                orderBy: { timestamp: 'desc' }
            });

            const stats = {
                totalViews: analytics.filter(a => a.eventType === 'VIEW').length,
                totalOrders: analytics.filter(a => a.eventType === 'ORDER_START').length,
                conversionRate: 0,
                popularLanguages: {} as Record<string, number>,
                popularCurrencies: {} as Record<string, number>
            };

            if (stats.totalViews > 0) {
                stats.conversionRate = (stats.totalOrders / stats.totalViews) * 100;
            }

            analytics.forEach(a => {
                if (a.language) {
                    stats.popularLanguages[a.language] = (stats.popularLanguages[a.language] || 0) + 1;
                }
                if (a.currency) {
                    stats.popularCurrencies[a.currency] = (stats.popularCurrencies[a.currency] || 0) + 1;
                }
            });

            return { analytics, stats };
        } catch (error) {
            logger.error('Error getting QR analytics:', error);
            throw new Error('Failed to get analytics');
        }
    }
}
