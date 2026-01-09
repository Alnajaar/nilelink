import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { databasePool } from './DatabasePoolService';
import { cacheService } from './CacheService';
import { monitoringService } from './MonitoringService';
import { circuitBreaker } from './CircuitBreakerService';

export enum HealthStatus {
    HEALTHY = 'healthy',
    DEGRADED = 'degraded',
    UNHEALTHY = 'unhealthy'
}

export interface HealthCheckResult {
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    version: string;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
        monitoring: ServiceHealth;
        circuitBreaker: ServiceHealth;
    };
    metrics: {
        responseTime: number;
        memoryUsage: NodeJS.MemoryUsage;
        activeConnections: number;
    };
    alerts: any[];
}

export interface ServiceHealth {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
    details?: any;
}

export class HealthCheckService {
    private startTime: number;

    constructor() {
        this.startTime = Date.now();
    }

    async performFullHealthCheck(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        const results = await Promise.allSettled([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkMonitoring(),
            this.checkCircuitBreaker()
        ]);

        const services = {
            database: this.extractServiceResult(results[0]),
            redis: this.extractServiceResult(results[1]),
            monitoring: this.extractServiceResult(results[2]),
            circuitBreaker: this.extractServiceResult(results[3])
        };

        // Determine overall health status
        const hasFailures = Object.values(services).some(s => s.status === 'down');
        const hasDegradations = Object.values(services).some(s => s.status === 'degraded');

        let overallStatus = HealthStatus.HEALTHY;
        if (hasFailures) {
            overallStatus = HealthStatus.UNHEALTHY;
        } else if (hasDegradations) {
            overallStatus = HealthStatus.DEGRADED;
        }

        const responseTime = Date.now() - startTime;

        // Get alerts from monitoring service
        let alerts: any[] = [];
        try {
            alerts = await monitoringService.getAlerts(5);
        } catch (error) {
            logger.warn('Failed to get alerts for health check', { error });
        }

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: process.env.npm_package_version || '1.0.0',
            services,
            metrics: {
                responseTime,
                memoryUsage: process.memoryUsage(),
                activeConnections: databasePool.getConnectionCount()
            },
            alerts
        };
    }

    private async checkDatabase(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            await databasePool.executeQuery('health-check', async (prisma) => {
                return await prisma.$queryRaw`SELECT 1 as health_check`;
            }, { timeout: 5000 });

            return {
                status: 'up',
                responseTime: Date.now() - startTime,
                details: await databasePool.getMetrics()
            };
        } catch (error) {
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Database check failed'
            };
        }
    }

    private async checkRedis(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const health = await cacheService.healthCheck();

            if (health) {
                return {
                    status: 'up',
                    responseTime: Date.now() - startTime,
                    details: await cacheService.getStats()
                };
            } else {
                return {
                    status: 'down',
                    responseTime: Date.now() - startTime,
                    error: 'Redis health check failed'
                };
            }
        } catch (error) {
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Redis check failed'
            };
        }
    }

    private async checkMonitoring(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const healthStatus = await monitoringService.getHealthStatus();

            if (healthStatus.status === 'healthy') {
                return {
                    status: 'up',
                    responseTime: Date.now() - startTime,
                    details: healthStatus
                };
            } else {
                return {
                    status: 'degraded',
                    responseTime: Date.now() - startTime,
                    details: healthStatus
                };
            }
        } catch (error) {
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Monitoring check failed'
            };
        }
    }

    private async checkCircuitBreaker(): Promise<ServiceHealth> {
        try {
            const stats = circuitBreaker.getStats();

            // Check if any circuits are open (failing)
            const openCircuits = Object.values(stats).filter((stat: any) => stat.state === 'OPEN');

            if (openCircuits.length > 0) {
                return {
                    status: 'degraded',
                    details: {
                        openCircuits: openCircuits.length,
                        totalCircuits: Object.keys(stats).length,
                        stats
                    }
                };
            }

            return {
                status: 'up',
                details: stats
            };
        } catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.message : 'Circuit breaker check failed'
            };
        }
    }

    private extractServiceResult(result: PromiseSettledResult<any>): ServiceHealth {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return {
                status: 'down',
                error: result.reason?.message || 'Service check failed'
            };
        }
    }

    // Express middleware for health checks
    async healthCheckMiddleware(req: Request, res: Response): Promise<void> {
        try {
            const healthResult = await this.performFullHealthCheck();

            const statusCode = healthResult.status === HealthStatus.HEALTHY ? 200 :
                             healthResult.status === HealthStatus.DEGRADED ? 200 : 503;

            res.status(statusCode).json(healthResult);

            // Log unhealthy status
            if (healthResult.status !== HealthStatus.HEALTHY) {
                logger.warn('Health check detected issues', {
                    status: healthResult.status,
                    services: healthResult.services,
                    alerts: healthResult.alerts.length
                });
            }

        } catch (error) {
            logger.error('Health check middleware failed', { error });
            res.status(503).json({
                status: HealthStatus.UNHEALTHY,
                timestamp: new Date().toISOString(),
                error: 'Health check system failure'
            });
        }
    }

    // Detailed health check for internal monitoring
    async detailedHealthCheck(req: Request, res: Response): Promise<void> {
        try {
            const healthResult = await this.performFullHealthCheck();

            // Add additional internal metrics
            const detailedResult = {
                ...healthResult,
                system: {
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version,
                    pid: process.pid,
                    environment: process.env.NODE_ENV
                },
                process: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpuUsage: process.cpuUsage(),
                    resourceUsage: process.resourceUsage()
                }
            };

            res.json(detailedResult);

        } catch (error) {
            logger.error('Detailed health check failed', { error });
            res.status(500).json({
                status: HealthStatus.UNHEALTHY,
                error: 'Detailed health check failed'
            });
        }
    }

    // Readiness check for Kubernetes/load balancers
    async readinessCheck(req: Request, res: Response): Promise<void> {
        try {
            // Quick checks for essential services
            const [dbHealthy, redisHealthy] = await Promise.all([
                databasePool.isConnectionHealthy(),
                cacheService.healthCheck()
            ]);

            if (dbHealthy && redisHealthy) {
                res.status(200).json({
                    status: 'ready',
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(503).json({
                    status: 'not ready',
                    timestamp: new Date().toISOString(),
                    database: dbHealthy,
                    redis: redisHealthy
                });
            }

        } catch (error) {
            res.status(503).json({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Readiness check failed'
            });
        }
    }

    // Liveness check for Kubernetes
    async livenessCheck(req: Request, res: Response): Promise<void> {
        // Simple check - if we can respond, we're alive
        res.status(200).json({
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000)
        });
    }
}

// Global health check service instance
export const healthCheckService = new HealthCheckService();
