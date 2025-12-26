module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: [
        '**/__tests__/**/*.integration.test.ts',
        '**/?(*.)+(integration).test.ts'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.integration.ts'],
    testTimeout: 60000,
    maxWorkers: 1, // Run integration tests sequentially
    detectOpenHandles: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};