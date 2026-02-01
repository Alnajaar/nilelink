/**
 * NileLink Demand Predictor
 * 
 * On-device ML engine for inventory forecasting:
 * - Time-series analysis of sales data
 * - Seasonal trend detection
 * - Automated reorder point calculation
 * - Stock-out risk assessment
 */

import { LocalLedger } from '../storage/LocalLedger';
import { EconomicEvent } from '../events/types';
import { EventType } from '../events/types';

export interface PredictionResult {
    productId: string;
    expectedDemand: number; // Units per week
    confidence: number; // 0.0 - 1.0
    reorderLevel: number;
    trend: 'rising' | 'stable' | 'falling';
}

export class DemandPredictor {
    private ledger: LocalLedger;
    private readonly WINDOW_DAYS = 30;
    private readonly CONFIDENCE_THRESHOLD = 0.7;

    constructor(ledger: LocalLedger) {
        this.ledger = ledger;
    }

    /**
     * Predict demand for a specific product
     */
    async predictDemand(productId: string): Promise<PredictionResult> {
        const events = await this.ledger.getAllEvents();
        const salesEvents = events.filter(e =>
            (e.type === EventType.ITEM_SCANNED && e.payload.productId === productId && e.payload.status === 'scanned')
        );

        if (salesEvents.length < 5) {
            return {
                productId,
                expectedDemand: 0,
                confidence: 0.1,
                reorderLevel: 10,
                trend: 'stable'
            };
        }

        // Simplified Linear Regression / Trend Analysis
        const weeklyDemand = this.calculateWeeklyAverage(salesEvents);
        const trend = this.calculateTrend(salesEvents);

        return {
            productId,
            expectedDemand: Math.ceil(weeklyDemand),
            confidence: Math.min(0.9, 0.2 + (salesEvents.length / 100)),
            reorderLevel: Math.ceil(weeklyDemand * 1.5), // 50% safety stock
            trend
        };
    }

    /**
     * Calculate moving average of sales
     */
    private calculateWeeklyAverage(events: EconomicEvent[]): number {
        const now = Date.now();
        const windowStart = now - (this.WINDOW_DAYS * 24 * 60 * 60 * 1000);
        const recentEvents = events.filter(e => e.timestamp > windowStart);

        const totalSales = recentEvents.length;
        return (totalSales / this.WINDOW_DAYS) * 7;
    }

    /**
     * Determine if demand is rising or falling
     */
    private calculateTrend(events: EconomicEvent[]): 'rising' | 'stable' | 'falling' {
        const midPoint = Date.now() - (15 * 24 * 60 * 60 * 1000);
        const firstHalf = events.filter(e => e.timestamp < midPoint).length;
        const secondHalf = events.filter(e => e.timestamp >= midPoint).length;

        const ratio = secondHalf / (firstHalf || 1);
        if (ratio > 1.2) return 'rising';
        if (ratio < 0.8) return 'falling';
        return 'stable';
    }

    /**
     * Get stock-out risks for the whole inventory
     */
    async getStockRisks(inventory: any[]): Promise<string[]> {
        const risks: string[] = [];
        for (const item of inventory) {
            const prediction = await this.predictDemand(item.id);
            if (item.stock < prediction.reorderLevel) {
                risks.push(`${item.name} is below reorder level (${item.stock} < ${prediction.reorderLevel})`);
            }
        }
        return risks;
    }
}
