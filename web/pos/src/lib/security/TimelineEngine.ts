/**
 * NileLink Timeline Engine
 * 
 * Aggregates all security and operational events into a unified investigation
 * timeline. Enables "Sensor Fusion" for theft investigation:
 * - POS Transactions
 * - EAS Gate Triggers
 * - Vision Pickups & Behavior
 * - Fraud Anomaly Detection
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import {
    EventType,
    EconomicEvent,
    BaseEvent
} from '../events/types';

export interface UnifiedTimelineEvent {
    id: string;
    timestamp: number;
    type: string;
    source: string;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata: Record<string, any>;
    relatedTransactionId?: string;
}

export interface InvestigationReport {
    transactionId: string;
    startTime: number;
    endTime: number;
    events: UnifiedTimelineEvent[];
    riskScore: number;
    verifiableCid?: string; // Anchor to IPFS
}

export class TimelineEngine {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;

    // Recent events cache for live dashboard
    private recentEvents: UnifiedTimelineEvent[] = [];
    private readonly MAX_RECENT_EVENTS = 500;

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
    }

    /**
     * Subscribe to all events and map them to a unified timeline
     */
    public async handleEvent(event: EconomicEvent): Promise<void> {
        const unifiedEvent = this.mapToUnified(event);
        if (unifiedEvent) {
            this.recentEvents.unshift(unifiedEvent);
            if (this.recentEvents.length > this.MAX_RECENT_EVENTS) {
                this.recentEvents.pop();
            }
        }
    }

    /**
     * Map specialized events to a common timeline format
     */
    private mapToUnified(event: EconomicEvent): UnifiedTimelineEvent | null {
        const base: Omit<UnifiedTimelineEvent, 'type' | 'source' | 'details' | 'severity' | 'metadata'> = {
            id: event.id,
            timestamp: event.timestamp,
            relatedTransactionId: (event.payload as any).transactionId || (event.payload as any).orderId
        };

        switch (event.type) {
            case EventType.ITEM_SCANNED:
                return {
                    ...base,
                    type: 'POS_SCAN',
                    source: 'ScannerManager',
                    details: `Scanned ${event.payload.productName}`,
                    severity: 'low',
                    metadata: event.payload
                };

            case EventType.FRAUD_ANOMALY_DETECTED:
                return {
                    ...base,
                    type: 'FRAUD_ANOMALY',
                    source: 'FraudDetectionEngine',
                    details: event.payload.details,
                    severity: 'high',
                    metadata: event.payload
                };

            case EventType.CAMERA_EVENT_RECORDED:
                return {
                    ...base,
                    type: 'VISION_EVENT',
                    source: 'VisionEngine',
                    details: `Camera detected ${event.payload.eventType}`,
                    severity: event.payload.eventType === 'item_pickup' ? 'medium' : 'low',
                    metadata: event.payload
                };

            case EventType.EAS_GATE_TRIGGERED:
                return {
                    ...base,
                    type: 'EAS_ALARM',
                    source: 'EASManager',
                    details: `Gate alarm triggered at ${event.payload.gateId}`,
                    severity: 'critical',
                    metadata: event.payload
                };

            case EventType.ALERT_TRIGGERED:
                return {
                    ...base,
                    type: 'SECURITY_ALERT',
                    source: 'AlertManager',
                    details: event.payload.title,
                    severity: event.payload.severity,
                    metadata: event.payload
                };

            default:
                return null;
        }
    }

    /**
     * Build a comprehensive investigation report for a transaction
     */
    public async generateInvestigationReport(transactionId: string): Promise<InvestigationReport | null> {
        try {
            const allEvents = await this.ledger.getAllEvents();
            const filteredEvents = allEvents
                .filter(e => {
                    const payload = e.payload as any;
                    return payload.transactionId === transactionId || payload.orderId === transactionId;
                })
                .map(e => this.mapToUnified(e as EconomicEvent))
                .filter(e => e !== null) as UnifiedTimelineEvent[];

            if (filteredEvents.length === 0) return null;

            filteredEvents.sort((a, b) => a.timestamp - b.timestamp);

            const startTime = filteredEvents[0].timestamp;
            const endTime = filteredEvents[filteredEvents.length - 1].timestamp;

            // Simple risk scoring
            let riskScore = 0;
            filteredEvents.forEach(e => {
                if (e.severity === 'critical') riskScore += 50;
                if (e.severity === 'high') riskScore += 25;
                if (e.severity === 'medium') riskScore += 10;
            });

            return {
                transactionId,
                startTime,
                endTime,
                events: filteredEvents,
                riskScore: Math.min(100, riskScore)
            };

        } catch (error) {
            console.error('Failed to generate investigation report:', error);
            return null;
        }
    }

    /**
     * Get the live timeline feed
     */
    public getLiveTimeline(): UnifiedTimelineEvent[] {
        return this.recentEvents;
    }
}
