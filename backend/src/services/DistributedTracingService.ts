import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { cacheService } from './CacheService';

export interface TraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    service: string;
    operation: string;
    startTime: number;
    tags: Record<string, any>;
    baggage: Record<string, any>;
}

export interface TraceSpan {
    id: string;
    traceId: string;
    parentId?: string;
    name: string;
    service: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags: Record<string, any>;
    logs: TraceLog[];
    children: TraceSpan[];
}

export interface TraceLog {
    timestamp: number;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    fields?: Record<string, any>;
}

export class DistributedTracingService {
    private activeSpans: Map<string, TraceSpan> = new Map();
    private traceCacheKey = 'distributed_traces';
    private maxSpansPerTrace = 1000;
    private traceRetentionMs = 24 * 60 * 60 * 1000; // 24 hours

    // Express middleware for automatic tracing
    tracingMiddleware(serviceName: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            const traceContext = this.extractTraceContext(req, serviceName);

            // Add trace context to request
            (req as any).traceContext = traceContext;

            // Start span for this request
            const span = this.startSpan(traceContext, `${req.method} ${req.path}`);

            // Override response end to finish span
            const originalEnd = res.end;
            const spanId = span.id;
            const startTime = span.startTime;

            res.on('finish', () => {
                this.finishSpan(spanId, {
                    statusCode: res.statusCode,
                    responseTime: Date.now() - startTime,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
            });

            // Add trace headers to response
            res.set('X-Trace-Id', traceContext.traceId);
            res.set('X-Span-Id', traceContext.spanId);

            next();
        };
    }

    private extractTraceContext(req: Request, serviceName: string): TraceContext {
        // Extract trace context from headers or create new
        const traceId = req.get('X-Trace-Id') || req.get('x-trace-id') || uuidv4();
        const spanId = req.get('X-Span-Id') || req.get('x-span-id') || uuidv4();
        const parentSpanId = req.get('X-Parent-Span-Id') || req.get('x-parent-span-id');

        return {
            traceId,
            spanId,
            parentSpanId,
            service: serviceName,
            operation: `${req.method} ${req.path}`,
            startTime: Date.now(),
            tags: {
                httpMethod: req.method,
                httpUrl: req.url,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            },
            baggage: this.extractBaggage(req)
        };
    }

    private extractBaggage(req: Request): Record<string, any> {
        const baggage: Record<string, any> = {};

        // Extract common baggage items
        const userId = req.get('X-User-Id') || req.get('x-user-id');
        const tenantId = req.get('X-Tenant-Id') || req.get('x-tenant-id');
        const sessionId = req.get('X-Session-Id') || req.get('x-session-id');

        if (userId) baggage.userId = userId;
        if (tenantId) baggage.tenantId = tenantId;
        if (sessionId) baggage.sessionId = sessionId;

        return baggage;
    }

    startSpan(context: TraceContext, name: string): TraceSpan {
        const span: TraceSpan = {
            id: context.spanId,
            traceId: context.traceId,
            parentId: context.parentSpanId,
            name,
            service: context.service,
            startTime: context.startTime,
            tags: { ...context.tags },
            logs: [],
            children: []
        };

        this.activeSpans.set(span.id, span);

        logger.debug('Started trace span', {
            traceId: span.traceId,
            spanId: span.id,
            name: span.name,
            service: span.service
        });

        return span;
    }

    finishSpan(spanId: string, tags: Record<string, any> = {}): void {
        const span = this.activeSpans.get(spanId);
        if (!span) {
            logger.warn('Attempted to finish non-existent span', { spanId });
            return;
        }

        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.tags = { ...span.tags, ...tags };

        // Remove from active spans
        this.activeSpans.delete(spanId);

        // Store span in cache for later retrieval
        this.storeSpan(span);

        logger.debug('Finished trace span', {
            traceId: span.traceId,
            spanId: span.id,
            duration: span.duration,
            statusCode: tags.statusCode
        });
    }

    addSpanLog(spanId: string, level: TraceLog['level'], message: string, fields?: Record<string, any>): void {
        const span = this.activeSpans.get(spanId);
        if (!span) return;

        span.logs.push({
            timestamp: Date.now(),
            level,
            message,
            fields
        });
    }

    injectTraceContext(headers: Record<string, string>, context: TraceContext): void {
        headers['X-Trace-Id'] = context.traceId;
        headers['X-Span-Id'] = uuidv4(); // New span ID for child service
        headers['X-Parent-Span-Id'] = context.spanId;

        // Inject baggage
        if (context.baggage.userId) headers['X-User-Id'] = context.baggage.userId;
        if (context.baggage.tenantId) headers['X-Tenant-Id'] = context.baggage.tenantId;
        if (context.baggage.sessionId) headers['X-Session-Id'] = context.baggage.sessionId;
    }

    async getTrace(traceId: string): Promise<TraceSpan[] | null> {
        try {
            const cached = await cacheService.get(`trace:${traceId}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            logger.error('Failed to get trace', { traceId, error });
            return null;
        }
    }

    async getActiveSpans(): Promise<TraceSpan[]> {
        return Array.from(this.activeSpans.values());
    }

    async getTraceSummary(traceId: string): Promise<any> {
        const spans = await this.getTrace(traceId);
        if (!spans || spans.length === 0) return null;

        const rootSpan = spans.find(s => !s.parentId);
        const totalDuration = rootSpan ? rootSpan.duration || 0 : 0;
        const serviceCount = new Set(spans.map(s => s.service)).size;
        const spanCount = spans.length;

        const errors = spans.filter(s =>
            s.logs.some(log => log.level === 'error') ||
            (s.tags.statusCode && s.tags.statusCode >= 400)
        );

        return {
            traceId,
            rootOperation: rootSpan?.name || 'unknown',
            totalDuration,
            serviceCount,
            spanCount,
            errorCount: errors.length,
            startTime: Math.min(...spans.map(s => s.startTime)),
            endTime: Math.max(...spans.map(s => s.endTime || s.startTime)),
            services: Array.from(new Set(spans.map(s => s.service)))
        };
    }

    private async storeSpan(span: TraceSpan): Promise<void> {
        try {
            const traceKey = `trace:${span.traceId}`;
            const existingSpans = await this.getTrace(span.traceId) || [];

            // Limit spans per trace to prevent memory issues
            if (existingSpans.length >= this.maxSpansPerTrace) {
                logger.warn('Reached maximum spans per trace, dropping span', {
                    traceId: span.traceId,
                    spanId: span.id
                });
                return;
            }

            existingSpans.push(span);

            // Cache with expiration
            await cacheService.set(traceKey, JSON.stringify(existingSpans), this.traceRetentionMs / 1000);

        } catch (error) {
            logger.error('Failed to store span', { spanId: span.id, error });
        }
    }

    // Clean up old traces
    async cleanupOldTraces(): Promise<void> {
        try {
            // This would be implemented with Redis SCAN or similar
            // For now, rely on TTL expiration
            logger.info('Trace cleanup completed (TTL-based)');
        } catch (error) {
            logger.error('Failed to cleanup old traces', { error });
        }
    }

    // Performance monitoring
    getMetrics(): any {
        return {
            activeSpans: this.activeSpans.size,
            totalTraces: 0, // Would need to track separately
            averageSpanDuration: 0, // Would calculate from stored spans
            errorRate: 0 // Would calculate from span logs
        };
    }
}

// Global distributed tracing instance
export const distributedTracing = new DistributedTracingService();

// Helper function to get trace context from request
export function getTraceContext(req: Request): TraceContext | null {
    return (req as any).traceContext || null;
}

// Helper function to add log to current span
export function logToSpan(req: Request, level: TraceLog['level'], message: string, fields?: Record<string, any>): void {
    const context = getTraceContext(req);
    if (context) {
        distributedTracing.addSpanLog(context.spanId, level, message, fields);
    }
}
