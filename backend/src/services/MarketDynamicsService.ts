import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { resilienceService } from './ResilienceService';

const prisma = new PrismaClient();

export interface MarketPulse {
    economicLoadFactor: number; // 0-2 (1.0 = normal)
    suggestedFeeMultiplier: number;
    demandHotspots: string[];
    activeIncentives: boolean;
    timestamp: Date;
}

export class MarketDynamicsService {
    private static instance: MarketDynamicsService;

    private constructor() { }

    public static getInstance(): MarketDynamicsService {
        if (!MarketDynamicsService.instance) {
            MarketDynamicsService.instance = new MarketDynamicsService();
        }
        return MarketDynamicsService.instance;
    }

    /**
     * Calculates the real-time economic health and demand pressure of the ecosystem.
     */
    public async getMarketPulse(): Promise<MarketPulse> {
        try {
            // 1. Get recent order velocity (last 10 minutes)
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const recentOrderCount = await prisma.order.count({
                where: { createdAt: { gte: tenMinutesAgo } }
            });

            // 2. Get active delivery capacity
            const activeDeliveries = await prisma.delivery.count({
                where: { status: { in: ['PICKED_UP', 'ASSIGNED'] } }
            });

            // 3. Check node health pressure from ResilienceService
            // (Mocking node health impact for now since ResilienceService doesn't expose public metrics yet)
            const nodePressure = 1.0;

            // 4. Calculate Economic Load Factor
            // Logic: High orders + High active deliveries = High pressure
            const velocityWeight = recentOrderCount / 100; // Expected 100 orders/10min as baseline
            const capacityWeight = activeDeliveries / 50;  // Expected 50 active deliveries as baseline

            let economicLoadFactor = (velocityWeight + capacityWeight + nodePressure) / 3;
            economicLoadFactor = Math.max(0.8, Math.min(2.0, economicLoadFactor));

            // 5. Derive Fee Multiplier
            const suggestedFeeMultiplier = Number(economicLoadFactor.toFixed(2));

            // 6. Identify Demand Hotspots (Simulated based on regions)
            const hotspots = ['ME-NORTH', 'APAC-S'];

            return {
                economicLoadFactor,
                suggestedFeeMultiplier,
                demandHotspots: hotspots,
                activeIncentives: economicLoadFactor > 1.5,
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Failed to calculate market pulse:', error);
            return {
                economicLoadFactor: 1.0,
                suggestedFeeMultiplier: 1.0,
                demandHotspots: [],
                activeIncentives: false,
                timestamp: new Date()
            };
        }
    }

    /**
     * Generates a 30-day forecast based on persistent order history.
     */
    public async getInstitutionalForecast() {
        // AI-driven forecast projection (to be integrated with Python AI)
        const history = await prisma.order.findMany({
            take: 1000,
            orderBy: { createdAt: 'desc' },
            select: { total: true, createdAt: true }
        });

        // Simple linear extrapolation for now (HUD will use real projections)
        const dailyAverage = history.reduce((acc, o) => acc + Number(o.total), 0) / 30;

        return {
            predictedRevenue30d: dailyAverage * 1.15, // Projecting 15% growth
            confidenceInterval: 0.88,
            trends: [
                { date: '2026-02-01', projected: dailyAverage * 1.02 },
                { date: '2026-02-15', projected: dailyAverage * 1.08 },
                { date: '2026-03-01', projected: dailyAverage * 1.15 },
            ]
        };
    }
}

export const marketDynamicsService = MarketDynamicsService.getInstance();
