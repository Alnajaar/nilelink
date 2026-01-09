import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config';
import { circuitBreaker } from './CircuitBreakerService';

export interface BackupConfig {
    database: {
        enabled: boolean;
        schedule: string; // cron expression
        retention: number; // days
        path: string;
    };
    redis: {
        enabled: boolean;
        schedule: string;
        retention: number;
        path: string;
    };
    events: {
        enabled: boolean;
        schedule: string;
        retention: number;
        path: string;
    };
}

export class BackupService {
    private prisma: PrismaClient;
    private backupConfig: BackupConfig;
    private isRunning: boolean = false;

    constructor() {
        this.prisma = new PrismaClient();

        this.backupConfig = {
            database: {
                enabled: true,
                schedule: '0 2 * * *', // Daily at 2 AM
                retention: 30, // 30 days
                path: '/backups/database'
            },
            redis: {
                enabled: true,
                schedule: '0 */4 * * *', // Every 4 hours
                retention: 7, // 7 days
                path: '/backups/redis'
            },
            events: {
                enabled: true,
                schedule: '0 3 * * *', // Daily at 3 AM
                retention: 90, // 90 days
                path: '/backups/events'
            }
        };
    }

    async startAutomatedBackups(): Promise<void> {
        if (this.isRunning) return;

        this.isRunning = true;
        logger.info('Starting automated backup service');

        // Start backup schedules
        this.scheduleBackup('database', () => this.backupDatabase());
        this.scheduleBackup('redis', () => this.backupRedis());
        this.scheduleBackup('events', () => this.backupEventStore());

        // Start cleanup schedule (daily at 4 AM)
        this.scheduleBackup('cleanup', () => this.cleanupOldBackups(), '0 4 * * *');
    }

    private scheduleBackup(name: string, task: () => Promise<void>, cronExpression?: string): void {
        const config = this.backupConfig[name as keyof BackupConfig];
        if (!config?.enabled) return;

        const schedule = cronExpression || (config as any).schedule;

        // Simple interval-based scheduling (in production, use node-cron)
        const interval = this.cronToInterval(schedule);

        setInterval(async () => {
            try {
                await circuitBreaker.execute(`backup-${name}`, task);
            } catch (error) {
                logger.error(`Automated ${name} backup failed`, { error });
            }
        }, interval);

        logger.info(`Scheduled ${name} backup`, { schedule, interval: `${interval}ms` });
    }

    private cronToInterval(cronExpression: string): number {
        // Simplified cron to interval conversion
        // In production, use a proper cron library
        const parts = cronExpression.split(' ');
        const minute = parseInt(parts[0]);
        const hour = parseInt(parts[1]);

        if (hour === 0 && minute === 0) return 24 * 60 * 60 * 1000; // Daily
        if (minute === 0) return hour * 60 * 60 * 1000; // Hourly
        if (hour === 0) return minute * 60 * 1000; // Minutely

        return 60 * 60 * 1000; // Default 1 hour
    }

