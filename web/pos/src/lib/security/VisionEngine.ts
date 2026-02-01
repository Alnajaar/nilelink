/**
 * NileLink Vision Engine
 * 
 * Provides real-time computer vision analytics by correlating camera metadata
 * with POS event streams:
 * - Unprocessed item detection (Pickup vs Scan)
 * - Suspicious behavioral analysis
 * - Staff-Customer interaction monitoring
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { TheftPreventionEngine } from './TheftPreventionEngine';
import { AlertManager } from './AlertManager';
import {
    EventType,
    EconomicEvent,
    CameraEventRecordedEvent,
    ItemScannedEvent
} from '../events/types';

interface VisionSession {
    transactionId: string;
    pickups: Map<string, number>; // productId -> count from vision
    scans: Map<string, number>; // productId -> count from POS
    lastUpdate: number;
}

export class VisionEngine {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private theftPreventionEngine: TheftPreventionEngine;
    private alertManager: AlertManager;

    // Ongoing monitoring sessions linked to checkout transactions
    private activeSessions = new Map<string, VisionSession>();

    // Risk thresholds
    private readonly DISCREPANCY_TIMEOUT = 5000; // 5 seconds to correlate scan after pickup
    private readonly CONFIDENCE_THRESHOLD = 0.85;

    constructor(
        eventEngine: EventEngine,
        ledger: LocalLedger,
        theftPreventionEngine: TheftPreventionEngine,
        alertManager: AlertManager
    ) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.theftPreventionEngine = theftPreventionEngine;
        this.alertManager = alertManager;
    }

    /**
     * Process events from the global stream
     */
    public async handleEvent(event: EconomicEvent): Promise<void> {
        switch (event.type) {
            case EventType.CAMERA_EVENT_RECORDED:
                await this.processCameraEvent(event as CameraEventRecordedEvent);
                break;

            case EventType.ITEM_SCANNED:
                await this.processScanEvent(event as ItemScannedEvent);
                break;

            case EventType.PAYMENT_COLLECTED_CASH:
            case EventType.PAYMENT_COLLECTED_CARD:
            case EventType.PAYMENT_COLLECTED_DIGITAL:
                this.finalizeSession(event.payload.transactionId || event.payload.orderId);
                break;
        }
    }

    /**
     * Handle incoming vision metadata from CameraManager/NVR
     */
    private async processCameraEvent(event: CameraEventRecordedEvent): Promise<void> {
        const { cameraId, eventType, transactionId, metadata, confidence } = event.payload;

        if (confidence < this.CONFIDENCE_THRESHOLD) return;

        // We only care about checkout-related vision events for now
        if (!transactionId) return;

        let session = this.activeSessions.get(transactionId);
        if (!session) {
            session = {
                transactionId,
                pickups: new Map(),
                scans: new Map(),
                lastUpdate: Date.now()
            };
            this.activeSessions.set(transactionId, session);
        }

        session.lastUpdate = Date.now();

        if (eventType === 'item_pickup') {
            const productId = metadata.productId || 'unknown';
            const currentCount = session.pickups.get(productId) || 0;
            session.pickups.set(productId, currentCount + 1);

            // Set a timer to check for corresponding scan
            setTimeout(() => {
                this.checkForMissedScan(transactionId, productId);
            }, this.DISCREPANCY_TIMEOUT);
        }

        if (eventType === 'checkout_activity' && metadata.action === 'suspicious_move') {
            await this.triggerSecurityAlert(transactionId, 'SUSPICIOUS_BEHAVIOR', `Vision detected suspicious movement at ${cameraId}`);
        }
    }

    /**
     * Update session state when a physical scan happens at the POS
     */
    private async processScanEvent(event: ItemScannedEvent): Promise<void> {
        const { transactionId, productId } = event.payload;

        const session = this.activeSessions.get(transactionId);
        if (session) {
            const currentCount = session.scans.get(productId) || 0;
            session.scans.set(productId, currentCount + 1);
            session.lastUpdate = Date.now();
        }
    }

    /**
     * Reconcile vision vs scan data
     */
    private async checkForMissedScan(transactionId: string, productId: string): Promise<void> {
        const session = this.activeSessions.get(transactionId);
        if (!session) return;

        const pickupCount = session.pickups.get(productId) || 0;
        const scanCount = session.scans.get(productId) || 0;

        if (pickupCount > scanCount) {
            // Discrepancy detected!
            await this.triggerSecurityAlert(
                transactionId,
                'MISSED_SCAN',
                `Item ${productId} picked up but not scanned after ${this.DISCREPANCY_TIMEOUT / 1000}s.`
            );
        }
    }

    /**
     * Trigger a formal security alert via AlertManager
     */
    private async triggerSecurityAlert(transactionId: string, type: string, message: string): Promise<void> {
        await this.alertManager.createAlert(
            'high',
            'theft',
            `Vision Alert: ${type}`,
            message,
            { transactionId, type, timestamp: Date.now() },
            'VisionEngine',
            ['ai_vision', 'theft_prevention']
        );

        // Optionally lock the transaction in TheftPreventionEngine
        // this.theftPreventionEngine.lockTransaction(transactionId, 'security_check');
    }

    /**
     * Cleanup session data after payment or abandonment
     */
    private finalizeSession(transactionId: string): void {
        this.activeSessions.delete(transactionId);
    }
}
