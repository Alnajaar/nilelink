import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { circuitBreaker } from './CircuitBreakerService';
import { config } from '../config';

export interface CacheConfig {
    ttl: number;
    prefix: string;
    cluster?: boolean;
    redisOptions?: any;
}

export class CacheService {
    private redis: Redis;
    private isConnected: boolean = false;
    private defaultTTL: number = 3600; // 1 hour
    private prefix: string = 'nilelink:';

    constructor() {
        // Redis cluster configuration for high availability
        const redisConfig = {
            host: config.redis.host || 'localhost',
            port: config.redis.port || 6379,
            password: config.redis.password,
            db: config.redis.database || 0,
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            reconnectOnError: (err: Error) => {
                logger.warn('Redis reconnection attempt', { error: err.message });
                return err.message.includes('READONLY');
            },
            ...config.redis.clusterOptions
        };

        this.redis = new Redis(redisConfig);

        // Connection event handlers
        this.redis.on('connect', () => {
            this.isConnected = true;
            logger.info('Redis connected successfully');
        });

        this.redis.on('ready', () => {
            logger.info('Redis ready for operations');
        });

        this.redis.on('error', (err) => {
            this.isConnected = false;
            logger.error('Redis connection error', { error: err.message });
        });

        this.redis.on('close', () => {
            this.isConnected = false;
            logger.warn('Redis connection closed');
        });

        // Health check interval
        if (process.env.NODE_ENV !== 'test') {
            setInterval(() => this.healthCheck(), 30000);
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            await circuitBreaker.execute('redis-health', async () => {
                await this.redis.ping();
            });
            return true;
        } catch (error) {
            logger.error('Redis health check failed', { error });
            return false;
        }
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        return circuitBreaker.execute('redis-set', async () => {
            try {
                const serializedValue = JSON.stringify(value);
                const finalTTL = ttl || this.defaultTTL;

                await this.redis.setex(this.getKey(key), finalTTL, serializedValue);

                logger.debug('Cache set', { key, ttl: finalTTL });
            } catch (error) {
                logger.error('Cache set failed', { error, key });
                throw error;
            }
        });
    }

    async get<T = any>(key: string): Promise<T | null> {
        return circuitBreaker.execute('redis-get', async () => {
            try {
                const value = await this.redis.get(this.getKey(key));

                if (!value) {
                    return null;
                }

                const parsed = JSON.parse(value);
                logger.debug('Cache hit', { key });
                return parsed;
            } catch (error) {
                logger.error('Cache get failed', { error, key });
                return null;
            }
        });
    }

