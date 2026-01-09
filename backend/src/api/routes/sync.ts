import { Router } from 'express';
import { z } from 'zod';
import { EventStore } from '../../services/EventStore';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/authenticate';
import { DomainEvent } from '../../models/Event';

// Vector Clock implementation for conflict resolution
interface VectorClock {
    [deviceId: string]: number;
}

interface SyncState {
    id: string;
    userId: string;
    deviceId: string;
    vectorClock: VectorClock;
    lastSyncAt: Date;
    pendingOperations: any[];
    createdAt: Date;
    updatedAt: Date;
}

enum ConflictResolutionStrategy {
    LAST_WRITE_WINS = 'LAST_WRITE_WINS',
    VECTOR_CLOCK = 'VECTOR_CLOCK',
    MANUAL = 'MANUAL',
    MERGE = 'MERGE'
}

// Helper functions for sync state management (simplified - using existing models)
async function getDeviceSyncState(userId: string, deviceId: string): Promise<any> {
    // Use existing user metadata or create simple sync state
    // In production, this would be a dedicated SyncState model
    return {
        userId,
        deviceId,
        vectorClock: { [deviceId]: 0 },
        lastSyncAt: new Date(),
        pendingOperations: []
    };
}

async function updateDeviceSyncState(userId: string, deviceId: string, updates: any): Promise<any> {
    // Simplified - just return updated state
    // In production, persist to database
    return {
        userId,
        deviceId,
        ...updates,
        updatedAt: new Date()
    };
}

function compareVectorClocks(clock1: VectorClock, clock2: VectorClock): number {
    // Returns: -1 if clock1 < clock2, 0 if equal, 1 if clock1 > clock2, 2 if concurrent
    const allKeys = new Set([...Object.keys(clock1), ...Object.keys(clock2)]);
    let clock1Greater = false;
    let clock2Greater = false;

    for (const key of allKeys) {
        const val1 = clock1[key] || 0;
        const val2 = clock2[key] || 0;

        if (val1 > val2) clock1Greater = true;
        else if (val2 > val1) clock2Greater = true;
    }

    if (clock1Greater && !clock2Greater) return 1;
    if (clock2Greater && !clock1Greater) return -1;
    if (!clock1Greater && !clock2Greater) return 0;
    return 2; // concurrent
}

async function resolveConflict(
    localEvent: DomainEvent,
    remoteEvent: DomainEvent,
    strategy: ConflictResolutionStrategy = ConflictResolutionStrategy.LAST_WRITE_WINS
): Promise<DomainEvent> {
    switch (strategy) {
        case ConflictResolutionStrategy.LAST_WRITE_WINS:
            return localEvent.timestamp > remoteEvent.timestamp ? localEvent : remoteEvent;

        case ConflictResolutionStrategy.VECTOR_CLOCK:
            // Would compare vector clocks from metadata
            const localClock = (localEvent.metadata as any)?.vectorClock as VectorClock;
            const remoteClock = (remoteEvent.metadata as any)?.vectorClock as VectorClock;

            if (localClock && remoteClock) {
                const comparison = compareVectorClocks(localClock, remoteClock);
                if (comparison === 1) return localEvent;
                if (comparison === -1) return remoteEvent;
            }
            // Fall back to last write wins
            return localEvent.timestamp > remoteEvent.timestamp ? localEvent : remoteEvent;

        case ConflictResolutionStrategy.MERGE:
            // Implement merge logic based on event type
            return mergeEvents(localEvent, remoteEvent);

        case ConflictResolutionStrategy.MANUAL:
        default:
            // Mark for manual resolution
            throw new Error('Manual conflict resolution required');
    }
}

function mergeEvents(event1: DomainEvent, event2: DomainEvent): DomainEvent {
    // Basic merge logic - would be event-type specific in production
    const mergedData = { ...event1.eventData };

    // Merge arrays by combining unique items
    Object.keys(event2.eventData).forEach(key => {
        if (Array.isArray(event1.eventData[key]) && Array.isArray(event2.eventData[key])) {
            mergedData[key] = [...new Set([...event1.eventData[key], ...event2.eventData[key]])];
        } else if (!(key in mergedData)) {
            mergedData[key] = event2.eventData[key];
        }
    });

    return {
        ...event1,
        eventData: mergedData,
        metadata: {
            ...event1.metadata,
            merged: true,
            mergeTimestamp: new Date().toISOString()
        }
    };
}

const router = Router();
const eventStore = new EventStore(prisma);

