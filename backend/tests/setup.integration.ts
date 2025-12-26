import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Global test database setup
let prisma: PrismaClient;

beforeAll(async () => {
    // Set up test database
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test_db';

    // Create test database if it doesn't exist
    try {
        execSync('createdb test_db', { stdio: 'ignore' });
    } catch (error) {
        // Database might already exist
    }

    // Run migrations
    execSync('npm run db:migrate:test', { stdio: 'inherit' });

    prisma = new PrismaClient();
});

afterAll(async () => {
    // Clean up
    await prisma.$disconnect();

    // Drop test database
    try {
        execSync('dropdb test_db', { stdio: 'ignore' });
    } catch (error) {
        // Database might not exist
    }
});

beforeEach(async () => {
    // Clear all data before each test
    const tableNames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

    for (const { tablename } of tableNames) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
});

// Global test utilities for integration tests
global.integrationUtils = {
    createTestUser: async (overrides = {}) => {
        const user = await prisma.user.create({
            data: {
                id: 'test-user-id',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'CUSTOMER',
                ...overrides,
            },
        });
        return user;
    },

    createTestRestaurant: async (overrides = {}) => {
        const restaurant = await prisma.restaurant.create({
            data: {
                id: 'test-restaurant-id',
                name: 'Test Restaurant',
                address: '123 Test St',
                phone: '+1234567890',
                isActive: true,
                ...overrides,
            },
        });
        return restaurant;
    },

    createTestOrder: async (userId: string, restaurantId: string, overrides = {}) => {
        const order = await prisma.order.create({
            data: {
                id: 'test-order-id',
                orderNumber: '#TEST001',
                customerId: userId,
                restaurantId,
                status: 'PENDING',
                totalAmount: 25.99,
                taxAmount: 2.00,
                ...overrides,
            },
        });
        return order;
    },

    createTestEvent: async (overrides = {}) => {
        const event = await prisma.domainEvent.create({
            data: {
                id: 'test-event-id',
                eventType: 'TEST_EVENT',
                aggregateId: 'test-aggregate-id',
                aggregateType: 'TestAggregate',
                eventData: { test: 'data' },
                timestamp: new Date(),
                version: 1,
                ...overrides,
            },
        });
        return event;
    },
};