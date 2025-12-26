import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/users';
import restaurantRoutes from './api/routes/restaurants';
import orderRoutes from './api/routes/orders';
import paymentRoutes from './api/routes/payments';
import settlementRoutes from './api/routes/settlements';
import syncRoutes from './api/routes/sync';
import investorRoutes from './api/routes/investors';
import analyticsRoutes from './api/routes/analytics';

// Enterprise routes
import tenantRoutes from './api/routes/tenants';
// import shiftRoutes from './api/routes/shifts';
// import roleRoutes from './api/routes/roles';
// import importRoutes from './api/routes/imports';
// import billingRoutes from './api/routes/billing';
// import adminRoutes from './api/routes/admin';
// import apiKeyRoutes from './api/routes/apiKeys';

const app = express();
const server = createServer(app);

// Trust proxy for Cloudflare/Load Balancers
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = new Server(server, {
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

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
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

// More strict rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
});

app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/analytics', analyticsRoutes);

// Enterprise routes
app.use('/api/tenants', tenantRoutes);
// app.use('/api/shifts', shiftRoutes);
// app.use('/api/roles', roleRoutes);
// app.use('/api/imports', importRoutes);
// app.use('/api/billing', billingRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/api-keys', apiKeyRoutes);

// API documentation redirect
app.get('/api/docs', (req, res) => {
    res.redirect('/api/docs/index.html');
});

// WebSocket connection handling
io.on('connection', (socket) => {
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

// Make io available to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Export both app and server for testing
export { app, server, io };
export default app;