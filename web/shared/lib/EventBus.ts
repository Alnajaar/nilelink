// Event-Driven Architecture - Centralized Event Bus (Shared)
// Handles all system events with pub/sub pattern, filtering, and routing

export enum EventPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum EventScope {
    LOCAL = 'local',           // Current component only
    SESSION = 'session',       // Current user session
    BRANCH = 'branch',         // Current branch/location
    BUSINESS = 'business',     // Entire business
    GLOBAL = 'global'          // All instances
}

export interface EventMetadata {
    id?: string;
    timestamp?: number;
    source?: string;
    target?: string;
    priority?: EventPriority;
    scope?: EventScope;
    branchId?: string;
    businessId?: string;
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    ttl?: number;              // Time to live in ms
    retryCount?: number;
    persistent?: boolean;      // Store in database
    encrypted?: boolean;       // Encrypt payload
    [key: string]: any;
}

export interface SystemEvent {
    type: string;
    payload: any;
    metadata: EventMetadata;
}

export type EventHandler = (event: SystemEvent) => void | Promise<void>;
export type EventFilter = (event: SystemEvent) => boolean;

export interface EventSubscription {
    id: string;
    eventType: string;
    handler: EventHandler;
    filter?: EventFilter;
    priority: number;
    enabled: boolean;
    metadata?: EventMetadata;
}

export interface EventRule {
    id: string;
    name: string;
    condition: EventFilter;
    actions: EventHandler[];
    enabled: boolean;
    priority: number;
    metadata?: EventMetadata;
}

class EventBus {
    private subscriptions: Map<string, EventSubscription[]> = new Map();
    private rules: EventRule[] = [];
    private eventHistory: SystemEvent[] = [];
    private maxHistorySize = 1000;
    private eventQueue: SystemEvent[] = [];
    private processingQueue = false;
    private eventMetrics = {
        published: 0,
        processed: 0,
        failed: 0,
        avgProcessingTime: 0
    };

    subscribe(
        eventType: string,
        handler: EventHandler,
        options: {
            filter?: EventFilter;
            priority?: number;
            metadata?: EventMetadata;
        } = {}
    ): string {
        const subscriptionId = `sub_${Date.now()}_${Math.random()}`;
        const subscription: EventSubscription = {
            id: subscriptionId,
            eventType,
            handler,
            filter: options.filter,
            priority: options.priority || 0,
            enabled: true,
            metadata: options.metadata
        };
        if (!this.subscriptions.has(eventType)) {
            this.subscriptions.set(eventType, []);
        }
        this.subscriptions.get(eventType)!.push(subscription);
        this.sortSubscriptions(eventType);
        return subscriptionId;
    }

    unsubscribe(subscriptionId: string): boolean {
        for (const [eventType, subs] of this.subscriptions.entries()) {
            const index = subs.findIndex(sub => sub.id === subscriptionId);
            if (index !== -1) {
                subs.splice(index, 1);
                if (subs.length === 0) {
                    this.subscriptions.delete(eventType);
                }
                return true;
            }
        }
        return false;
    }

    async publish(event: SystemEvent): Promise<void> {
        event.metadata = {
            id: event.metadata.id || `evt_${Date.now()}_${Math.random()}`,
            timestamp: event.metadata.timestamp || Date.now(),
            source: event.metadata.source || 'unknown',
            priority: event.metadata.priority || EventPriority.NORMAL,
            scope: event.metadata.scope || EventScope.LOCAL,
            ...event.metadata
        };
        this.eventMetrics.published++;
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        this.eventQueue.push(event);
        if (!this.processingQueue) {
            this.processEventQueue();
        }
    }

    private async processEventQueue(): Promise<void> {
        if (this.processingQueue || this.eventQueue.length === 0) return;
        this.processingQueue = true;
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift()!;
            await this.processEvent(event);
        }
        this.processingQueue = false;
    }

    private async processEvent(event: SystemEvent): Promise<void> {
        const startTime = Date.now();
        try {
            await this.applyRules(event);
            await this.processSubscriptions(event);
            this.eventMetrics.processed++;
            const processingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(processingTime);
        } catch (error: any) {
            this.eventMetrics.failed++;
            console.error('EventBus: Failed to process event:', event, error);
            await this.publish(createEvent('EVENT_PROCESSING_ERROR', {
                originalEvent: event,
                error: error.message
            }, { source: 'EventBus', priority: EventPriority.HIGH }));
        }
    }

    private async applyRules(event: SystemEvent): Promise<void> {
        for (const rule of this.rules) {
            if (!rule.enabled) continue;
            try {
                if (rule.condition(event)) {
                    for (const action of rule.actions) {
                        await action(event);
                    }
                }
            } catch (error: any) {
                console.error('EventBus: Rule execution failed:', rule.name, error);
            }
        }
    }

    private async processSubscriptions(event: SystemEvent): Promise<void> {
        const subscriptions = this.subscriptions.get(event.type) || [];
        for (const subscription of subscriptions) {
            if (!subscription.enabled) continue;
            if (subscription.filter && !subscription.filter(event)) continue;
            try {
                await subscription.handler(event);
            } catch (error: any) {
                console.error('EventBus: Subscription handler failed:', subscription.id, error);
            }
        }
    }

    private sortSubscriptions(eventType: string): void {
        const subs = this.subscriptions.get(eventType);
        if (subs) {
            subs.sort((a, b) => b.priority - a.priority);
        }
    }

    private updateAverageProcessingTime(processingTime: number): void {
        const current = this.eventMetrics.avgProcessingTime;
        const totalProcessed = this.eventMetrics.processed;
        this.eventMetrics.avgProcessingTime = (current * (totalProcessed - 1) + processingTime) / totalProcessed;
    }
}

export const eventBus = new EventBus();

export function createEvent(
    type: string,
    payload: any,
    metadata: Partial<EventMetadata> = {}
): SystemEvent {
    return {
        type,
        payload,
        metadata: {
            timestamp: Date.now(),
            priority: EventPriority.NORMAL,
            scope: EventScope.LOCAL,
            ...metadata
        }
    };
}

export const EventTypes = {
    // System Events
    SYSTEM_STARTUP: 'SYSTEM_STARTUP',
    SYSTEM_ERROR: 'SYSTEM_ERROR',

    // Transaction Events
    TRANSACTION_COMPLETED: 'TRANSACTION_COMPLETED',

    // Customer Ecosystem Events (Phase 10)
    LOYALTY_UPDATED: 'LOYALTY_UPDATED',
    REWARD_REDEEMED: 'REWARD_REDEEMED',
    ORDER_TRACKING_STARTED: 'ORDER_TRACKING_STARTED',
    ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
    GROUP_CART_CREATED: 'GROUP_CART_CREATED',
    GROUP_MEMBER_JOINED: 'GROUP_MEMBER_JOINED',
    GROUP_CART_UPDATED: 'GROUP_CART_UPDATED',
    REFERRAL_SUCCESS: 'REFERRAL_SUCCESS',

    // Security Events
    SECURITY_THREAT_DETECTED: 'SECURITY_THREAT_DETECTED',
    SECURITY_DEFENSE_ACTIVATED: 'SECURITY_DEFENSE_ACTIVATED'
} as const;
