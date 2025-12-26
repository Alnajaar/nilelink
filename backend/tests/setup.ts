import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

// Mock Prisma Client for unit tests
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        domainEvent: {
            createMany: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        eventSnapshot: {
            upsert: jest.fn(),
            findFirst: jest.fn(),
        },
    })),
}));

// Mock logger
jest.mock('../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    },
}));

// Global test utilities
global.testUtils = {
    createMockEvent: (overrides = {}) => ({
        id: 'test-event-id',
        eventType: 'TEST_EVENT',
        aggregateId: 'test-aggregate-id',
        aggregateType: 'TestAggregate',
        eventData: { test: 'data' },
        metadata: {},
        timestamp: new Date(),
        version: 1,
        correlationId: 'test-correlation-id',
        causationId: 'test-causation-id',
        ...overrides,
    }),

    createMockSnapshot: (overrides = {}) => ({
        id: 'test-snapshot-id',
        aggregateId: 'test-aggregate-id',
        aggregateType: 'TestAggregate',
        snapshotData: { test: 'snapshot' },
        version: 1,
        timestamp: new Date(),
        ...overrides,
    }),
};