    async delete(key: string): Promise<boolean> {
        return circuitBreaker.execute('redis-delete', async () => {
            try {
                const result = await this.redis.del(this.getKey(key));
                logger.debug('Cache delete', { key, deleted: result > 0 });
                return result > 0;
            } catch (error) {
                logger.error('Cache delete failed', { error, key });
                throw error;
            }
        });
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redis.exists(this.getKey(key));
            return result > 0;
        } catch (error) {
            logger.error('Cache exists check failed', { error, key });
            return false;
        }
    }

    async expire(key: string, ttl: number): Promise<boolean> {
        return circuitBreaker.execute('redis-expire', async () => {
            try {
                const result = await this.redis.expire(this.getKey(key), ttl);
                return result > 0;
            } catch (error) {
                logger.error('Cache expire failed', { error, key });
                throw error;
            }
        });
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this.redis.ttl(this.getKey(key));
        } catch (error) {
            logger.error('Cache TTL check failed', { error, key });
            return -1;
        }
    }

    // Advanced caching methods
    async setMultiple(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
        return circuitBreaker.execute('redis-set-multiple', async () => {
            const pipeline = this.redis.pipeline();

            for (const entry of entries) {
                const serializedValue = JSON.stringify(entry.value);
                const finalTTL = entry.ttl || this.defaultTTL;
                pipeline.setex(this.getKey(entry.key), finalTTL, serializedValue);
            }

            await pipeline.exec();
            logger.debug('Cache set multiple', { count: entries.length });
        });
    }

    async getMultiple<T = any>(keys: string[]): Promise<Map<string, T>> {
        return circuitBreaker.execute('redis-get-multiple', async () => {
            try {
                const redisKeys = keys.map(key => this.getKey(key));
                const values = await this.redis.mget(redisKeys);

                const result = new Map<string, T>();
                keys.forEach((key, index) => {
                    const value = values[index];
                    if (value) {
                        try {
                            result.set(key, JSON.parse(value));
                        } catch (parseError) {
                            logger.warn('Failed to parse cached value', { key, error: parseError });
                        }
                    }
                });

                logger.debug('Cache get multiple', { requested: keys.length, found: result.size });
                return result;
            } catch (error) {
                logger.error('Cache get multiple failed', { error, keys });
                return new Map();
            }
        });
    }

    // Pub/Sub functionality
    async publish(channel: string, message: any): Promise<number> {
        return circuitBreaker.execute('redis-publish', async () => {
            try {
                const serializedMessage = JSON.stringify(message);
                const subscribers = await this.redis.publish(channel, serializedMessage);
                logger.debug('Published message', { channel, subscribers });
                return subscribers;
            } catch (error) {
                logger.error('Publish failed', { error, channel });
                throw error;
            }
        });
    }

    subscribe(channel: string, callback: (message: any, channel: string) => void): void {
        const subscriber = new Redis({
            host: config.redis.host || 'localhost',
            port: config.redis.port || 6379,
            password: config.redis.password,
        });

        subscriber.subscribe(channel, (err) => {
            if (err) {
                logger.error('Subscribe failed', { error: err, channel });
                return;
            }
            logger.info('Subscribed to channel', { channel });
        });

        subscriber.on('message', (ch, message) => {
            try {
                const parsedMessage = JSON.parse(message);
                callback(parsedMessage, ch);
            } catch (error) {
                logger.error('Failed to parse message', { error, channel: ch, message });
            }
        });
    }

    // Cache warming utilities
    async warmCache(cacheData: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
        logger.info('Starting cache warming', { items: cacheData.length });

        const batchSize = 100;
        for (let i = 0; i < cacheData.length; i += batchSize) {
            const batch = cacheData.slice(i, i + batchSize);
            await this.setMultiple(batch);
        }

        logger.info('Cache warming completed');
    }

    // Cache statistics
    async getStats(): Promise<any> {
        try {
            const info = await this.redis.info();
            const keyCount = await this.redis.dbsize();

            return {
                connected: this.isConnected,
                keys: keyCount,
                info: info,
                memory: await this.redis.memory('STATS'),
                hitRate: await this.calculateHitRate()
            };
        } catch (error) {
            logger.error('Failed to get cache stats', { error });
            return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    private async calculateHitRate(): Promise<number> {
        try {
            const info = await this.redis.info('stats');
            const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
            const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');

            const total = hits + misses;
            return total > 0 ? (hits / total) * 100 : 0;
        } catch (error) {
            return 0;
        }
    }

    // Cleanup and maintenance
    async clearPattern(pattern: string): Promise<number> {
        return circuitBreaker.execute('redis-clear-pattern', async () => {
            try {
                const keys = await this.redis.keys(`${this.prefix}${pattern}`);
                if (keys.length > 0) {
                    const result = await this.redis.del(...keys);
                    logger.info('Cleared cache pattern', { pattern, deleted: result });
                    return result;
                }
                return 0;
            } catch (error) {
                logger.error('Clear pattern failed', { error, pattern });
                throw error;
            }
        });
    }

    async disconnect(): Promise<void> {
        if (this.redis) {
            await this.redis.disconnect();
            this.isConnected = false;
            logger.info('Redis disconnected');
        }
    }
}

// Global cache service instance
export const cacheService = new CacheService();
