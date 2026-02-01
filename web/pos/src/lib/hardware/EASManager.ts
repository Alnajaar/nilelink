/**
 * NileLink Electronic Article Surveillance (EAS) Manager
 *
 * Prevents retail theft through RFID tag validation and gate monitoring:
 * - RFID readers at store exits for tag validation
 * - Gate sensor network with real-time monitoring
 * - POS-EAS synchronization to unlock paid tags
 * - Unauthorized gate trigger detection and alerts
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { TheftPreventionEngine } from '../security/TheftPreventionEngine';
import { AlertManager } from '../security/AlertManager';
import {
    EventType,
    EASEvent,
    ItemScannedEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface RFIDTag {
    tagId: string;
    productId: string;
    transactionId?: string;
    isActive: boolean;
    locked: boolean;
    lastSeen: number;
    gateId?: string;
}

export interface GateSensor {
    gateId: string;
    location: string;
    isActive: boolean;
    lastHeartbeat: number;
    alarmTriggered: boolean;
    alarmReason?: string;
    connectedReaders: string[];
}

export interface GateEvent {
    gateId: string;
    eventType: 'entry' | 'exit' | 'alarm' | 'tamper';
    timestamp: number;
    tagId?: string;
    authorized: boolean;
    metadata?: Record<string, any>;
}

export class EASManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private theftPreventionEngine: TheftPreventionEngine;
    private alertManager: AlertManager;
    private activeTags = new Map<string, RFIDTag>();
    private gateSensors = new Map<string, GateSensor>();
    private gateEvents: GateEvent[] = [];

    // Configuration
    private readonly MAX_STORED_EVENTS = 10000;
    private readonly TAG_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
    private readonly GATE_HEARTBEAT_TIMEOUT = 30 * 1000; // 30 seconds

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
     * Start the EAS system. Should only be called on the client.
     */
    public async start(): Promise<void> {
        await this.initializeEAS();
        this.startMonitoring();
    }

    /**
     * Initialize EAS system with default gates and readers
     */
    private async initializeEAS(): Promise<void> {
        // Initialize default gate sensors
        const defaultGates: GateSensor[] = [
            {
                gateId: 'gate_main_exit',
                location: 'Main Exit',
                isActive: true,
                lastHeartbeat: Date.now(),
                alarmTriggered: false,
                connectedReaders: ['reader_main_1', 'reader_main_2']
            },
            {
                gateId: 'gate_side_exit',
                location: 'Side Exit',
                isActive: true,
                lastHeartbeat: Date.now(),
                alarmTriggered: false,
                connectedReaders: ['reader_side_1']
            },
            {
                gateId: 'gate_employee_exit',
                location: 'Employee Exit',
                isActive: true,
                lastHeartbeat: Date.now(),
                alarmTriggered: false,
                connectedReaders: ['reader_employee_1']
            }
        ];

        for (const gate of defaultGates) {
            this.gateSensors.set(gate.gateId, gate);
        }

        // Load existing tags from events
        await this.loadExistingTags();

        console.log('✅ EAS Manager initialized with', this.gateSensors.size, 'gates');
    }

    /**
     * Load existing RFID tags from events
     */
    private async loadExistingTags(): Promise<void> {
        try {
            const events = await this.ledger.getAllEvents();

            for (const event of events) {
                if (event.type === EventType.ITEM_SCANNED && event.payload.status === 'scanned') {
                    // Create RFID tag for scanned item
                    const tagId = `tag_${event.payload.productId}_${event.timestamp}`;
                    const tag: RFIDTag = {
                        tagId,
                        productId: event.payload.productId,
                        transactionId: event.payload.transactionId,
                        isActive: true,
                        locked: true, // Tags start locked
                        lastSeen: event.timestamp
                    };
                    this.activeTags.set(tagId, tag);
                }
            }
        } catch (error) {
            console.error('Failed to load existing RFID tags:', error);
        }
    }

    /**
     * Assign RFID tag to scanned item
     */
    async assignRFIDTag(
        transactionId: string,
        productId: string,
        tagId: string
    ): Promise<boolean> {
        try {
            const tag: RFIDTag = {
                tagId,
                productId,
                transactionId,
                isActive: true,
                locked: true, // Start locked
                lastSeen: Date.now()
            };

            this.activeTags.set(tagId, tag);

            // Create EAS event
            await this.eventEngine.createEvent<EASEvent>(
                EventType.EAS_TAG_UNLOCKED,
                'system',
                {
                    transactionId,
                    tagId,
                    gateId: 'system', // Not at a gate yet
                    action: 'lock', // Initially locked
                    timestamp: Date.now(),
                    authorized: false,
                    items: [{ productId, quantity: 1 }]
                }
            );

            return true;
        } catch (error) {
            console.error('Failed to assign RFID tag:', error);
            return false;
        }
    }

    /**
     * Unlock RFID tags after successful payment
     */
    async unlockTagsForTransaction(transactionId: string): Promise<number> {
        let unlockedCount = 0;

        for (const [tagId, tag] of this.activeTags) {
            if (tag.transactionId === transactionId && tag.locked) {
                tag.locked = false;
                unlockedCount++;

                // Create unlock event
                await this.eventEngine.createEvent<EASEvent>(
                    EventType.EAS_TAG_UNLOCKED,
                    'system',
                    {
                        transactionId,
                        tagId,
                        gateId: 'pos_system',
                        action: 'unlock',
                        timestamp: Date.now(),
                        authorized: true,
                        items: [{ productId: tag.productId, quantity: 1 }]
                    }
                );
            }
        }

        return unlockedCount;
    }

    /**
     * Handle incoming events for EAS synchronization
     */
    async handleEvent(event: EconomicEvent): Promise<void> {
        switch (event.type) {
            case EventType.ITEM_SCANNED:
                // Auto-assign tag if tagId provided in metadata (simulated)
                if (event.payload.metadata?.tagId) {
                    await this.assignRFIDTag(
                        event.payload.transactionId,
                        event.payload.productId,
                        event.payload.metadata.tagId
                    );
                }
                break;

            case EventType.PAYMENT_COLLECTED_CASH:
            case EventType.PAYMENT_COLLECTED_CARD:
            case EventType.PAYMENT_COLLECTED_DIGITAL:
                console.log(`[EAS] Payment received for order ${event.payload.orderId}. Unlocking tags...`);
                await this.unlockTagsForTransaction(event.payload.orderId);
                break;

            case EventType.ORDER_CANCELLED:
                // Potentially deactivate tags for cancelled orders
                break;
        }
    }

    /**
     * Process gate event (entry/exit detection)
     */
    async processGateEvent(
        gateId: string,
        eventType: 'entry' | 'exit' | 'alarm' | 'tamper',
        tagId?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        const gateEvent: GateEvent = {
            gateId,
            eventType,
            timestamp: Date.now(),
            tagId,
            authorized: false,
            metadata
        };

        // Store event
        this.gateEvents.push(gateEvent);

        // Update gate sensor status
        const gate = this.gateSensors.get(gateId);
        if (gate) {
            gate.lastHeartbeat = Date.now();

            if (eventType === 'alarm') {
                gate.alarmTriggered = true;
                gate.alarmReason = metadata?.reason;
            }
        }

        // Process based on event type
        switch (eventType) {
            case 'exit':
                await this.processExitEvent(gateEvent);
                break;
            case 'alarm':
                await this.processAlarmEvent(gateEvent);
                break;
            case 'tamper':
                await this.processTamperEvent(gateEvent);
                break;
        }

        // Create EAS event
        await this.eventEngine.createEvent<EASEvent>(
            EventType.EAS_GATE_TRIGGERED,
            'system',
            {
                gateId,
                action: eventType,
                timestamp: gateEvent.timestamp,
                authorized: gateEvent.authorized,
                tagId,
                items: tagId ? [{ productId: this.activeTags.get(tagId)?.productId || '', quantity: 1 }] : undefined
            }
        );
    }

    /**
     * Process exit event - check if tags are authorized
     */
    private async processExitEvent(gateEvent: GateEvent): Promise<void> {
        if (!gateEvent.tagId) return;

        const tag = this.activeTags.get(gateEvent.tagId);
        if (!tag) {
            // Unknown tag - potential theft
            gateEvent.authorized = false;
            await this.alertManager.createAlert(
                'high',
                'theft',
                'Unauthorized Tag Detected',
                `Unknown RFID tag ${gateEvent.tagId} detected at ${gateEvent.gateId}`,
                {
                    tagId: gateEvent.tagId,
                    gateId: gateEvent.gateId,
                    transactionId: tag?.transactionId
                },
                'EASManager'
            );
            return;
        }

        // Check if tag is unlocked (paid for)
        if (tag.locked) {
            gateEvent.authorized = false;
            await this.alertManager.createAlert(
                'critical',
                'theft',
                'Unpaid Item Exit Attempt',
                `Locked RFID tag ${gateEvent.tagId} (${tag.productId}) detected at exit`,
                {
                    tagId: gateEvent.tagId,
                    productId: tag.productId,
                    transactionId: tag.transactionId,
                    gateId: gateEvent.gateId
                },
                'EASManager'
            );
        } else {
            gateEvent.authorized = true;
            tag.lastSeen = gateEvent.timestamp;

            // Deactivate tag after successful exit
            tag.isActive = false;
        }
    }

    /**
     * Process alarm event
     */
    private async processAlarmEvent(gateEvent: GateEvent): Promise<void> {
        await this.alertManager.createAlert(
            'high',
            'security',
            'EAS Gate Alarm',
            `Gate alarm triggered at ${gateEvent.gateId}`,
            {
                gateId: gateEvent.gateId,
                reason: gateEvent.metadata?.reason,
                tagId: gateEvent.tagId
            },
            'EASManager'
        );
    }

    /**
     * Process tamper event
     */
    private async processTamperEvent(gateEvent: GateEvent): Promise<void> {
        await this.alertManager.createAlert(
            'critical',
            'security',
            'EAS System Tampering',
            `Gate tampering detected at ${gateEvent.gateId}`,
            {
                gateId: gateEvent.gateId,
                tamperType: gateEvent.metadata?.tamperType
            },
            'EASManager'
        );
    }

    /**
     * Get gate sensor status
     */
    getGateStatus(): { gateId: string; status: 'healthy' | 'warning' | 'error'; lastSeen: number }[] {
        const now = Date.now();
        return Array.from(this.gateSensors.values()).map(gate => {
            const timeSinceHeartbeat = now - gate.lastHeartbeat;
            let status: 'healthy' | 'warning' | 'error' = 'healthy';

            if (gate.alarmTriggered) {
                status = 'error';
            } else if (timeSinceHeartbeat > this.GATE_HEARTBEAT_TIMEOUT) {
                status = 'warning';
            }

            return {
                gateId: gate.gateId,
                status,
                lastSeen: gate.lastHeartbeat
            };
        });
    }

    /**
     * Get active RFID tags
     */
    getActiveTags(): RFIDTag[] {
        return Array.from(this.activeTags.values()).filter(tag => tag.isActive);
    }

    /**
     * Get recent gate events
     */
    getRecentGateEvents(limit: number = 100): GateEvent[] {
        return this.gateEvents.slice(-limit);
    }

    /**
     * Manually unlock a specific tag (emergency override)
     */
    async emergencyUnlockTag(tagId: string, authorizedBy: string): Promise<boolean> {
        const tag = this.activeTags.get(tagId);
        if (!tag) return false;

        tag.locked = false;

        await this.alertManager.createAlert(
            'medium',
            'security',
            'Emergency Tag Unlock',
            `RFID tag ${tagId} manually unlocked by ${authorizedBy}`,
            {
                tagId,
                productId: tag.productId,
                transactionId: tag.transactionId,
                authorizedBy
            },
            'EASManager'
        );

        return true;
    }

    /**
     * Get EAS system statistics
     */
    getEASStats(): {
        activeTags: number;
        lockedTags: number;
        totalGates: number;
        healthyGates: number;
        recentEvents: number;
    } {
        const activeTags = this.getActiveTags();
        const lockedTags = activeTags.filter(tag => tag.locked).length;
        const gateStatuses = this.getGateStatus();
        const healthyGates = gateStatuses.filter(g => g.status === 'healthy').length;

        return {
            activeTags: activeTags.length,
            lockedTags,
            totalGates: this.gateSensors.size,
            healthyGates,
            recentEvents: this.gateEvents.length
        };
    }

    /**
     * Start monitoring loops
     */
    private startMonitoring(): void {
        // Clean up old tags every hour
        setInterval(() => {
            this.cleanupExpiredTags();
        }, 60 * 60 * 1000);

        // Clean up old events every 24 hours
        setInterval(() => {
            this.cleanupOldEvents();
        }, 24 * 60 * 60 * 1000);

        // Check gate health every 30 seconds
        setInterval(() => {
            this.checkGateHealth();
        }, 30 * 1000);
    }

    /**
     * Clean up expired RFID tags
     */
    private cleanupExpiredTags(): void {
        const cutoffTime = Date.now() - this.TAG_TIMEOUT;
        const expiredTags: string[] = [];

        for (const [tagId, tag] of this.activeTags) {
            if (tag.lastSeen < cutoffTime) {
                expiredTags.push(tagId);
            }
        }

        for (const tagId of expiredTags) {
            this.activeTags.delete(tagId);
        }
    }

    /**
     * Clean up old gate events
     */
    private cleanupOldEvents(): void {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        this.gateEvents = this.gateEvents.filter(event => event.timestamp > cutoffTime);
    }

    /**
     * Check gate sensor health
     */
    private checkGateHealth(): void {
        const now = Date.now();

        for (const [gateId, gate] of this.gateSensors) {
            const timeSinceHeartbeat = now - gate.lastHeartbeat;

            if (timeSinceHeartbeat > this.GATE_HEARTBEAT_TIMEOUT * 2) {
                // Gate is offline
                this.alertManager.createAlert(
                    'medium',
                    'system',
                    'EAS Gate Offline',
                    `Gate ${gateId} has stopped responding`,
                    { gateId, lastHeartbeat: gate.lastHeartbeat },
                    'EASManager'
                );
            }
        }
    }

    /**
     * Reset gate alarm
     */
    async resetGateAlarm(gateId: string): Promise<boolean> {
        const gate = this.gateSensors.get(gateId);
        if (!gate) return false;

        gate.alarmTriggered = false;
        gate.alarmReason = undefined;
        return true;
    }
}