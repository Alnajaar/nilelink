import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from './config';
import { logger } from './utils/logger';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

// Gracefully handle missing Prisma in deployment tests
let prismaInitialized = false;
try {
    // This will fail in containers without proper DB setup
    require('@prisma/client');
    prismaInitialized = true;
} catch (error) {
    logger.warn('Prisma not available - running in limited mode');
}

// Import routes
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/users';
import restaurantRoutes from './api/routes/restaurants';
import menuRoutes from './api/routes/menus';
import orderRoutes from './api/routes/orders';
import paymentRoutes from './api/routes/payments';
import settlementRoutes from './api/routes/settlements';
import syncRoutes from './api/routes/sync';
import investorRoutes from './api/routes/investors';
import supplierRoutes from './api/routes/suppliers';
import analyticsRoutes from './api/routes/analytics';
import deliveryRoutes from './api/routes/deliveries';
import contactRoutes from './api/routes/contact';
import systemRoutes from './api/routes/system';
import marketplaceRoutes from './api/routes/marketplace';
// Enterprise routes
import tenantRoutes from './api/routes/tenants';
import shiftRoutes from './api/routes/shifts';
import roleRoutes from './api/routes/roles';
import importRoutes from './api/routes/imports';
import billingRoutes from './api/routes/billing';
import adminRoutes from './api/routes/admin';
import apiKeyRoutes from './api/routes/apiKeys';
import subscriptionRoutes from './api/routes/subscriptions';
import onboardingRoutes from './api/routes/onboarding';
import loyaltyRoutes from './api/routes/loyalty';
import aiRoutes from './api/routes/ai';
import resilienceRoutes from './api/routes/resilience';
import marketRoutes from './api/routes/market';
import { subscriptionScheduler } from './services/SubscriptionScheduler';
import { resilienceService } from './services/ResilienceService';

const app = express();
const server = createServer(app);

// Initialize Distributed Tracing early (Lazy)
app.use((req: any, res: any, next: any) => {
    const { distributedTracing } = require('./services/DistributedTracingService');
    return distributedTracing.tracingMiddleware('nilelink-backend')(req, res, next);
});

// Initialize APM Middleware (Lazy)
app.use((req: any, res: any, next: any) => {
    const { apmService, createAPMRequestMiddleware } = require('./services/APMService');
    return createAPMRequestMiddleware(apmService)(req, res, next);
});

// Trust proxy for Cloudflare/Load Balancers
app.set('trust proxy', 1);

// Initialize Socket.IO
let io: any;
if (process.env.NODE_ENV !== 'test') {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || origin.endsWith('nilelink.app') || origin.startsWith('http://localhost:')) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
} else {
    // Mock io for tests
    io = {
        on: () => { },
        emit: () => { },
        to: () => ({ emit: () => { } }),
    };
}

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Permissive for dev, enable strict in prod
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    noSniff: true,
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow if no origin (server-to-server or local file) or ends with nilelink.app
        if (!origin || origin.endsWith('nilelink.app') || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-tenant-subdomain'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Institutional Circuit Breaker (Global Monitoring)
const globalStats = {
    txVelocity: 0,
    outflowTotal: 0,
    isPaused: false,
    lastReset: Date.now()
};

app.use('/api', (req, res, next) => {
    // Reset counters every minute
    if (Date.now() - globalStats.lastReset > 60000) {
        globalStats.txVelocity = 0;
        globalStats.outflowTotal = 0;
        globalStats.lastReset = Date.now();
    }

    // Monitor Order Intensity
    if (req.method === 'POST' && req.path.includes('/orders')) {
        globalStats.txVelocity++;

        // Threshold: 50 orders/min for this node (Simulated)
        if (globalStats.txVelocity > 50 && !globalStats.isPaused) {
            logger.error('CIRCUIT BREAKER: TRANSACTION VELOCITY EXCEEDED');
            globalStats.isPaused = true;
            setTimeout(() => { globalStats.isPaused = false; }, 30000); // 30s cooling
        }
    }

    if (globalStats.isPaused && req.method === 'POST') {
        return res.status(503).json({
            success: false,
            error: 'Protocol paused due to extreme load. Cooling down.'
        });
    }

    next();
});

// More strict rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 auth requests per windowMs (Relaxed for Dev/Demo)
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
});

app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(json({ limit: '10mb' }));

// Health check endpoints (Unified)
app.use('/health', (req, res, next) => {
    // Lazy import to break circular dependencies
    const { healthCheckService } = require('./services/HealthCheckService');
    if (req.path === '/') return healthCheckService.healthCheckMiddleware(req, res);
    if (req.path === '/live') return healthCheckService.livenessCheck(req, res);
    if (req.path === '/ready') return healthCheckService.readinessCheck(req, res);
    if (req.path === '/detailed') return healthCheckService.detailedHealthCheck(req, res);
    next();
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    const client = require('prom-client');
    const register = new client.Registry();

    // Collect default metrics
    client.collectDefaultMetrics({ register });

    // Add custom metrics
    const httpRequestDurationMicroseconds = new client.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'route', 'code'],
        buckets: [0.1, 0.5, 1, 2.5, 5, 10]
    });

    register.registerMetric(httpRequestDurationMicroseconds);

    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Health routes (always available)
// app.use('/health', healthRoutes); // Removed legacy health routes

// Enterprise routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resilience', resilienceRoutes);
app.use('/api/market', marketRoutes);

// API documentation redirect
app.get('/api/docs', (req, res) => {
    res.redirect('/api/docs/index.html');
});

// WebSocket connection handling
if (process.env.NODE_ENV !== 'test') {
    // Authentication Middleware
    io.use((socket: any, next: any) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }

        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, config.jwt.secret);
            socket.data.userId = decoded.userId; // Attach userId to socket
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: any) => {
        logger.info(`Client connected: ${socket.id}`);

        // Join user-specific room
        socket.on('join', (userId: string) => {
            socket.join(`user_${userId}`);
            logger.debug(`User ${userId} joined room`);
        });

        // Join order-specific room for real-time updates
        socket.on('joinOrder', (orderId: string) => {
            socket.join(`order_${orderId}`);
            logger.debug(`Client joined order room: ${orderId}`);
        });

        // Join restaurant-specific room
        socket.on('joinRestaurant', (restaurantId: string) => {
            socket.join(`restaurant_${restaurantId}`);
            logger.debug(`Client joined restaurant room: ${restaurantId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });
}

// Make io available to routes
app.set('io', io);

// Start subscription scheduler
if (process.env.NODE_ENV !== 'test') {
    subscriptionScheduler.start();
    resilienceService.start();
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    subscriptionScheduler.stop();
    resilienceService.stop();
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    subscriptionScheduler.stop();
    resilienceService.stop();
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Export both app and server for testing
export { app, server, io };
export default app;
