import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

// Prisma mocking is disabled for hardening phase to ensure real database verification in E2E tests.
// If unit tests need mocks, use jest.doMock() within the specific test file.

/*
// Mock logger
jest.mock('../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    },
}));
*/

// Global test utilities
(global as any).testUtils = {
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