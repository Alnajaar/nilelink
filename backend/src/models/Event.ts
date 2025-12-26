export interface DomainEvent {
    id: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    eventData: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: Date;
    version: number;
    correlationId?: string;
    causationId?: string;
}

export interface EventSnapshot {
    id: string;
    aggregateId: string;
    aggregateType: string;
    snapshotData: Record<string, any>;
    version: number;
    timestamp: Date;
}

export type EventHandler<T = any> = (event: DomainEvent) => Promise<void>;

export abstract class AggregateRoot {
    protected _id: string;
    protected _version: number = 0;
    protected _uncommittedEvents: DomainEvent[] = [];

    constructor(id: string) {
        this._id = id;
    }

    get id(): string {
        return this._id;
    }

    get version(): number {
        return this._version;
    }

    get uncommittedEvents(): DomainEvent[] {
        return [...this._uncommittedEvents];
    }

    protected applyEvent(event: DomainEvent): void {
        this._uncommittedEvents.push(event);
        this._version++;
    }

    markEventsAsCommitted(): void {
        this._uncommittedEvents = [];
    }

    abstract get aggregateType(): string;
}