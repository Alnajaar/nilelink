// Event-Driven Architecture - Centralized Event Bus
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

    /**
     * Subscribe to events
     */
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

    /**
     * Alias for subscribe to support EventEmitter-like pattern
     */
    on(eventType: string, handler: EventHandler, options = {}): string {
        return this.subscribe(eventType, handler, options);
    }

    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId: string): boolean {
        for (const [eventType, subs] of this.subscriptions.entries()) {
            const index = subs.findIndex(sub => sub.id === subscriptionId);
            if (index !== -1) {
                subs.splice(index, 1);

                // Clean up empty arrays
                if (subs.length === 0) {
                    this.subscriptions.delete(eventType);
                }

                return true;
            }
        }
        return false;
    }

    /**
     * Publish an event
     */
    async publish(event: SystemEvent): Promise<void> {
        // Enrich event metadata
        const existingMetadata = event.metadata || {};
        event.metadata = {
            id: existingMetadata.id || `evt_${Date.now()}_${Math.random()}`,
            timestamp: existingMetadata.timestamp || Date.now(),
            source: existingMetadata.source || 'unknown',
            priority: existingMetadata.priority || EventPriority.NORMAL,
            scope: existingMetadata.scope || EventScope.LOCAL,
            ...existingMetadata
        };

        this.eventMetrics.published++;

        // Add to history
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Add to processing queue
        this.eventQueue.push(event);

        // Process queue asynchronously
        if (!this.processingQueue) {
            this.processEventQueue();
        }
    }

    /**
     * Publish multiple events in batch
     */
    async publishBatch(events: SystemEvent[]): Promise<void> {
        for (const event of events) {
            await this.publish(event);
        }
    }

    /**
     * Add an event processing rule
     */
    addRule(rule: EventRule): string {
        rule.id = `rule_${Date.now()}_${Math.random()}`;
        this.rules.push(rule);
        this.sortRules();
        return rule.id;
    }

    /**
     * Remove an event rule
     */
    removeRule(ruleId: string): boolean {
        const index = this.rules.findIndex(rule => rule.id === ruleId);
        if (index !== -1) {
            this.rules.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get event history with optional filtering
     */
    getEventHistory(filter?: EventFilter, limit = 100): SystemEvent[] {
        let events = this.eventHistory;

        if (filter) {
            events = events.filter(filter);
        }

        return events.slice(-limit);
    }

    /**
     * Get event metrics
     */
    getMetrics() {
        return { ...this.eventMetrics };
    }

    /**
     * Clear event history
     */
    clearHistory(): void {
        this.eventHistory = [];
    }

    /**
     * Process the event queue
     */
    private async processEventQueue(): Promise<void> {
        if (this.processingQueue || this.eventQueue.length === 0) {
            return;
        }

        this.processingQueue = true;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift()!;
            await this.processEvent(event);
        }

        this.processingQueue = false;
    }

    /**
     * Process a single event
     */
    private async processEvent(event: SystemEvent): Promise<void> {
        const startTime = Date.now();

        try {
            // Apply rules first
            await this.applyRules(event);

            // Process subscriptions
            await this.processSubscriptions(event);

            this.eventMetrics.processed++;

            const processingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(processingTime);

        } catch (error: any) {
            this.eventMetrics.failed++;
            console.error('EventBus: Failed to process event:', event, error);

            // Publish error event
            await this.publish({
                type: 'EVENT_PROCESSING_ERROR',
                payload: {
                    originalEvent: event,
                    error: error.message,
                    stack: error.stack
                },
                metadata: {
                    source: 'EventBus',
                    priority: EventPriority.HIGH,
                    correlationId: event.metadata.correlationId
                }
            });
        }
    }

    /**
     * Apply event rules
     */
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

    /**
     * Process event subscriptions
     */
    private async processSubscriptions(event: SystemEvent): Promise<void> {
        const subscriptions = this.subscriptions.get(event.type) || [];

        for (const subscription of subscriptions) {
            if (!subscription.enabled) continue;

            // Apply filter if present
            if (subscription.filter && !subscription.filter(event)) {
                continue;
            }

            try {
                await subscription.handler(event);
            } catch (error: any) {
                console.error('EventBus: Subscription handler failed:', subscription.id, error);

                // Publish handler error event
                await this.publish({
                    type: 'EVENT_HANDLER_ERROR',
                    payload: {
                        subscriptionId: subscription.id,
                        event: event,
                        error: error.message
                    },
                    metadata: {
                        source: 'EventBus',
                        priority: EventPriority.HIGH,
                        correlationId: event.metadata.correlationId
                    }
                });
            }
        }
    }

    /**
     * Sort subscriptions by priority (higher priority first)
     */
    private sortSubscriptions(eventType: string): void {
        const subs = this.subscriptions.get(eventType);
        if (subs) {
            subs.sort((a, b) => b.priority - a.priority);
        }
    }

    /**
     * Sort rules by priority
     */
    private sortRules(): void {
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Update average processing time
     */
    private updateAverageProcessingTime(processingTime: number): void {
        const current = this.eventMetrics.avgProcessingTime;
        const totalProcessed = this.eventMetrics.processed;
        this.eventMetrics.avgProcessingTime = (current * (totalProcessed - 1) + processingTime) / totalProcessed;
    }

    /**
     * Initialize the event bus (for compatibility)
     */
    async initialize(): Promise<void> {
        // Initialization logic if needed
        console.log('EventBus: Initialized');
    }
}

// Global event bus instance
export const eventBus = new EventBus();

// Utility functions for common event patterns

/**
 * Helper to create an event
 */
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

/**
 * Helper to subscribe to multiple event types
 */
export function subscribeToEvents(
    eventTypes: string[],
    handler: EventHandler,
    options: {
        filter?: EventFilter;
        priority?: number;
        metadata?: EventMetadata;
    } = {}
): string[] {
    return eventTypes.map(eventType =>
        eventBus.subscribe(eventType, handler, options)
    );
}

/**
 * Helper to create event filters
 */
export const EventFilters = {
    bySource: (source: string) => (event: SystemEvent) =>
        event.metadata.source === source,

    byPriority: (priority: EventPriority) => (event: SystemEvent) =>
        event.metadata.priority === priority,

    byScope: (scope: EventScope) => (event: SystemEvent) =>
        event.metadata.scope === scope,

    byBranch: (branchId: string) => (event: SystemEvent) =>
        event.metadata.branchId === branchId,

    byBusiness: (businessId: string) => (event: SystemEvent) =>
        event.metadata.businessId === businessId,

    byUser: (userId: string) => (event: SystemEvent) =>
        event.metadata.userId === userId,

    newerThan: (timestamp: number) => (event: SystemEvent) =>
        event.metadata.timestamp! > timestamp,

    olderThan: (timestamp: number) => (event: SystemEvent) =>
        event.metadata.timestamp! < timestamp,

    combine: (...filters: EventFilter[]): EventFilter =>
        (event: SystemEvent) => filters.every(filter => filter(event))
};

// Pre-defined event types for the POS system
export const EventTypes = {
    // System Events
    SYSTEM_STARTUP: 'SYSTEM_STARTUP',
    SYSTEM_SHUTDOWN: 'SYSTEM_SHUTDOWN',
    SYSTEM_ERROR: 'SYSTEM_ERROR',

    // Hardware Events
    HARDWARE_DETECTED: 'HARDWARE_DETECTED',
    HARDWARE_CONNECTED: 'HARDWARE_CONNECTED',
    HARDWARE_DISCONNECTED: 'HARDWARE_DISCONNECTED',
    HARDWARE_ERROR: 'HARDWARE_ERROR',
    HARDWARE_DATA: 'HARDWARE_DATA',

    // Product Events
    PRODUCT_CREATED: 'PRODUCT_CREATED',
    PRODUCT_UPDATED: 'PRODUCT_UPDATED',
    PRODUCT_DELETED: 'PRODUCT_DELETED',
    PRODUCT_INVENTORY_LOW: 'PRODUCT_INVENTORY_LOW',

    // Transaction Events
    TRANSACTION_STARTED: 'TRANSACTION_STARTED',
    TRANSACTION_COMPLETED: 'TRANSACTION_COMPLETED',
    TRANSACTION_CANCELLED: 'TRANSACTION_CANCELLED',
    TRANSACTION_REFUNDED: 'TRANSACTION_REFUNDED',

    // Payment Events
    PAYMENT_PROCESSED: 'PAYMENT_PROCESSED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',

    // User Events
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    USER_PERMISSION_CHANGED: 'USER_PERMISSION_CHANGED',

    // Sync Events
    SYNC_STARTED: 'SYNC_STARTED',
    SYNC_COMPLETED: 'SYNC_COMPLETED',
    SYNC_FAILED: 'SYNC_FAILED',
    SYNC_CONFLICT: 'SYNC_CONFLICT',

    // Business Events
    BUSINESS_CREATED: 'BUSINESS_CREATED',
    BUSINESS_UPDATED: 'BUSINESS_UPDATED',
    BUSINESS_DELETED: 'BUSINESS_DELETED',

    // Branch Events
    BRANCH_CREATED: 'BRANCH_CREATED',
    BRANCH_UPDATED: 'BRANCH_UPDATED',
    BRANCH_DELETED: 'BRANCH_DELETED',
    SECURITY_THREAT_DETECTED: 'SECURITY_THREAT_DETECTED',
    SECURITY_DEFENSE_ACTIVATED: 'SECURITY_DEFENSE_ACTIVATED'
} as const;
