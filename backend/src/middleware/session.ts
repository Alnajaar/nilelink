import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/DatabasePoolService';
import { logger } from '../utils/logger';
import { rbacService, UserRole, SESSION_CONFIG } from '../services/RBACService';

interface SessionData {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    isActive: boolean;
}

/**
 * Session management middleware with security features
 */
export class SessionManager {
    private static instance: SessionManager;

    private constructor() {}

    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    /**
     * Create a new session for user login
     */
    async createSession(userId: string, req: Request): Promise<SessionData> {
        const ipAddress = this.getClientIP(req);
        const userAgent = req.get('User-Agent') || 'Unknown';

        // Deactivate old sessions if exceeding limit
        await this.enforceSessionLimit(userId);

        const session = await prisma.session.create({
            data: {
                userId,
                ipAddress,
                userAgent,
                lastActivity: new Date(),
                expiresAt: new Date(Date.now() + SESSION_CONFIG.ACCESS_TOKEN_TTL),
                isActive: true
            }
        });

        logger.info(`Session created for user ${userId} from ${ipAddress}`);

        return {
            id: session.id,
            userId: session.userId,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            expiresAt: session.expiresAt,
            isActive: session.isActive
        };
    }

    /**
     * Validate and refresh session
     */
    async validateSession(sessionId: string, req: Request): Promise<SessionData | null> {
        try {
            const session = await prisma.session.findUnique({
                where: { id: sessionId }
            });

            if (!session || !session.isActive) {
                return null;
            }

            const now = new Date();

            // Check if session expired
            if (now > session.expiresAt) {
                await this.deactivateSession(sessionId);
                logger.warn(`Session ${sessionId} expired for user ${session.userId}`);
                return null;
            }

            // Check for session inactivity timeout
            const inactiveDuration = now.getTime() - session.lastActivity.getTime();
            if (inactiveDuration > SESSION_CONFIG.INACTIVE_TIMEOUT) {
                await this.deactivateSession(sessionId);
                logger.warn(`Session ${sessionId} inactive timeout for user ${session.userId}`);
                return null;
            }

            // Check IP address change (optional security feature)
            const currentIP = this.getClientIP(req);
            if (currentIP !== session.ipAddress) {
                // Log suspicious activity but don't deactivate immediately
                logger.warn(`IP address changed for session ${sessionId}: ${session.ipAddress} -> ${currentIP}`);
                // You could implement IP whitelist/blacklist logic here
            }

            // Update last activity
            await prisma.session.update({
                where: { id: sessionId },
                data: { lastActivity: now }
            });

            return {
                id: session.id,
                userId: session.userId,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                createdAt: session.createdAt,
                lastActivity: now,
                expiresAt: session.expiresAt,
                isActive: session.isActive
            };

        } catch (error) {
            logger.error('Session validation error:', error);
            return null;
        }
    }

    /**
     * Deactivate a session
     */
    async deactivateSession(sessionId: string): Promise<void> {
        try {
            await prisma.session.update({
                where: { id: sessionId },
                data: { isActive: false }
            });
            logger.info(`Session ${sessionId} deactivated`);
        } catch (error) {
            logger.error('Session deactivation error:', error);
        }
    }

