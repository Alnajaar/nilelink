import { PrismaClient } from '@prisma/client';
import { EventStore } from './src/services/EventStore';
import { app } from './src/app';

console.log('Starting diagnostic...');

try {
    const prisma = new PrismaClient();
    const eventStore = new EventStore(prisma);
    console.log('Prisma and EventStore initialized');

    console.log('App loaded');
    process.exit(0);
} catch (error) {
    console.error('DIAGNOSTIC FAILURE:', error);
    process.exit(1);
}
