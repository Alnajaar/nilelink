import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from './utils/logger';
import app, { server, io } from './app';
import { BlockchainService } from './services/BlockchainService';
import NotificationMeshServer from './services/NotificationMeshServer';
import { selfHealingAgent } from './services/SelfHealingAgent';
import { databasePool } from './services/DatabasePoolService';
import { distributedTracing } from './services/DistributedTracingService';

const blockchainService = new BlockchainService();

const prisma = new PrismaClient();
const PORT = config.port;

async function main() {
    try {
        // Initialize Notification Mesh
        const notificationMesh = new NotificationMeshServer(server);
        logger.info('🌐 Notification Mesh initialized');

        // Start Blockchain Listener (background)
        blockchainService.startListener().catch(err => {
            logger.error('🔗 Blockchain listener failed to start:', err);
        });
        logger.info('🔗 Blockchain listener initialization started');

        // Start Self-Healing Agent
        await selfHealingAgent.startMonitoring();
        logger.info('🤖 Self-Healing Agent activated');

        // Check Database Pool Health
        const dbHealthy = await databasePool.isConnectionHealthy();
        if (dbHealthy) {
            logger.info('🗄️ Database Pool initialized and healthy');
        }

        // Initialize Trace Cleanup Interval (every hour)
        setInterval(() => {
            distributedTracing.cleanupOldTraces();
        }, 60 * 60 * 1000);

        // Start server
        server.listen(PORT, () => {
            logger.info(`🚀 NileLink Backend Server running on port ${PORT}`);
            logger.info(`📱 Environment: ${config.nodeEnv}`);
            logger.info(`🗄️  Database: ${config.database.url ? 'Connected' : 'Not configured'}`);
            logger.info(`🔗 Redis: ${config.redis.url ? 'Connected' : 'Not configured'}`);
        });

    } catch (error) {
        logger.error('Failed to start services:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');

    // Stop self-healing agent
    selfHealingAgent.stopMonitoring();

    // Close database pool connection
    await databasePool.gracefulShutdown();

    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');

    // Stop self-healing agent
    selfHealingAgent.stopMonitoring();

    // Close database pool connection
    await databasePool.gracefulShutdown();

    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Start the application
main();

export default server;
