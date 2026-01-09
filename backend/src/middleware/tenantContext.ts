import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/DatabasePoolService';
import { logger } from '../utils/logger';

/**
 * Tenant Context Middleware
 * Extracts tenant from subdomain or custom header
 * Validates tenant status and trial period
 */
export async function extractTenant(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Extract subdomain from hostname
        // e.g., acme.nilelink.app -> "acme"
        const parts = req.hostname.split('.');
        let subdomain: string | null = null;

        if (parts.length >= 3) {
            subdomain = parts[0];
        }

        // Fallback to custom header for development
        if (!subdomain && req.headers['x-tenant-subdomain']) {
            subdomain = req.headers['x-tenant-subdomain'] as string;
        }

        if (!subdomain) {
            return res.status(400).json({
                success: false,
                error: 'Tenant subdomain not provided'
            });
        }

        // Fetch tenant
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain },
            include: { settings: true }
        });

        if (!tenant) {
            return res.status(404).json({
                success: false,
                error: 'Tenant not found'
            });
        }

        // Check if tenant is active
        if (!tenant.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Tenant account is disabled'
            });
        }

        // Check trial status
        if (tenant.plan === 'TRIAL') {
            const now = new Date();
            if (now > tenant.trialEndsAt) {
                return res.status(402).json({
                    success: false,
                    error: 'Free trial expired. Please upgrade your plan.',
                    trialEnded: true
                });
            }
        }

        // Attach tenant to request
        req.tenant = tenant;
        req.tenantId = tenant.id;

        next();
    } catch (error) {
        logger.error('Tenant extraction error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process tenant context'
        });
    }
}

/**
 * Require active subscription middleware
 * Checks that tenant has valid subscription beyond trial
 */
export function requireActiveSubscription(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const tenant = req.tenant;

    if (!tenant) {
        return res.status(401).json({
            success: false,
            error: 'No tenant context'
        });
    }

    if (tenant.plan === 'TRIAL') {
        const now = new Date();
        if (now > tenant.trialEndsAt) {
            return res.status(402).json({
                success: false,
                error: 'Trial expired - subscription required',
                upgradeUrl: `/billing/upgrade`
            });
        }
    }

    if (!tenant.subscriptionId && tenant.plan !== 'TRIAL') {
        return res.status(402).json({
            success: false,
            error: 'No active subscription found'
        });
    }

    next();
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            tenant?: any;
            tenantId?: string;
        }
    }
}