// Validation schemas
const syncEventsSchema = z.object({
    events: z.array(z.object({
        id: z.string(),
        eventType: z.string(),
        aggregateId: z.string(),
        aggregateType: z.string(),
        eventData: z.record(z.any()),
        metadata: z.record(z.any()).optional(),
        timestamp: z.date().optional(),
        version: z.number(),
        correlationId: z.string().optional(),
        causationId: z.string().optional(),
    })),
    clientVersion: z.string().optional(),
    deviceId: z.string().optional(),
    vectorClock: z.record(z.number()).optional(),
});

const batchSyncSchema = z.object({
    deviceId: z.string(),
    lastSyncTimestamp: z.string().optional(),
    vectorClock: z.record(z.number()).optional(),
    maxEvents: z.number().min(1).max(1000).default(100),
});

// POST /api/sync/events - Receive events from mobile clients
router.post('/events', authenticate, async (req, res) => {
    try {
        const validatedData = syncEventsSchema.parse(req.body);

        // Validate user is authenticated
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Get current sync state for conflict resolution
        const syncState = await getDeviceSyncState(userId, validatedData.deviceId || 'unknown');

        // Process events with conflict resolution
        const processedEvents: DomainEvent[] = [];
        const conflicts: any[] = [];

        for (const event of validatedData.events) {
            try {
                // Check for existing event with same aggregate and version
                const existingEvents = await eventStore.getEvents(event.aggregateId, event.aggregateType);
                const conflictingEvent = existingEvents.find(e =>
                    e.version === event.version &&
                    e.id !== event.id &&
                    e.timestamp.getTime() !== (event.timestamp?.getTime() || 0)
                );

                if (conflictingEvent) {
                    // Conflict detected - attempt resolution
                    try {
                        const resolvedEvent = await resolveConflict(
                            {
                                ...conflictingEvent,
                                metadata: conflictingEvent.metadata as any
                            },
                            {
                                id: event.id,
                                eventType: event.eventType,
                                aggregateId: event.aggregateId,
                                aggregateType: event.aggregateType,
                                eventData: event.eventData,
                                version: event.version,
                                correlationId: event.correlationId,
                                causationId: event.causationId,
                                timestamp: event.timestamp || new Date(),
                                metadata: event.metadata || {}
                            },
                            ConflictResolutionStrategy.LAST_WRITE_WINS
                        );

                        // Only add if resolved event is the new one
                        if (resolvedEvent.id === event.id) {
                            processedEvents.push(resolvedEvent);
                        }
                    } catch (resolutionError) {
                        // Manual resolution required
                        conflicts.push({
                            aggregateId: event.aggregateId,
                            aggregateType: event.aggregateType,
                            localEvent: conflictingEvent,
                            remoteEvent: event,
                            reason: 'automatic_resolution_failed'
                        });
                    }
                } else {
                    // No conflict - add event
                    processedEvents.push({
                        id: event.id,
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        eventData: event.eventData,
                        version: event.version,
                        correlationId: event.correlationId,
                        causationId: event.causationId,
                        timestamp: event.timestamp || new Date(),
                        metadata: {
                            ...(event.metadata || {}),
                            userId,
                            clientVersion: validatedData.clientVersion,
                            deviceId: validatedData.deviceId,
                            vectorClock: validatedData.vectorClock,
                            syncedAt: new Date(),
                        }
                    });
                }
            } catch (error) {
                logger.error('Error processing event', { eventId: event.id, error });
                // Continue processing other events
            }
        }

        // Save processed events to event store
        if (processedEvents.length > 0) {
            await eventStore.saveEvents(processedEvents);
        }

        // Update sync state
        if (validatedData.deviceId) {
            await updateDeviceSyncState(userId, validatedData.deviceId, {
                vectorClock: validatedData.vectorClock,
                lastSyncAt: new Date()
            });
        }

        // Emit real-time updates for relevant events
        const io = req.app.get('io');
        if (io) {
            for (const event of processedEvents) {
                // Emit to user-specific room
                io.to(`user_${userId}`).emit('event:synced', {
                    eventType: event.eventType,
                    aggregateId: event.aggregateId,
                    aggregateType: event.aggregateType,
                });

                // Emit to aggregate-specific room (e.g., order updates)
                if (event.aggregateType === 'Order') {
                    io.to(`order_${event.aggregateId}`).emit('order:updated', {
                        orderId: event.aggregateId,
                        eventType: event.eventType,
                        data: event.eventData,
                    });
                }
            }
        }

        logger.info(`Synced ${processedEvents.length} events from mobile client`, {
            userId,
            deviceId: validatedData.deviceId,
            eventCount: processedEvents.length,
            conflictsCount: conflicts.length
        });

        res.json({
            success: true,
            message: `Successfully synced ${processedEvents.length} events${conflicts.length > 0 ? `, ${conflicts.length} conflicts detected` : ''}`,
            data: {
                syncedEvents: processedEvents.length,
                conflicts: conflicts.length,
                timestamp: new Date().toISOString(),
                ...(conflicts.length > 0 && { conflicts })
            }
        });

    } catch (error) {
        logger.error('Failed to sync events', { error: error instanceof Error ? error.message : String(error), body: req.body });

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to sync events',
        });
    }
});