    /**
     * Deactivate all sessions for a user (logout from all devices)
     */
    async deactivateUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
        try {
            const where: any = { userId, isActive: true };
            if (exceptSessionId) {
                where.id = { not: exceptSessionId };
            }

            const result = await prisma.session.updateMany({
                where,
                data: { isActive: false }
            });

            logger.info(`${result.count} sessions deactivated for user ${userId}`);
        } catch (error) {
            logger.error('User session deactivation error:', error);
        }
    }

    /**
     * Get active sessions for a user
     */
    async getUserSessions(userId: string): Promise<SessionData[]> {
        try {
            const sessions = await prisma.session.findMany({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { lastActivity: 'desc' }
            });

            return sessions.map(session => ({
                id: session.id,
                userId: session.userId,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                expiresAt: session.expiresAt,
                isActive: session.isActive
            }));
        } catch (error) {
            logger.error('Get user sessions error:', error);
            return [];
        }
    }

    /**
     * Clean up expired sessions (should be run periodically)
     */
    async cleanupExpiredSessions(): Promise<number> {
        try {
            const result = await prisma.session.updateMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { isActive: false }
                    ]
                },
                data: { isActive: false }
            });

            if (result.count > 0) {
                logger.info(`Cleaned up ${result.count} expired sessions`);
            }

            return result.count;
        } catch (error) {
            logger.error('Session cleanup error:', error);
            return 0;
        }
    }

    /**
     * Enforce session limit per user
     */
    private async enforceSessionLimit(userId: string): Promise<void> {
        try {
            const activeSessions = await prisma.session.findMany({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { lastActivity: 'desc' }
            });

            if (activeSessions.length >= SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
                // Deactivate oldest sessions beyond the limit
                const sessionsToDeactivate = activeSessions.slice(SESSION_CONFIG.MAX_SESSIONS_PER_USER - 1);

                await prisma.session.updateMany({
                    where: {
                        id: { in: sessionsToDeactivate.map(s => s.id) }
                    },
                    data: { isActive: false }
                });

                logger.info(`Deactivated ${sessionsToDeactivate.length} old sessions for user ${userId} (limit: ${SESSION_CONFIG.MAX_SESSIONS_PER_USER})`);
            }
        } catch (error) {
            logger.error('Session limit enforcement error:', error);
        }
    }

    /**
     * Get client IP address with proxy support
     */
    private getClientIP(req: Request): string {
        // Check for forwarded headers (common with proxies/load balancers)
        const forwardedFor = req.get('X-Forwarded-For');
        if (forwardedFor) {
            // Take the first IP in case of multiple
            return forwardedFor.split(',')[0].trim();
        }

        const realIP = req.get('X-Real-IP');
        if (realIP) {
            return realIP;
        }

        // Fall back to connection remote address
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
}

export const sessionManager = SessionManager.getInstance();

// Middleware functions

/**
 * Session validation middleware
 */
export function sessionMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(); // No token, continue to auth middleware
            }

            const token = authHeader.substring(7);

            // For now, we'll assume the token contains session info
            // In production, you'd decode the JWT and extract session ID
            const sessionId = req.get('X-Session-ID') || token.substring(0, 36); // Mock extraction

            if (sessionId) {
                const session = await sessionManager.validateSession(sessionId, req);
                if (session) {
                    // Attach session info to request
                    (req as any).session = session;

                    // Check if session is about to expire and warn client
                    const timeToExpiry = session.expiresAt.getTime() - Date.now();
                    if (timeToExpiry > 0 && timeToExpiry < SESSION_CONFIG.SESSION_TIMEOUT_WARNING) {
                        res.set('X-Session-Expiring', 'true');
                        res.set('X-Session-Expires-In', timeToExpiry.toString());
                    }

                    return next();
                } else {
                    // Session invalid/expired
                    return res.status(401).json({
                        success: false,
                        error: 'Session expired or invalid',
                        code: 'SESSION_EXPIRED'
                    });
                }
            }

            next();
        } catch (error) {
            logger.error('Session middleware error:', error);
            next();
        }
    };
}

/**
 * Secure cookie configuration for refresh tokens
 */
export const secureCookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_CONFIG.REFRESH_TOKEN_TTL,
    path: '/api/auth'
};

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
        // Skip CSRF for GET, HEAD, OPTIONS
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }

        // For state-changing operations, validate CSRF token
        const csrfToken = req.get('X-CSRF-Token') || req.body?._csrf;
        const sessionToken = (req as any).session?.csrfToken;

        if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
            return res.status(403).json({
                success: false,
                error: 'CSRF token validation failed',
                code: 'CSRF_INVALID'
            });
        }

        next();
    };
}

/**
 * Rate limiting for authentication endpoints
 */
export function authRateLimit() {
    const attempts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const key = `${req.ip}-${req.path}`;
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minutes
        const maxAttempts = req.path.includes('/login') ? 5 : 3;

        const record = attempts.get(key);

        if (!record || now > record.resetTime) {
            attempts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (record.count >= maxAttempts) {
            logger.warn(`Rate limit exceeded for ${key} on ${req.path}`);
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
        }

        record.count++;
        next();
    };
}
