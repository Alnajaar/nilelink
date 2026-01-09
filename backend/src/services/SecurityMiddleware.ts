/**
 * Security Middleware for NileLink
 * Implements security headers, CSRF protection, and session management
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export class SecurityMiddleware {
  /**
   * Security headers middleware
   */
  static securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions policy
      res.setHeader('Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
      );

      // Content Security Policy
      res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' https://api.qrserver.com; " +
        "frame-ancestors 'none';"
      );

      // HSTS (HTTP Strict Transport Security) - only in production
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      next();
    };
  }

  /**
   * CSRF protection middleware
   */
  static csrfProtection() {
    const tokens = new Map<string, { token: string; expires: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Skip for API routes that don't need CSRF
      if (req.path.startsWith('/api/auth/') || req.path.startsWith('/api/public/')) {
        return next();
      }

      const sessionId = (req as any).session?.id || req.ip;
      const token = req.headers['x-csrf-token'] as string ||
                   req.body?._csrf ||
                   req.query._csrf as string;

      if (!token) {
        return res.status(403).json({
          error: 'CSRF token missing',
          message: 'Cross-site request forgery token is required'
        });
      }

      // Verify token
      const storedToken = tokens.get(sessionId);
      if (!storedToken || storedToken.token !== token || storedToken.expires < Date.now()) {
        return res.status(403).json({
          error: 'CSRF token invalid',
          message: 'Cross-site request forgery token is invalid or expired'
        });
      }

      next();
    };
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const tokens = (global as any).csrfTokens || new Map();

    tokens.set(sessionId, {
      token,
      expires: Date.now() + (60 * 60 * 1000) // 1 hour
    });

    (global as any).csrfTokens = tokens;
    return token;
  }

  /**
   * Get CSRF token for session
   */
  static getCSRFToken(sessionId: string): string | null {
    const tokens = (global as any).csrfTokens || new Map();
    const tokenData = tokens.get(sessionId);

    if (!tokenData || tokenData.expires < Date.now()) {
      return null;
    }

    return tokenData.token;
  }
}

/**
 * Session Management Service
 */
export class SessionService {
  private static sessions = new Map<string, SessionData>();
  private static deviceTracking = new Map<string, DeviceInfo[]>();

  static createSession(userId: string, deviceInfo: DeviceInfo): SessionData {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session: SessionData = {
      id: sessionId,
      userId,
      deviceInfo,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      ipAddress: deviceInfo.ipAddress
    };

    this.sessions.set(sessionId, session);

    // Track devices for user
    const userDevices = this.deviceTracking.get(userId) || [];
    userDevices.push(deviceInfo);
    // Keep only last 10 devices
    if (userDevices.length > 10) {
      userDevices.shift();
    }
    this.deviceTracking.set(userId, userDevices);

    return session;
  }

  static getSession(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  static updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  static invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  }

  static invalidateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
      }
    }
  }

  static getUserDevices(userId: string): DeviceInfo[] {
    return this.deviceTracking.get(userId) || [];
  }

  static detectNewDevice(userId: string, currentDevice: DeviceInfo): boolean {
    const userDevices = this.getUserDevices(userId);
    const isKnownDevice = userDevices.some(device =>
      device.userAgent === currentDevice.userAgent &&
      device.ipAddress === currentDevice.ipAddress
    );

    return !isKnownDevice;
  }
}

export interface SessionData {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  ipAddress: string;
}

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  platform?: string;
  browser?: string;
  location?: string;
  isMobile: boolean;
  fingerprint?: string;
}

/**
 * Brute Force Protection
 */
export class BruteForceProtection {
  private static attempts = new Map<string, LoginAttempt[]>();
  private static blockedIPs = new Map<string, { blockedUntil: Date; reason: string }>();

  static recordFailedAttempt(identifier: string, ipAddress: string): void {
    const attempts = this.attempts.get(identifier) || [];
    attempts.push({
      timestamp: new Date(),
      ipAddress
    });

    // Keep only last 10 attempts per identifier
    if (attempts.length > 10) {
      attempts.shift();
    }

    this.attempts.set(identifier, attempts);

    // Check if should block
    const recentAttempts = attempts.filter(attempt =>
      attempt.timestamp.getTime() > Date.now() - (15 * 60 * 1000) // Last 15 minutes
    );

    if (recentAttempts.length >= 5) {
      // Block IP for 15 minutes
      this.blockedIPs.set(ipAddress, {
        blockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        reason: 'Too many failed login attempts'
      });
    }
  }

  static isBlocked(ipAddress: string): { blocked: boolean; reason?: string; remainingTime?: number } {
    const blockInfo = this.blockedIPs.get(ipAddress);

    if (!blockInfo) {
      return { blocked: false };
    }

    if (blockInfo.blockedUntil.getTime() < Date.now()) {
      // Block expired, remove it
      this.blockedIPs.delete(ipAddress);
      return { blocked: false };
    }

    return {
      blocked: true,
      reason: blockInfo.reason,
      remainingTime: Math.ceil((blockInfo.blockedUntil.getTime() - Date.now()) / (60 * 1000))
    };
  }

  static clearBlocks(identifier?: string, ipAddress?: string): void {
    if (identifier) {
      this.attempts.delete(identifier);
    }

    if (ipAddress) {
      this.blockedIPs.delete(ipAddress);
    }
  }
}

export interface LoginAttempt {
  timestamp: Date;
  ipAddress: string;
}