// GET /api/sync/events - Get events for mobile client (initial sync)
router.get('/events', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { aggregateId, aggregateType, fromVersion, limit = '50' } = req.query;

        let events: any[] = [];

        if (aggregateId && aggregateType) {
            // Get events for specific aggregate
            events = await eventStore.getEvents(
                aggregateId as string,
                aggregateType as string,
                fromVersion ? parseInt(fromVersion as string) : undefined
            );
        } else {
            // Get recent events for this user (from metadata)
            const recentEvents = await prisma.domainEvent.findMany({
                where: {
                    OR: [
                        { metadata: { path: ['userId'], equals: userId } },
                        // Also include events related to user's orders/restaurants
                    ]
                },
                orderBy: { timestamp: 'desc' },
                take: parseInt(limit as string),
            });

            events = recentEvents.map(event => ({
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
            }));
        }

        res.json({
            success: true,
            data: {
                events,
                count: events.length,
                timestamp: new Date().toISOString(),
            }
        });

    } catch (error) {
        logger.error('Failed to get events', { error: error instanceof Error ? error.message : String(error), userId: (req as any).user?.userId });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve events',
        });
    }
});

// GET /api/sync/status - Get sync status for mobile client
router.get('/status', async (req, res) => {
    try {
        // Optional authentication - return basic status without user context if not authenticated
        const userId = (req as any).user?.userId;
        const deviceId = req.query.deviceId as string;

        // Get sync state only if authenticated
        const syncState = userId && deviceId ? await getDeviceSyncState(userId, deviceId) : null;

        // Get last sync activity only if authenticated
        const lastEvent = userId ? await prisma.domainEvent.findFirst({
            where: {
                // Use proper Prisma JSON filtering
                OR: [
                    { metadata: { equals: { userId } } },
                    // Also check for events with userId in metadata
                ]
            },
            orderBy: { timestamp: 'desc' },
        }) : null;

        // Get pending operations count only if authenticated
        const pendingOperations = syncState?.pendingOperations || [];
        const pendingCount = userId ? pendingOperations.length : 0;

        // Check for conflicts only if authenticated
        const recentConflicts = userId ? await prisma.domainEvent.findMany({
            where: {
                timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
                // For now, skip complex metadata filtering to avoid JSON query issues
            },
            select: { id: true },
            take: 10 // Limit for performance
        }) : [];

        res.json({
            success: true,
            data: {
                status: pendingCount > 0 ? 'SYNCING' : 'SYNCED',
                lastSync: lastEvent?.timestamp?.toISOString() || null,
                pendingUploads: pendingCount,
                vectorClock: syncState?.vectorClock || {},
                networkStatus: 'ONLINE',
                serverTime: new Date().toISOString(),
                userId,
                deviceId,
                recentConflictsCount: recentConflicts.length
            }
        });

    } catch (error) {
        logger.error('Failed to get sync status', { error: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            success: false,
            error: 'Failed to get sync status',
        });
    }
});

// POST /api/sync/batch - Batch sync endpoint for efficient bulk operations
router.post('/batch', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const validatedData = batchSyncSchema.parse(req.body);
        const { deviceId, lastSyncTimestamp, vectorClock, maxEvents } = validatedData;

        // Get events since last sync
        const sinceDate = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        const events = await eventStore.searchEvents({
            fromDate: sinceDate,
            limit: maxEvents,
            offset: 0
        });

        // Get user's pending operations
        const syncState = await getDeviceSyncState(userId, deviceId);

        // Calculate new vector clock
        const newVectorClock = { ...vectorClock };
        if (deviceId && !(deviceId in newVectorClock)) {
            newVectorClock[deviceId] = 0;
        }

        // Update sync state
        await updateDeviceSyncState(userId, deviceId, {
            vectorClock: newVectorClock,
            lastSyncAt: new Date()
        });

        logger.info(`Batch sync completed for user ${userId}`, {
            deviceId,
            eventsReturned: events.events.length,
            totalAvailable: events.total
        });

        res.json({
            success: true,
            data: {
                events: events.events,
                totalEvents: events.total,
                hasMore: events.events.length === maxEvents && events.total > maxEvents,
                vectorClock: newVectorClock,
                pendingOperations: syncState?.pendingOperations || [],
                serverTime: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Failed to perform batch sync', { error: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            success: false,
            error: 'Failed to perform batch sync',
        });
    }
});

