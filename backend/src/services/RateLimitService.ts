/**
 * Rate Limiting Service
 * Protects APIs from abuse with configurable rate limits
 */

import { Request } from 'express';

export interface RateLimitRule {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitExceeded?: (req: Request, res: any) => void;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
  retryAfter?: number;
}

export class RateLimitService {
  private static store = new Map<string, RateLimitEntry>();
  private static cleanupInterval: NodeJS.Timeout;

  // Default rate limit rules for different endpoints
  private static defaultRules: Record<string, RateLimitRule> = {
    // Authentication endpoints - strict limits
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      skipFailedRequests: false
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3
    },
    '/api/auth/forgot-password': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3
    },

    // General API endpoints
    '/api': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    },

    // Public endpoints - more lenient
    '/api/public': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 1000
    }
  };

  static {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is within rate limits
   */
  static checkLimit(
    req: Request,
    rule: RateLimitRule = this.defaultRules['/api']
  ): RateLimitResult {
    // Check if request should be skipped
    if (rule.skip && rule.skip(req)) {
      return {
        allowed: true,
        remaining: rule.maxRequests,
        resetTime: Date.now() + rule.windowMs,
        totalRequests: 0
      };
    }

    // Generate key for this request
    const key = rule.keyGenerator ? rule.keyGenerator(req) : this.generateKey(req);

    const now = Date.now();
    const windowStart = now - rule.windowMs;

    let entry = this.store.get(key);

    // Initialize or reset entry if window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + rule.windowMs,
        lastRequest: now
      };
    }

    // Check if we should skip this request type
    const shouldSkip =
      (rule.skipSuccessfulRequests && req.method === 'GET') ||
      (rule.skipFailedRequests && req.method !== 'GET');

    if (!shouldSkip) {
      entry.count++;
    }

    // Update last request time
    entry.lastRequest = now;

    // Store updated entry
    this.store.set(key, entry);

    const remaining = Math.max(0, rule.maxRequests - entry.count);
    const allowed = entry.count <= rule.maxRequests;

    if (!allowed) {
      // Call limit exceeded handler if provided
      if (rule.onLimitExceeded) {
        // We can't access res here, so this would be called by the middleware
      }
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      totalRequests: entry.count,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  /**
   * Get rate limit for a specific path
   */
  static getRuleForPath(path: string): RateLimitRule {
    // Check for exact matches first
    if (this.defaultRules[path]) {
      return this.defaultRules[path];
    }

    // Check for prefix matches
    for (const [route, rule] of Object.entries(this.defaultRules)) {
      if (path.startsWith(route)) {
        return rule;
      }
    }

    // Return default API rule
    return this.defaultRules['/api'];
  }

  /**
   * Update rate limit rule for a path
   */
  static setRule(path: string, rule: Partial<RateLimitRule>): void {
    this.defaultRules[path] = {
      ...this.defaultRules[path],
      ...rule
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  static resetKey(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current rate limit status for a key
   */
  static getStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null;
  }

  /**
   * Get all current rate limit entries (for monitoring)
   */
  static getAllEntries(): Array<{ key: string; entry: RateLimitEntry }> {
    return Array.from(this.store.entries()).map(([key, entry]) => ({
      key,
      entry
    }));
  }

  /**
   * Clean up expired entries
   */
  private static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
  }

  /**
   * Generate a unique key for rate limiting
   */
  private static generateKey(req: Request): string {
    // Use combination of IP and user ID for more granular limiting
    const ip = this.getClientIP(req);
    const userId = (req as any).user?.id || 'anonymous';
    const path = req.path;

    return `${ip}:${userId}:${path}`;
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(req: Request): string {
    // Check various headers for the real IP
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const cfConnectingIP = req.headers['cf-connecting-ip'] as string;

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();

    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  /**
   * Express middleware for rate limiting
   */
  static rateLimitMiddleware(customRule?: Partial<RateLimitRule>) {
    return (req: Request, res: any, next: Function) => {
      const rule = customRule ? { ...this.getRuleForPath(req.path), ...customRule } : this.getRuleForPath(req.path);
      const result = this.checkLimit(req, rule);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': rule.maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        'X-RateLimit-Window': rule.windowMs
      });

      if (!result.allowed) {
        res.set('Retry-After', result.retryAfter);

        // Call custom handler if provided
        if (rule.onLimitExceeded) {
          rule.onLimitExceeded(req, res);
        }

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
          limit: rule.maxRequests,
          windowMs: rule.windowMs
        });
      }

      next();
    };
  }

  /**
   * Create a strict rate limit for sensitive operations
   */
  static strictLimit(windowMs: number = 60 * 1000, maxRequests: number = 10) {
    return this.rateLimitMiddleware({
      windowMs,
      maxRequests
    });
  }

  /**
   * Create a lenient rate limit for public endpoints
   */
  static lenientLimit(windowMs: number = 60 * 60 * 1000, maxRequests: number = 1000) {
    return this.rateLimitMiddleware({
      windowMs,
      maxRequests
    });
  }
}
