import { EventStore } from '../../../src/services/EventStore';
import { DomainEvent, EventSnapshot } from '../../../src/models/Event';
import { PrismaClient } from '@prisma/client';

describe('EventStore', () => {
    let eventStore: EventStore;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        eventStore = new EventStore(mockPrisma);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('saveEvents', () => {
        it('should save multiple events successfully', async () => {
            const events: DomainEvent[] = [
                global.testUtils.createMockEvent({
                    id: 'event-1',
                    eventType: 'ORDER_CREATED',
                    aggregateId: 'order-123',
                    aggregateType: 'Order',
                }),
                global.testUtils.createMockEvent({
                    id: 'event-2',
                    eventType: 'ORDER_UPDATED',
                    aggregateId: 'order-123',
                    aggregateType: 'Order',
                    version: 2,
                }),
            ];

            mockPrisma.domainEvent.createMany.mockResolvedValue({ count: 2 });

            await eventStore.saveEvents(events);

            expect(mockPrisma.domainEvent.createMany).toHaveBeenCalledWith({
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
        });

        it('should not save empty event array', async () => {
            await eventStore.saveEvents([]);

            expect(mockPrisma.domainEvent.createMany).not.toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            const events = [global.testUtils.createMockEvent()];
            const error = new Error('Database connection failed');

            mockPrisma.domainEvent.createMany.mockRejectedValue(error);

            await expect(eventStore.saveEvents(events)).rejects.toThrow(error);
        });
    });

    describe('getEvents', () => {
        it('should retrieve events for an aggregate', async () => {
            const mockDbEvents = [
                {
                    id: 'event-1',
                    eventType: 'ORDER_CREATED',
                    aggregateId: 'order-123',
                    aggregateType: 'Order',
                    eventData: { customerId: 'user-456' },
                    metadata: { source: 'api' },
                    timestamp: new Date('2024-01-01'),
                    version: 1,
                    correlationId: 'corr-123',
                    causationId: 'cause-123',
                },
            ];

            mockPrisma.domainEvent.findMany.mockResolvedValue(mockDbEvents);

            const events = await eventStore.getEvents('order-123', 'Order');

            expect(mockPrisma.domainEvent.findMany).toHaveBeenCalledWith({
                where: {
                    aggregateId: 'order-123',
                    aggregateType: 'Order',
                    ...(undefined && { version: { gt: undefined } }),
                },
                orderBy: { version: 'asc' },
            });

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                id: 'event-1',
                eventType: 'ORDER_CREATED',
                aggregateId: 'order-123',
                aggregateType: 'Order',
                eventData: { customerId: 'user-456' },
                metadata: { source: 'api' },
                timestamp: new Date('2024-01-01'),
                version: 1,
                correlationId: 'corr-123',
                causationId: 'cause-123',
            });
        });

        it('should filter events by version', async () => {
            mockPrisma.domainEvent.findMany.mockResolvedValue([]);

            await eventStore.getEvents('order-123', 'Order', 5);

            expect(mockPrisma.domainEvent.findMany).toHaveBeenCalledWith({
                where: {
                    aggregateId: 'order-123',
                    aggregateType: 'Order',
                    version: { gt: 5 },
                },
                orderBy: { version: 'asc' },
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Query failed');
            mockPrisma.domainEvent.findMany.mockRejectedValue(error);

            await expect(eventStore.getEvents('order-123', 'Order')).rejects.toThrow(error);
        });
    });

    describe('saveSnapshot', () => {
        it('should save a new snapshot', async () => {
            const snapshot = global.testUtils.createMockSnapshot();

            mockPrisma.eventSnapshot.upsert.mockResolvedValue(snapshot);

            await eventStore.saveSnapshot(snapshot);

            expect(mockPrisma.eventSnapshot.upsert).toHaveBeenCalledWith({
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
                create: snapshot,
            });
        });

        it('should handle upsert errors', async () => {
            const snapshot = global.testUtils.createMockSnapshot();
            const error = new Error('Upsert failed');

            mockPrisma.eventSnapshot.upsert.mockRejectedValue(error);

            await expect(eventStore.saveSnapshot(snapshot)).rejects.toThrow(error);
        });
    });

    describe('getLatestSnapshot', () => {
        it('should return the latest snapshot', async () => {
            const mockSnapshot = {
                id: 'snapshot-1',
                aggregateId: 'order-123',
                aggregateType: 'Order',
                snapshotData: { status: 'confirmed' },
                version: 5,
                timestamp: new Date('2024-01-01'),
            };

            mockPrisma.eventSnapshot.findFirst.mockResolvedValue(mockSnapshot);

            const snapshot = await eventStore.getLatestSnapshot('order-123', 'Order');

            expect(mockPrisma.eventSnapshot.findFirst).toHaveBeenCalledWith({
                where: { aggregateId: 'order-123', aggregateType: 'Order' },
                orderBy: { version: 'desc' },
            });

            expect(snapshot).toMatchObject({
                id: 'snapshot-1',
                aggregateId: 'order-123',
                aggregateType: 'Order',
                snapshotData: { status: 'confirmed' },
                version: 5,
                timestamp: new Date('2024-01-01'),
            });
        });

        it('should return null when no snapshot exists', async () => {
            mockPrisma.eventSnapshot.findFirst.mockResolvedValue(null);

            const snapshot = await eventStore.getLatestSnapshot('order-123', 'Order');

            expect(snapshot).toBeNull();
        });
    });

    describe('getEventsByType', () => {
        it('should retrieve events by type with default limit', async () => {
            const mockEvents = [
                global.testUtils.createMockEvent({ eventType: 'ORDER_CREATED' }),
                global.testUtils.createMockEvent({ eventType: 'ORDER_CREATED' }),
            ];

            mockPrisma.domainEvent.findMany.mockResolvedValue(mockEvents);

            const events = await eventStore.getEventsByType('ORDER_CREATED');

            expect(mockPrisma.domainEvent.findMany).toHaveBeenCalledWith({
                where: { eventType: 'ORDER_CREATED' },
                orderBy: { timestamp: 'desc' },
                take: 100,
            });

            expect(events).toHaveLength(2);
        });

        it('should respect custom limit', async () => {
            mockPrisma.domainEvent.findMany.mockResolvedValue([]);

            await eventStore.getEventsByType('PAYMENT_PROCESSED', 50);

            expect(mockPrisma.domainEvent.findMany).toHaveBeenCalledWith({
                where: { eventType: 'PAYMENT_PROCESSED' },
                orderBy: { timestamp: 'desc' },
                take: 50,
            });
        });
    });

    describe('rebuildProjection', () => {
        it('should rebuild projection with all events', async () => {
            const mockEvents = [
                global.testUtils.createMockEvent({ version: 1 }),
                global.testUtils.createMockEvent({ version: 2 }),
                global.testUtils.createMockEvent({ version: 3 }),
            ];

            mockPrisma.domainEvent.findMany.mockResolvedValue(mockEvents);

            const events = await eventStore.rebuildProjection('order-123', 'Order');

            expect(mockPrisma.domainEvent.findMany).toHaveBeenCalledWith({
                where: { aggregateId: 'order-123', aggregateType: 'Order' },
                orderBy: { version: 'asc' },
            });

            expect(events).toHaveLength(3);
            expect(events[0].version).toBe(1);
            expect(events[1].version).toBe(2);
            expect(events[2].version).toBe(3);
        });
    });
});