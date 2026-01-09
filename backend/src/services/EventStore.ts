import { PrismaClient } from '@prisma/client';
import { DomainEvent, EventSnapshot } from '../models/Event';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';
const Ajv = require('ajv');

export class EventStore {
    private encryptionKey: Buffer;
    private integrityKey: Buffer;
    private eventSchemas: Map<string, any>;
    private ajv: any;

    constructor(private prisma: PrismaClient) {
        // Initialize encryption keys from environment
        this.encryptionKey = Buffer.from(config.encryption.eventEncryptionKey, 'hex');
        this.integrityKey = Buffer.from(config.encryption.integrityKey, 'hex');

        // Initialize schema validation
        this.eventSchemas = new Map();
        this.ajv = new Ajv({ allErrors: true });
        this.loadEventSchemas();
    }

    private loadEventSchemas(): void {
        try {
            const schemaPath = path.join(__dirname, '../../Event_Types.json');
            const schemaData = fs.readFileSync(schemaPath, 'utf8');
            const schemaJson = JSON.parse(schemaData);

            if (schemaJson.events) {
                for (const [eventName, eventSchema] of Object.entries(schemaJson.events)) {
                    if ((eventSchema as any).payloadSchema) {
                        this.eventSchemas.set(eventName, (eventSchema as any).payloadSchema);
                        // Compile schema for validation
                        try {
                            this.ajv.compile((eventSchema as any).payloadSchema);
                        } catch (compileError) {
                            logger.warn(`Failed to compile schema for event ${eventName}`, { error: compileError });
                        }
                    }
                }
            }

            logger.info(`Loaded ${this.eventSchemas.size} event schemas`);
        } catch (error) {
            logger.error('Failed to load event schemas', { error });
            // Continue without schema validation if file is not found
        }
    }

    private encryptData(data: any): { encrypted: string; iv: string; hash: string } {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
        cipher.setAAD(Buffer.from('event-data'));

        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();
        const hash = crypto.createHmac('sha256', this.integrityKey)
            .update(encrypted + iv.toString('hex') + authTag.toString('hex'))
            .digest('hex');

        return {
            encrypted: encrypted + ':' + authTag.toString('hex'),
            iv: iv.toString('hex'),
            hash
        };
    }

