import { PrismaClient } from '@prisma/client';
import { DomainEvent, EventSnapshot } from '../models/Event';
import { logger } from '../utils/logger';

export class EventStore {
    constructor(private prisma: PrismaClient) { }

    async saveEvents(events: DomainEvent[]): Promise<void> {
        if (events.length === 0) return;

        try {
            await this.prisma.domainEvent.createMany({
                data: events.map(event => ({
                    id: event.id,
                    eventType: event.eventType,
                    aggregateId: event.aggregateId,
                    aggregateType: event.aggregateType,
                    eventData: event.eventData,
                    metadata: event.metadata,
                    timestamp: event.timestamp,
                    version: event.version,
                    correlationId: event.correlationId,
                    causationId: event.causationId,
                })),
            });

            logger.info(`Saved ${events.length} events to event store`, {
                aggregateId: events[0].aggregateId,
                aggregateType: events[0].aggregateType,
            });
        } catch (error) {
            logger.error('Failed to save events', { error, eventCount: events.length });
            throw error;
        }
    }

    async getEvents(aggregateId: string, aggregateType: string, fromVersion?: number): Promise<DomainEvent[]> {
        try {
            const events = await this.prisma.domainEvent.findMany({
                where: {
                    aggregateId,
                    aggregateType,
                    ...(fromVersion && { version: { gt: fromVersion } }),
                },
                orderBy: { version: 'asc' },
            });

            return events.map((event: any) => ({
                id: event.id,
                eventType: event.eventType,
                aggregateId: event.aggregateId,
                aggregateType: event.aggregateType,
                eventData: event.eventData as Record<string, any>,
                metadata: event.metadata as Record<string, any>,
                timestamp: event.timestamp,
                version: event.version,
                correlationId: event.correlationId || undefined,
                causationId: event.causationId || undefined,
            }));
        } catch (error) {
            logger.error('Failed to get events', { error, aggregateId, aggregateType });
            throw error;
        }
    }

    async saveSnapshot(snapshot: EventSnapshot): Promise<void> {
        try {
            await this.prisma.eventSnapshot.upsert({
                where: {
                    aggregateId_aggregateType_version: {
                        aggregateId: snapshot.aggregateId,
                        aggregateType: snapshot.aggregateType,
                        version: snapshot.version,
                    },
                },
                update: {
                    snapshotData: snapshot.snapshotData,
                    timestamp: snapshot.timestamp,
                },
                create: {
                    id: snapshot.id,
                    aggregateId: snapshot.aggregateId,
                    aggregateType: snapshot.aggregateType,
                    snapshotData: snapshot.snapshotData,
                    version: snapshot.version,
                    timestamp: snapshot.timestamp,
                },
            });

            logger.info('Saved event snapshot', {
                aggregateId: snapshot.aggregateId,
                aggregateType: snapshot.aggregateType,
                version: snapshot.version,
            });
        } catch (error) {
            logger.error('Failed to save snapshot', { error, snapshot });
            throw error;
        }
    }

    async getLatestSnapshot(aggregateId: string, aggregateType: string): Promise<EventSnapshot | null> {
        try {
            const snapshot = await this.prisma.eventSnapshot.findFirst({
                where: { aggregateId, aggregateType },
                orderBy: { version: 'desc' },
            });

            if (!snapshot) return null;

            return {
                id: snapshot.id,
                aggregateId: snapshot.aggregateId,
                aggregateType: snapshot.aggregateType,
                snapshotData: snapshot.snapshotData as Record<string, any>,
                version: snapshot.version,
                timestamp: snapshot.timestamp,
            };
        } catch (error) {
            logger.error('Failed to get latest snapshot', { error, aggregateId, aggregateType });
            throw error;
        }
    }

    async getEventsByType(eventType: string, limit: number = 100): Promise<DomainEvent[]> {
        try {
            const events = await this.prisma.domainEvent.findMany({
                where: { eventType },
                orderBy: { timestamp: 'desc' },
                take: limit,
            });

            return events.map((event: any) => ({
                id: event.id,
                eventType: event.eventType,
                aggregateId: event.aggregateId,
                aggregateType: event.aggregateType,
                eventData: event.eventData as Record<string, any>,
                metadata: event.metadata as Record<string, any>,
                timestamp: event.timestamp,
                version: event.version,
                correlationId: event.correlationId || undefined,
                causationId: event.causationId || undefined,
            }));
        } catch (error) {
            logger.error('Failed to get events by type', { error, eventType });
            throw error;
        }
    }

    async rebuildProjection(aggregateId: string, aggregateType: string): Promise<DomainEvent[]> {
        try {
            const events = await this.prisma.domainEvent.findMany({
                where: { aggregateId, aggregateType },
                orderBy: { version: 'asc' },
            });

            logger.info(`Rebuilding projection with ${events.length} events`, { aggregateId, aggregateType });

            return events.map((event: any) => ({
                id: event.id,
                eventType: event.eventType,
                aggregateId: event.aggregateId,
                aggregateType: event.aggregateType,
                eventData: event.eventData as Record<string, any>,
                metadata: event.metadata as Record<string, any>,
                timestamp: event.timestamp,
                version: event.version,
                correlationId: event.correlationId || undefined,
                causationId: event.causationId || undefined,
            }));
        } catch (error) {
            logger.error('Failed to rebuild projection', { error, aggregateId, aggregateType });
            throw error;
        }
    }
}