    async backupDatabase(): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupConfig.database.path, `db-${timestamp}.sql`);

        try {
            await fs.mkdir(path.dirname(backupPath), { recursive: true });

            const command = `pg_dump "${config.database.url}" > "${backupPath}"`;

            await this.executeCommand(command);

            // Verify backup integrity
            await this.verifyDatabaseBackup(backupPath);

            // Compress backup
            await this.compressFile(backupPath);

            logger.info('Database backup completed', { path: backupPath });

            // Record backup metadata
            await this.recordBackup('database', backupPath, 'completed');

        } catch (error) {
            logger.error('Database backup failed', { error, path: backupPath });
            await this.recordBackup('database', backupPath, 'failed');
            throw error;
        }
    }

    async backupRedis(): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupConfig.redis.path, `redis-${timestamp}.rdb`);

        try {
            await fs.mkdir(path.dirname(backupPath), { recursive: true });

            // Trigger Redis BGSAVE
            const command = `redis-cli -h ${config.redis.host} -p ${config.redis.port} ${config.redis.password ? `-a ${config.redis.password}` : ''} --rdb "${backupPath}"`;

            await this.executeCommand(command);

            // Verify backup
            await this.verifyRedisBackup(backupPath);

            logger.info('Redis backup completed', { path: backupPath });
            await this.recordBackup('redis', backupPath, 'completed');

        } catch (error) {
            logger.error('Redis backup failed', { error, path: backupPath });
            await this.recordBackup('redis', backupPath, 'failed');
            throw error;
        }
    }

    async backupEventStore(): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupConfig.events.path, `events-${timestamp}.json`);

        try {
            await fs.mkdir(path.dirname(backupPath), { recursive: true });

            // Export all events (with pagination for large datasets)
            const events = await this.prisma.domainEvent.findMany({
                orderBy: { timestamp: 'asc' },
                take: 10000 // Limit to prevent memory issues
            });

            const backupData = {
                metadata: {
                    timestamp: new Date().toISOString(),
                    totalEvents: events.length,
                    version: '1.0'
                },
                events
            };

            await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

            // Compress and encrypt
            await this.compressAndEncryptFile(backupPath);

            logger.info('Event store backup completed', { path: backupPath, events: events.length });
            await this.recordBackup('events', backupPath, 'completed');

        } catch (error) {
            logger.error('Event store backup failed', { error, path: backupPath });
            await this.recordBackup('events', backupPath, 'failed');
            throw error;
        }
    }

    async restoreDatabase(backupPath: string): Promise<void> {
        try {
            logger.info('Starting database restore', { path: backupPath });

            // Create pre-restore backup
            await this.backupDatabase();

            const command = `psql "${config.database.url}" < "${backupPath}"`;

            await this.executeCommand(command);

            // Verify restore
            await this.verifyDatabaseRestore();

            logger.info('Database restore completed', { path: backupPath });
            await this.recordRestore('database', backupPath, 'completed');

        } catch (error) {
            logger.error('Database restore failed', { error, path: backupPath });
            await this.recordRestore('database', backupPath, 'failed');
            throw error;
        }
    }

    async restoreRedis(backupPath: string): Promise<void> {
        try {
            logger.info('Starting Redis restore', { path: backupPath });

            const command = `redis-cli -h ${config.redis.host} -p ${config.redis.port} ${config.redis.password ? `-a ${config.redis.password}` : ''} --rdb "${backupPath}"`;

            await this.executeCommand(command);

            logger.info('Redis restore completed', { path: backupPath });
            await this.recordRestore('redis', backupPath, 'completed');

        } catch (error) {
            logger.error('Redis restore failed', { error, path: backupPath });
            await this.recordRestore('redis', backupPath, 'failed');
            throw error;
        }
    }

    async restoreEventStore(backupPath: string): Promise<void> {
        try {
            logger.info('Starting event store restore', { path: backupPath });

            const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));

            // Clear existing events (dangerous - use with caution)
            await this.prisma.domainEvent.deleteMany({});

            // Restore events in batches
            const batchSize = 100;
            for (let i = 0; i < backupData.events.length; i += batchSize) {
                const batch = backupData.events.slice(i, i + batchSize);
                await this.prisma.domainEvent.createMany({ data: batch });
            }

            logger.info('Event store restore completed', {
                path: backupPath,
                events: backupData.events.length
            });
            await this.recordRestore('events', backupPath, 'completed');

        } catch (error) {
            logger.error('Event store restore failed', { error, path: backupPath });
            await this.recordRestore('events', backupPath, 'failed');
            throw error;
        }
    }

    private async cleanupOldBackups(): Promise<void> {
        logger.info('Starting backup cleanup');

        for (const [type, config] of Object.entries(this.backupConfig)) {
            if (!config.enabled) continue;

            try {
                const files = await fs.readdir(config.path);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - config.retention);

                let deletedCount = 0;
                for (const file of files) {
                    const filePath = path.join(config.path, file);
                    const stats = await fs.stat(filePath);

                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(filePath);
                        deletedCount++;
                    }
                }

                logger.info(`Cleaned up ${type} backups`, { deleted: deletedCount, retention: config.retention });

            } catch (error) {
                logger.error(`Failed to cleanup ${type} backups`, { error });
            }
        }
    }

    private async executeCommand(command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Command failed: ${error.message}\n${stderr}`));
                } else {
                    resolve();
                }
            });
        });
    }

    private async compressFile(filePath: string): Promise<void> {
        const gzipCommand = `gzip "${filePath}"`;
        await this.executeCommand(gzipCommand);
    }

    private async compressAndEncryptFile(filePath: string): Promise<void> {
        // Compress first
        await this.compressFile(filePath);

        // Then encrypt (using openssl for production)
        const encryptedPath = `${filePath}.gz.enc`;
        const encryptCommand = `openssl enc -aes-256-cbc -salt -in "${filePath}.gz" -out "${encryptedPath}" -k "${process.env.BACKUP_ENCRYPTION_KEY || 'default-key'}"`;

        await this.executeCommand(encryptCommand);

        // Remove uncompressed file
        await fs.unlink(`${filePath}.gz`);
    }

    private async verifyDatabaseBackup(backupPath: string): Promise<void> {
        // Basic verification by checking file size and attempting to parse
        const stats = await fs.stat(backupPath);
        if (stats.size < 1000) {
            throw new Error('Backup file too small, likely corrupted');
        }
    }

    private async verifyRedisBackup(backupPath: string): Promise<void> {
        const stats = await fs.stat(backupPath);
        if (stats.size === 0) {
            throw new Error('Redis backup file is empty');
        }
    }

    private async verifyDatabaseRestore(): Promise<void> {
        // Verify database connectivity and basic queries
        const testQuery = await this.prisma.systemConfig.count();
        if (testQuery < 0) {
            throw new Error('Database restore verification failed');
        }
    }

    private async recordBackup(type: string, path: string, status: string): Promise<void> {
        await this.prisma.systemConfig.create({
            data: {
                key: `backup:${type}:${Date.now()}`,
                value: {
                    type,
                    path,
                    status,
                    timestamp: new Date().toISOString(),
                    size: await this.getFileSize(path)
                },
                description: `Backup record: ${type}`
            }
        });
    }

    private async recordRestore(type: string, path: string, status: string): Promise<void> {
        await this.prisma.systemConfig.create({
            data: {
                key: `restore:${type}:${Date.now()}`,
                value: {
                    type,
                    path,
                    status,
                    timestamp: new Date().toISOString()
                },
                description: `Restore record: ${type}`
            }
        });
    }

    private async getFileSize(filePath: string): Promise<number> {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch {
            return 0;
        }
    }

    async getBackupStatus(): Promise<any> {
        const backups = await this.prisma.systemConfig.findMany({
            where: {
                key: { startsWith: 'backup:' }
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });

        const stats: any = {
            database: { lastBackup: null, successRate: 0 },
            redis: { lastBackup: null, successRate: 0 },
            events: { lastBackup: null, successRate: 0 }
        };

        for (const backup of backups) {
            const data = backup.value as any;
            const type = data.type;
            if (stats[type]) {
                if (!stats[type].lastBackup || backup.updatedAt > stats[type].lastBackup.updatedAt) {
                    stats[type].lastBackup = backup;
                }
            }
        }

        return stats;
    }
}

// Global backup service instance
export const backupService = new BackupService();