    private decryptData(encrypted: string, iv: string, hash: string): any {
        // Verify integrity first
        const [data, authTagHex] = encrypted.split(':');
        const computedHash = crypto.createHmac('sha256', this.integrityKey)
            .update(data + iv + authTagHex)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))) {
            throw new Error('Event data integrity check failed');
        }

        const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
        decipher.setAAD(Buffer.from('event-data'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    }

    async saveEvents(events: DomainEvent[]): Promise<void> {
        if (events.length === 0) return;

        try {
            // Check for version conflicts (optimistic locking)
            for (const event of events) {
                const latestVersion = await this.getLatestVersion(event.aggregateId, event.aggregateType);
                if (event.version !== latestVersion + 1) {
                    throw new Error(`Version conflict for aggregate ${event.aggregateId}: expected ${latestVersion + 1}, got ${event.version}`);
                }
            }

            const encryptedEvents = await Promise.all(events.map(async event => {
                // Encrypt sensitive event data
                const { encrypted, iv, hash } = this.encryptData(event.eventData);

                return {
                    id: event.id,
                    eventType: event.eventType,
                    aggregateId: event.aggregateId,
                    aggregateType: event.aggregateType,
                    eventData: encrypted,
                    eventDataIv: iv,
                    eventDataHash: hash,
                    metadata: event.metadata,
                    timestamp: event.timestamp,
                    version: event.version,
                    correlationId: event.correlationId,
                    causationId: event.causationId,
                    createdAt: new Date(),
                };
            }));

            await this.prisma.domainEvent.createMany({
                data: encryptedEvents,
            });

            // Update aggregate version tracking
            const aggregateVersions = events.reduce((acc, event) => {
                const key = `${event.aggregateType}:${event.aggregateId}`;
                acc[key] = Math.max(acc[key] || 0, event.version);
                return acc;
            }, {} as Record<string, number>);

            for (const [key, version] of Object.entries(aggregateVersions)) {
                const [aggregateType, aggregateId] = key.split(':');
                await this.prisma.aggregateVersion.upsert({
                    where: {
                        aggregateId_aggregateType: { aggregateId, aggregateType }
                    },
                    update: { version, updatedAt: new Date() },
                    create: {
                        aggregateId,
                        aggregateType,
                        version,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            }

            logger.info(`Saved ${events.length} encrypted events to event store`, {
                aggregateId: events[0].aggregateId,
                aggregateType: events[0].aggregateType,
            });
        } catch (error) {
            logger.error('Failed to save events', { error, eventCount: events.length });
            throw error;
        }
    }

    private async getLatestVersion(aggregateId: string, aggregateType: string): Promise<number> {
        const aggregateVersion = await this.prisma.aggregateVersion.findUnique({
            where: {
                aggregateId_aggregateType: { aggregateId, aggregateType }
            }
        });
        return aggregateVersion?.version || 0;
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

            // Decrypt events in parallel for better performance
            const decryptedEvents = await Promise.all(events.map(async (event: any) => {
                try {
                    const decryptedData = this.decryptData(event.eventData, event.eventDataIv, event.eventDataHash);
                    return {
                        id: event.id,
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        eventData: decryptedData,
                        metadata: event.metadata as Record<string, any>,
                        timestamp: event.timestamp,
                        version: event.version,
                        correlationId: event.correlationId || undefined,
                        causationId: event.causationId || undefined,
                    };
                } catch (decryptError) {
                    logger.error('Failed to decrypt event data', {
                        eventId: event.id,
                        error: decryptError
                    });
                    throw new Error(`Event data corruption detected for event ${event.id}`);
                }
            }));

            return decryptedEvents;
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

            const decryptedEvents = await Promise.all(events.map(async (event: any) => {
                try {
                    const decryptedData = this.decryptData(event.eventData, event.eventDataIv, event.eventDataHash);
                    return {
                        id: event.id,
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        eventData: decryptedData,
                        metadata: event.metadata as Record<string, any>,
                        timestamp: event.timestamp,
                        version: event.version,
                        correlationId: event.correlationId || undefined,
                        causationId: event.causationId || undefined,
                    };
                } catch (decryptError) {
                    logger.error('Failed to decrypt event data in getEventsByType', {
                        eventId: event.id,
                        error: decryptError
                    });
                    throw new Error(`Event data corruption detected for event ${event.id}`);
                }
            }));

            return decryptedEvents;
        } catch (error) {
            logger.error('Failed to get events by type', { error, eventType });
            throw error;
        }
    }

    async searchEvents(filters: {
        eventType?: string;
        aggregateId?: string;
        aggregateType?: string;
        correlationId?: string;
        causationId?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{ events: DomainEvent[]; total: number }> {
        try {
            const where: any = {};

            if (filters.eventType) where.eventType = filters.eventType;
            if (filters.aggregateId) where.aggregateId = filters.aggregateId;
            if (filters.aggregateType) where.aggregateType = filters.aggregateType;
            if (filters.correlationId) where.correlationId = filters.correlationId;
            if (filters.causationId) where.causationId = filters.causationId;

            if (filters.fromDate || filters.toDate) {
                where.timestamp = {};
                if (filters.fromDate) where.timestamp.gte = filters.fromDate;
                if (filters.toDate) where.timestamp.lte = filters.toDate;
            }

            const [events, total] = await Promise.all([
                this.prisma.domainEvent.findMany({
                    where,
                    orderBy: { timestamp: 'desc' },
                    take: filters.limit || 100,
                    skip: filters.offset || 0,
                }),
                this.prisma.domainEvent.count({ where })
            ]);

            const decryptedEvents = await Promise.all(events.map(async (event: any) => {
                try {
                    const decryptedData = this.decryptData(event.eventData, event.eventDataIv, event.eventDataHash);
                    return {
                        id: event.id,
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        eventData: decryptedData,
                        metadata: event.metadata as Record<string, any>,
                        timestamp: event.timestamp,
                        version: event.version,
                        correlationId: event.correlationId || undefined,
                        causationId: event.causationId || undefined,
                    };
                } catch (decryptError) {
                    logger.error('Failed to decrypt event data in searchEvents', {
                        eventId: event.id,
                        error: decryptError
                    });
                    throw new Error(`Event data corruption detected for event ${event.id}`);
                }
            }));

            return { events: decryptedEvents, total };
        } catch (error) {
            logger.error('Failed to search events', { error, filters });
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

            const decryptedEvents = await Promise.all(events.map(async (event: any) => {
                try {
                    const decryptedData = this.decryptData(event.eventData, event.eventDataIv, event.eventDataHash);
                    return {
                        id: event.id,
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        eventData: decryptedData,
                        metadata: event.metadata as Record<string, any>,
                        timestamp: event.timestamp,
                        version: event.version,
                        correlationId: event.correlationId || undefined,
                        causationId: event.causationId || undefined,
                    };
                } catch (decryptError) {
                    logger.error('Failed to decrypt event data in rebuildProjection', {
                        eventId: event.id,
                        error: decryptError
                    });
                    throw new Error(`Event data corruption detected for event ${event.id}`);
                }
            }));

            return decryptedEvents;
        } catch (error) {
            logger.error('Failed to rebuild projection', { error, aggregateId, aggregateType });
            throw error;
        }
    }

    async migrateEvents(eventType: string, fromVersion: string, toVersion: string, migrationFn: (eventData: any) => any): Promise<number> {
        try {
            // Get events of the specified type that need migration
            const events = await this.prisma.domainEvent.findMany({
                where: {
                    eventType,
                    metadata: {
                        path: ['schemaVersion'],
                        equals: fromVersion
                    }
                },
                orderBy: { timestamp: 'asc' }
            });

            let migratedCount = 0;

            for (const event of events) {
                try {
                    // Decrypt current data
                    const currentData = this.decryptData(event.eventData, event.eventDataIv, event.eventDataHash);

                    // Apply migration
                    const migratedData = migrationFn(currentData);

                    // Update metadata with new version
                    const currentMetadata = (event.metadata as Record<string, any>) || {};
                    const updatedMetadata = {
                        ...currentMetadata,
                        schemaVersion: toVersion,
                        migratedFrom: fromVersion,
                        migratedAt: new Date().toISOString()
                    };

                    // Re-encrypt with migrated data
                    const { encrypted, iv, hash } = this.encryptData(migratedData);

                    // Update event in database
                    await this.prisma.domainEvent.update({
                        where: { id: event.id },
                        data: {
                            eventData: encrypted,
                            eventDataIv: iv,
                            eventDataHash: hash,
                            metadata: updatedMetadata
                        }
                    });

                    migratedCount++;
                } catch (migrationError) {
                    logger.error('Failed to migrate event', {
                        eventId: event.id,
                        error: migrationError
                    });
                    throw new Error(`Migration failed for event ${event.id}`);
                }
            }

            logger.info(`Migrated ${migratedCount} events from ${fromVersion} to ${toVersion}`, { eventType });
            return migratedCount;
        } catch (error) {
            logger.error('Failed to migrate events', { error, eventType, fromVersion, toVersion });
            throw error;
        }
    }

    async getEventSchemaVersions(eventType: string): Promise<string[]> {
        try {
            const versions = await this.prisma.domainEvent.findMany({
                where: { eventType },
                select: {
                    metadata: true
                },
                distinct: ['metadata']
            });

            const schemaVersions = versions
                .map(v => (v.metadata as Record<string, any>)?.schemaVersion)
                .filter((v): v is string => typeof v === 'string')
                .filter((v, i, arr) => arr.indexOf(v) === i); // unique

            return schemaVersions.sort();
        } catch (error) {
            logger.error('Failed to get event schema versions', { error, eventType });
            throw error;
        }
    }

    async validateEvent(event: DomainEvent): Promise<{ valid: boolean; errors: string[] }> {
        try {
            // Basic validation rules
            const errors: string[] = [];

            if (!event.id) errors.push('Event ID is required');
            if (!event.eventType) errors.push('Event type is required');
            if (!event.aggregateId) errors.push('Aggregate ID is required');
            if (!event.aggregateType) errors.push('Aggregate type is required');
            if (!event.eventData) errors.push('Event data is required');
            if (event.version <= 0) errors.push('Version must be positive');

            // Validate timestamp is not in future (with 5 minute tolerance)
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            if (event.timestamp > now) {
                const tolerance = 5 * 60 * 1000; // 5 minutes
                if (event.timestamp > new Date(now.getTime() + tolerance)) {
                    errors.push('Event timestamp cannot be in the future');
                }
            }

            // Schema-based payload validation
            if (this.eventSchemas.has(event.eventType)) {
                try {
                    const schema = this.eventSchemas.get(event.eventType);
                    const validate = this.ajv.compile(schema);
                    const isValid = validate(event.eventData);

                    if (!isValid) {
                        const schemaErrors = validate.errors?.map((err: any) =>
                            `${err.instancePath} ${err.message}`
                        ) || ['Schema validation failed'];
                        errors.push(...schemaErrors);
                    }
                } catch (schemaError) {
                    logger.warn(`Schema validation failed for event ${event.eventType}`, { error: schemaError });
                    // Don't fail validation if schema validation fails, just log
                }
            }

            return {
                valid: errors.length === 0,
                errors
            };
        } catch (error) {
            logger.error('Failed to validate event', { error, eventId: event.id });
            return {
                valid: false,
                errors: ['Validation failed due to internal error']
            };
        }
    }
}
