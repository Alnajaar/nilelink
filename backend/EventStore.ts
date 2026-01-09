import { PrismaClient } from '@prisma/client';
import { logger } from './src/utils/logger';

export class EventStore {
    constructor(private prisma: PrismaClient) {
        logger.info('EventStore initialized');
    }

    async logEvent(event: any): Promise<any> {
        logger.info('Event logged:', event);
        return event;
    }

    async getEvents(filter: any): Promise<any[]> {
        logger.info('Fetching events with filter:', filter);
        return [];
    }
}