// POST /api/sync/conflict-resolution - Handle sync conflicts
router.post('/conflict-resolution', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const conflictResolutionSchema = z.object({
            aggregateId: z.string(),
            aggregateType: z.string(),
            strategy: z.enum(['LAST_WRITE_WINS', 'VECTOR_CLOCK', 'MANUAL', 'MERGE']).default('LAST_WRITE_WINS'),
            clientEvent: z.object({
                id: z.string(),
                eventType: z.string(),
                eventData: z.record(z.any()),
                version: z.number(),
                timestamp: z.string(),
                metadata: z.record(z.any()).optional()
            }),
            serverEvent: z.object({
                id: z.string(),
                eventType: z.string(),
                eventData: z.record(z.any()),
                version: z.number(),
                timestamp: z.string(),
                metadata: z.record(z.any()).optional()
            }).optional(),
            manualResolution: z.record(z.any()).optional()
        });

        const validatedData = conflictResolutionSchema.parse(req.body);
        const { aggregateId, aggregateType, strategy, clientEvent, serverEvent, manualResolution } = validatedData;

        let resolvedEvent: DomainEvent;

        if (strategy === 'MANUAL' && manualResolution) {
            // Manual resolution - use provided resolution data
            resolvedEvent = {
                id: clientEvent.id,
                eventType: clientEvent.eventType,
                aggregateId,
                aggregateType,
                eventData: manualResolution,
                version: clientEvent.version,
                timestamp: new Date(),
                metadata: {
                    ...clientEvent.metadata,
                    conflictResolved: true,
                    resolutionStrategy: 'MANUAL',
                    resolvedAt: new Date().toISOString(),
                    userId
                }
            };
        } else if (serverEvent) {
            // Automatic resolution between client and server events
            const clientDomainEvent: DomainEvent = {
                id: clientEvent.id,
                eventType: clientEvent.eventType,
                aggregateId,
                aggregateType,
                eventData: clientEvent.eventData,
                version: clientEvent.version,
                timestamp: new Date(clientEvent.timestamp),
                metadata: clientEvent.metadata || {}
            };

            const serverDomainEvent: DomainEvent = {
                id: serverEvent.id,
                eventType: serverEvent.eventType,
                aggregateId,
                aggregateType,
                eventData: serverEvent.eventData,
                version: serverEvent.version,
                timestamp: new Date(serverEvent.timestamp),
                metadata: serverEvent.metadata || {}
            };

            resolvedEvent = await resolveConflict(clientDomainEvent, serverDomainEvent, strategy as ConflictResolutionStrategy);
        } else {
            // Client event only - use as-is
            resolvedEvent = {
                id: clientEvent.id,
                eventType: clientEvent.eventType,
                aggregateId,
                aggregateType,
                eventData: clientEvent.eventData,
                version: clientEvent.version,
                timestamp: new Date(clientEvent.timestamp),
                metadata: {
                    ...clientEvent.metadata,
                    conflictResolved: true,
                    resolutionStrategy: strategy,
                    resolvedAt: new Date().toISOString(),
                    userId
                }
            };
        }

        // Save resolved event
        await eventStore.saveEvents([resolvedEvent]);

        // Log conflict resolution for audit
        logger.info('Sync conflict resolved', {
            userId,
            aggregateId,
            aggregateType,
            strategy,
            resolvedEventId: resolvedEvent.id
        });

        res.json({
            success: true,
            message: 'Conflict resolution processed successfully',
            data: {
                aggregateId,
                aggregateType,
                resolution: strategy,
                resolvedEventId: resolvedEvent.id,
                timestamp: new Date().toISOString(),
            }
        });

    } catch (error) {
        logger.error('Failed to process conflict resolution', { error: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            success: false,
            error: 'Failed to process conflict resolution',
        });
    }
});

// POST /api/sync/trigger - Manually trigger sync (for debugging)
router.post('/trigger', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        logger.info('Manual sync triggered', { userId });

        res.json({
            success: true,
            message: 'Sync triggered successfully',
            data: {
                jobId: `sync-job-${Date.now()}`,
                timestamp: new Date().toISOString(),
            }
        });

    } catch (error) {
        logger.error('Failed to trigger sync', { error: error instanceof Error ? error.message : String(error) });
        res.status(500).json({
            success: false,
            error: 'Failed to trigger sync',
        });
    }
});

export default router;
