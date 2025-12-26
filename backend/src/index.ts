import app from './app';
import { logger } from './utils/logger';
import { config } from './config';

const PORT = config.port;

const server = app.listen(PORT, () => {
    logger.info(`🚀 NileLink Backend Server running on port ${PORT}`);
    logger.info(`📱 Environment: ${config.nodeEnv}`);
    logger.info(`🗄️  Database: ${config.database.url ? 'Connected' : 'Not configured'}`);
    logger.info(`🔗 Redis: ${config.redis.url ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

export default server;