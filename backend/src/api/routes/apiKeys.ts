import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { extractTenant } from '../middleware/tenantContext';
import { requireRole } from '../middleware/authorize';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// API KEY MANAGEMENT (For external integrations)
// ============================================================================

const CreateApiKeySchema = z.object({
    name: z.string().min(2),
    permissions: z.array(z.string()).optional(),
    expiresInDays: z.number().min(1).max(365).optional(),
});

/**
 * POST /api/api-keys
 * Create new API key (Owner only)
 */
router.post('/',
    extractTenant,
    authenticate,
    requireRole('Owner'),
    async (req: Request, res: Response) => {
        try {
            const data = CreateApiKeySchema.parse(req.body);

            // Generate API key and secret
            const key = `nilelink_${crypto.randomBytes(16).toString('hex')}`;
            const secret = crypto.randomBytes(32).toString('hex');

            const expiresAt = data.expiresInDays
                ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
                : null;

            const apiKey = await prisma.apiKey.create({
                data: {
                    tenantId: req.tenantId!,
                    name: data.name,
                    key,
                    secret,
                    permissions: data.permissions || [],
                    expiresAt,
                }
            });

            res.status(201).json({
                success: true,
                data: {
                    ...apiKey,
                    warning: 'Save the secret now - it will not be shown again!'
                }
            });
        } catch (error: any) {
            console.error('Create API key error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create API key'
            });
        }
    }
);

/**
 * GET /api/api-keys
 * List API keys (secrets hidden)
 */
router.get('/',
    extractTenant,
    authenticate,
    requireRole('Owner'),
    async (req: Request, res: Response) => {
        try {
            const keys = await prisma.apiKey.findMany({
                where: { tenantId: req.tenantId },
                select: {
                    id: true,
                    name: true,
                    key: true,
                    permissions: true,
                    isActive: true,
                    lastUsedAt: true,
                    expiresAt: true,
                    createdAt: true,
                    // Don't return secret
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json({
                success: true,
                data: keys
            });
        } catch (error) {
            console.error('List API keys error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch API keys'
            });
        }
    }
);

/**
 * DELETE /api/api-keys/:id
 * Revoke API key
 */
router.delete('/:id',
    extractTenant,
    authenticate,
    requireRole('Owner'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            await prisma.apiKey.update({
                where: {
                    id,
                    tenantId: req.tenantId,
                },
                data: {
                    isActive: false
                }
            });

            res.json({
                success: true,
                message: 'API key revoked'
            });
        } catch (error) {
            console.error('Revoke API key error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to revoke API key'
            });
        }
    }
);

export default router;
