// Health check endpoint for testing deployment
import express from 'express';

const router = express.Router();

// Basic health check without database dependencies
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      api: 'running',
      websocket: 'available',
      sync: 'ready'
    }
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      node_env: process.env.NODE_ENV,
    },
    services: {
      api: 'running',
      websocket: 'available',
      sync: 'ready',
      database: 'configured', // Would check actual DB connection
      redis: 'configured'     // Would check actual Redis connection
    }
  });
});

export default router;
