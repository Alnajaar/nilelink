import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';
import { TokenScope } from './RBACService';

interface APIKey {
    id: string;
    name: string;
    description?: string;
    keyPreview: string; // First 8 characters for display
    permissions: string[];
    scopes: TokenScope[];
    isActive: boolean;
    expiresAt?: Date;
    lastUsedAt?: Date;
    usageCount: number;
    createdAt: Date;
}

interface CreateAPIKeyRequest {
    name: string;
    description?: string;
    permissions: string[];
    scopes: TokenScope[];
    expiresAt?: Date;
}

interface APIKeyRotationResult {
    oldKey: string;
    newKey: string;
    keyId: string;
}

export class APIKeyService {
    private static instance: APIKeyService;

    private constructor() {}

    static getInstance(): APIKeyService {
        if (!APIKeyService.instance) {
            APIKeyService.instance = new APIKeyService();
        }
        return APIKeyService.instance;
    }

    /**
     * Generate a new API key
     */
    private generateAPIKey(): string {
        // Generate a secure 32-character API key
        return crypto.randomBytes(24).toString('hex'); // 48 characters
    }

    /**
     * Hash an API key for storage
     */
    private async hashAPIKey(key: string): Promise<string> {
        return bcrypt.hash(key, 12); // Strong hashing for API keys
    }

    /**
     * Verify an API key against its hash
     */
    private async verifyAPIKey(key: string, hash: string): Promise<boolean> {
        return bcrypt.compare(key, hash);
    }

    /**
     * Create a new API key for a user
     */
    async createAPIKey(
        userId: string,
        request: CreateAPIKeyRequest
    ): Promise<{ success: boolean; apiKey?: APIKey; plainKey?: string; error?: string }> {
        try {
            // Validate permissions (user can only grant permissions they have)
            // This would be implemented with RBAC checks

            // Generate the key
            const plainKey = this.generateAPIKey();
            const keyHash = await this.hashAPIKey(plainKey);

            // Create the API key record
            const apiKeyRecord = await prisma.aPIKey.create({
                data: {
                    name: request.name,
                    description: request.description,
                    keyHash,
                    userId,
                    permissions: request.permissions,
                    scopes: request.scopes,
                    expiresAt: request.expiresAt,
                    isActive: true
                }
            });

            const apiKey: APIKey = {
                id: apiKeyRecord.id,
                name: apiKeyRecord.name,
                description: apiKeyRecord.description || undefined,
                keyPreview: plainKey.substring(0, 8) + '...',
                permissions: apiKeyRecord.permissions,
                scopes: apiKeyRecord.scopes as TokenScope[],
                isActive: apiKeyRecord.isActive,
                expiresAt: apiKeyRecord.expiresAt || undefined,
                lastUsedAt: apiKeyRecord.lastUsedAt || undefined,
                usageCount: apiKeyRecord.usageCount,
                createdAt: apiKeyRecord.createdAt
            };

            logger.info(`API key created for user ${userId}: ${request.name}`);

            return {
                success: true,
                apiKey,
                plainKey // Only returned once for security
            };

        } catch (error) {
            logger.error('Failed to create API key:', error);
            return { success: false, error: 'Failed to create API key' };
        }
    }

    /**
     * Validate and get API key information
     */
    async validateAPIKey(key: string): Promise<{
        valid: boolean;
        apiKey?: APIKey;
        userId?: string;
        error?: string;
    }> {
        try {
            if (!key || key.length < 32) {
                return { valid: false, error: 'Invalid API key format' };
            }

            // Find API key by hash
            const apiKeys = await prisma.aPIKey.findMany({
                where: { isActive: true }
            });

            let matchedKey: any = null;
            for (const apiKey of apiKeys) {
                if (await this.verifyAPIKey(key, apiKey.keyHash)) {
                    matchedKey = apiKey;
                    break;
                }
            }

            if (!matchedKey) {
                return { valid: false, error: 'API key not found' };
            }

            // Check expiration
            if (matchedKey.expiresAt && new Date() > matchedKey.expiresAt) {
                return { valid: false, error: 'API key has expired' };
            }

            // Update usage statistics
            await prisma.aPIKey.update({
                where: { id: matchedKey.id },
                data: {
                    lastUsedAt: new Date(),
                    usageCount: { increment: 1 }
                }
            });

            const apiKey: APIKey = {
                id: matchedKey.id,
                name: matchedKey.name,
                description: matchedKey.description,
                keyPreview: key.substring(0, 8) + '...',
                permissions: matchedKey.permissions,
                scopes: matchedKey.scopes as TokenScope[],
                isActive: matchedKey.isActive,
                expiresAt: matchedKey.expiresAt,
                lastUsedAt: new Date(),
                usageCount: matchedKey.usageCount + 1,
                createdAt: matchedKey.createdAt
            };

            return {
                valid: true,
                apiKey,
                userId: matchedKey.userId
            };

        } catch (error) {
            logger.error('API key validation failed:', error);
            return { valid: false, error: 'API key validation failed' };
        }
    }

    /**
     * Get all API keys for a user
     */
    async getUserAPIKeys(userId: string): Promise<APIKey[]> {
        try {
            const apiKeys = await prisma.aPIKey.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });

