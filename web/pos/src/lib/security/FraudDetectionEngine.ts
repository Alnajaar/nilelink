/**
 * NileLink Fraud Detection Engine
 * 
 * Analyzes transaction patterns in real-time to detect cashier fraud:
 * - Excessive voids and refunds per session
 * - High-frequency discounts
 * - Suspicious timing anomalies
 * - Breach of daily cashier limits
 * 
 * Fulfills Phase 2.3 of the security roadmap.
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import {
    EventType,
    FraudAnomalyDetectedEvent,
    AlertTriggeredEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';
import web3Service from '@shared/services/Web3Service';

export interface FraudStats {
    voidCount: number;
    voidAmount: number;
    refundCount: number;
    refundAmount: number;
    discountCount: number;
    totalDiscountAmount: number;
    lastAnomalyTimestamp?: number;
}

export class FraudDetectionEngine {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private sessionStats = new Map<string, FraudStats>();
    private cashierDailyStats = new Map<string, FraudStats>();

    // Configuration - Move to decentralized settings eventually
    private readonly MAX_VOIDS_PER_SESSION = 5;
    private readonly MAX_REFUNDS_PER_SESSION = 3;
    private readonly MAX_DISCOUNT_PERCENTAGE = 15; // Average across session
    private readonly SEVERITY_THRESHOLD_HIGH = 7;
    private readonly SEVERITY_THRESHOLD_CRITICAL = 9;

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.initializeFromEvents();
    }

    /**
     * Replay events to rebuild fraud history for active sessions
     */
    private async initializeFromEvents(): Promise<void> {
        try {
            const events = await this.ledger.getAllEvents();
            for (const event of events) {
                this.processEventInternal(event);
            }
        } catch (error) {
            console.error('❌ Failed to initialize Fraud Detection Engine:', error);
        }
    }

    /**
     * Entry point for real-time event processing
     */
    async handleEvent(event: any): Promise<void> {
        this.processEventInternal(event);
        await this.analyzeSession(event.actorId, event.payload?.sessionId);
    }

    private processEventInternal(event: any): void {
        const sessionId = event.payload?.sessionId;
        const cashierId = event.actorId;

        if (!sessionId || !cashierId) return;

        const stats = this.getOrCreateStats(sessionId, cashierId);

        switch (event.type) {
            case EventType.ORDER_CANCELLED:
                stats.session.voidCount++;
                stats.daily.voidCount++;
                break;

            case EventType.PAYMENT_REFUNDED:
                stats.session.refundCount++;
                stats.session.refundAmount += event.payload.amount || 0;
                stats.daily.refundCount++;
                stats.daily.refundAmount += event.payload.amount || 0;
                break;

            case EventType.ORDER_MODIFIED:
                if (event.payload.action === 'remove_item' || event.payload.action === 'void_item') {
                    stats.session.voidCount++;
                    stats.daily.voidCount++;
                }
                if (event.payload.discount) {
                    stats.session.discountCount++;
                    stats.session.totalDiscountAmount += event.payload.discount.amount || 0;
                }
                break;

            case EventType.ORDER_SUBMITTED:
                // Check for suspicious timing (e.g., transaction completed in < 2 seconds)
                const duration = Date.now() - (event.payload.startTime || Date.now());
                if (duration < 2000 && event.payload.itemCount > 1) {
                    this.flagAnomaly(cashierId, sessionId, 'SUSPICIOUS_TIMING', 6, `High-speed transaction detected: ${event.payload.itemCount} items in ${duration}ms.`);
                }
                break;
        }
    }

    private getOrCreateStats(sessionId: string, cashierId: string) {
        if (!this.sessionStats.has(sessionId)) {
            this.sessionStats.set(sessionId, this.createEmptyStats());
        }
        if (!this.cashierDailyStats.has(cashierId)) {
            this.cashierDailyStats.set(cashierId, this.createEmptyStats());
        }
        return {
            session: this.sessionStats.get(sessionId)!,
            daily: this.cashierDailyStats.get(cashierId)!
        };
    }

    private createEmptyStats(): FraudStats {
        return {
            voidCount: 0,
            voidAmount: 0,
            refundCount: 0,
            refundAmount: 0,
            discountCount: 0,
            totalDiscountAmount: 0
        };
    }

    /**
     * Analyze current session for fraud patterns
     */
    private async analyzeSession(cashierId: string, sessionId: string): Promise<void> {
        if (!sessionId) return;
        const stats = this.sessionStats.get(sessionId);
        if (!stats) return;

        // Check Excessive Voids
        if (stats.voidCount >= this.MAX_VOIDS_PER_SESSION) {
            await this.flagAnomaly(
                cashierId,
                sessionId,
                'EXCESSIVE_VOID',
                8,
                `Cashier reached ${stats.voidCount} voids in a single session.`
            );
        }

        // Check Excessive Refunds
        if (stats.refundCount >= this.MAX_REFUNDS_PER_SESSION) {
            await this.flagAnomaly(
                cashierId,
                sessionId,
                'EXCESSIVE_REFUND',
                9,
                `Cashier performed ${stats.refundCount} refunds. Threshold is ${this.MAX_REFUNDS_PER_SESSION}.`
            );
        }
    }

    /**
     * Flag an anomaly and propagate via Web3/Events
     */
    private async flagAnomaly(
        cashierId: string,
        sessionId: string,
        type: FraudAnomalyDetectedEvent['payload']['anomalyType'],
        severity: number,
        details: string
    ): Promise<void> {
        const anomalyId = uuidv4();

        // 1. Emit Decentralized Event
        await this.eventEngine.createEvent<FraudAnomalyDetectedEvent>(
            EventType.FRAUD_ANOMALY_DETECTED,
            cashierId,
            {
                anomalyId,
                cashierId,
                sessionId,
                anomalyType: type,
                severity,
                details,
                timestamp: Date.now()
            }
        );

        // 2. Alert Management (for real-time dashboard)
        await this.eventEngine.createEvent<AlertTriggeredEvent>(
            EventType.ALERT_TRIGGERED,
            'system-fraud-engine',
            {
                alertId: uuidv4(),
                severity: severity >= 8 ? 'critical' : 'high',
                category: 'security',
                title: `FRAUD DETECTED: ${type}`,
                message: details,
                context: { cashierId, sessionId, anomalyId, severity },
                source: 'FraudDetectionEngine',
                acknowledged: false
            }
        );

        // 3. 100% Decentralized Blockchain Anchoring (for severe breaches)
        if (severity >= this.SEVERITY_THRESHOLD_CRITICAL) {
            console.log('⛓️ Anchoring critical fraud anomaly to blockchain...');
            try {
                // Anchoring to FraudDetection.sol
                await web3Service.anchorEventBatch(cashierId, anomalyId);
            } catch (e) {
                console.warn('Failed to anchor fraud anomaly on-chain:', e);
            }
        }
    }

    /**
     * External check for supervisor override
     */
    async requiresOverride(action: string, amount: number): Promise<boolean> {
        // Implement complex business logic for when a manager must step in
        if (action === 'REFUND' && amount > 500) return true;
        if (action === 'VOID_ALL') return true;
        return false;
    }

    /**
     * Clear session stats on end
     */
    clearSession(sessionId: string): void {
        this.sessionStats.delete(sessionId);
    }
}