            return apiKeys.map(key => ({
                id: key.id,
                name: key.name,
                description: key.description || undefined,
                keyPreview: '••••••••...', // Never show actual key
                permissions: key.permissions,
                scopes: key.scopes as TokenScope[],
                isActive: key.isActive,
                expiresAt: key.expiresAt || undefined,
                lastUsedAt: key.lastUsedAt || undefined,
                usageCount: key.usageCount,
                createdAt: key.createdAt
            }));

        } catch (error) {
            logger.error('Failed to get user API keys:', error);
            return [];
        }
    }

    /**
     * Rotate an API key (generate new key, deactivate old)
     */
    async rotateAPIKey(
        userId: string,
        keyId: string
    ): Promise<APIKeyRotationResult | { success: false; error: string }> {
        try {
            // Find the existing key
            const existingKey = await prisma.aPIKey.findFirst({
                where: { id: keyId, userId }
            });

            if (!existingKey) {
                return { success: false, error: 'API key not found' };
            }

            // Generate new key
            const newPlainKey = this.generateAPIKey();
            const newKeyHash = await this.hashAPIKey(newPlainKey);

            // Update the key record with new hash
            await prisma.aPIKey.update({
                where: { id: keyId },
                data: {
                    keyHash: newKeyHash,
                    updatedAt: new Date(),
                    usageCount: 0, // Reset usage count
                    lastUsedAt: null
                }
            });

            // Get the old key preview for logging
            const oldKeyPreview = existingKey.keyHash.substring(0, 8) + '...';

            logger.info(`API key rotated for user ${userId}: ${existingKey.name}`);

            return {
                oldKey: oldKeyPreview,
                newKey: newPlainKey,
                keyId
            };

        } catch (error) {
            logger.error('API key rotation failed:', error);
            return { success: false, error: 'Failed to rotate API key' };
        }
    }

    /**
     * Deactivate an API key
     */
    async deactivateAPIKey(userId: string, keyId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await prisma.aPIKey.updateMany({
                where: { id: keyId, userId },
                data: { isActive: false }
            });

            if (result.count === 0) {
                return { success: false, error: 'API key not found' };
            }

            logger.info(`API key deactivated for user ${userId}: ${keyId}`);

            return { success: true };

        } catch (error) {
            logger.error('Failed to deactivate API key:', error);
            return { success: false, error: 'Failed to deactivate API key' };
        }
    }

    /**
     * Update API key permissions and settings
     */
    async updateAPIKey(
        userId: string,
        keyId: string,
        updates: Partial<{
            name: string;
            description: string;
            permissions: string[];
            scopes: TokenScope[];
            expiresAt: Date;
        }>
    ): Promise<{ success: boolean; apiKey?: APIKey; error?: string }> {
        try {
            const updatedKey = await prisma.aPIKey.update({
                where: { id: keyId, userId },
                data: {
                    ...updates,
                    updatedAt: new Date()
                }
            });

            const apiKey: APIKey = {
                id: updatedKey.id,
                name: updatedKey.name,
                description: updatedKey.description || undefined,
                keyPreview: '••••••••...',
                permissions: updatedKey.permissions,
                scopes: updatedKey.scopes as TokenScope[],
                isActive: updatedKey.isActive,
                expiresAt: updatedKey.expiresAt || undefined,
                lastUsedAt: updatedKey.lastUsedAt || undefined,
                usageCount: updatedKey.usageCount,
                createdAt: updatedKey.createdAt
            };

            logger.info(`API key updated for user ${userId}: ${updatedKey.name}`);

            return { success: true, apiKey };

        } catch (error) {
            logger.error('Failed to update API key:', error);
            return { success: false, error: 'Failed to update API key' };
        }
    }

    /**
     * Clean up expired API keys
     */
    async cleanupExpiredKeys(): Promise<number> {
        try {
            const result = await prisma.aPIKey.updateMany({
                where: {
                    expiresAt: { lt: new Date() },
                    isActive: true
                },
                data: { isActive: false }
            });

            if (result.count > 0) {
                logger.info(`Deactivated ${result.count} expired API keys`);
            }

            return result.count;
        } catch (error) {
            logger.error('Failed to cleanup expired API keys:', error);
            return 0;
        }
    }

    /**
     * Get API key analytics
     */
    async getAPIKeyAnalytics(userId: string): Promise<{
        totalKeys: number;
        activeKeys: number;
        totalUsage: number;
        recentUsage: Array<{ name: string; usageCount: number; lastUsedAt?: Date }>;
    }> {
        try {
            const keys = await prisma.aPIKey.findMany({
                where: { userId },
                select: {
                    name: true,
                    isActive: true,
                    usageCount: true,
                    lastUsedAt: true
                }
            });

            const totalKeys = keys.length;
            const activeKeys = keys.filter(k => k.isActive).length;
            const totalUsage = keys.reduce((sum, k) => sum + k.usageCount, 0);

            const recentUsage = keys
                .filter(k => k.lastUsedAt)
                .sort((a, b) => (b.lastUsedAt!.getTime() - a.lastUsedAt!.getTime()))
                .slice(0, 5)
                .map(k => ({
                    name: k.name,
                    usageCount: k.usageCount,
                    lastUsedAt: k.lastUsedAt!
                }));

            return {
                totalKeys,
                activeKeys,
                totalUsage,
                recentUsage
            };

        } catch (error) {
            logger.error('Failed to get API key analytics:', error);
            return {
                totalKeys: 0,
                activeKeys: 0,
                totalUsage: 0,
                recentUsage: []
            };
        }
    }
}

export const apiKeyService = APIKeyService.getInstance();
