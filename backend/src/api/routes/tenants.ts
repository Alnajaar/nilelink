import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { add } from 'date-fns';
import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import { authenticate } from '../../middleware/authenticate';
import { extractTenant } from '../../middleware/tenantContext';
import { seedTenantRoles } from '../../services/RoleSeeder';

const router = Router();
const prisma = new PrismaClient();
// Initialize Stripe only if API key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
    });
}

// ============================================================================
// TENANT REGISTRATION & ONBOARDING
// ============================================================================

const TenantRegistrationSchema = z.object({
    businessName: z.string().min(2),
    subdomain: z.string().regex(/^[a-z0-9-]+$/), // lowercase, numbers, hyphens
    ownerEmail: z.string().email(),
    ownerPassword: z.string().min(8),
    ownerFirstName: z.string(),
    ownerLastName: z.string(),
    currency: z.string().default('USD'),
    timezone: z.string().default('UTC'),
});

/**
 * POST /api/tenants/register
 * Create new tenant with 3-month free trial
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const data = TenantRegistrationSchema.parse(req.body);

        // Check if subdomain is available
        const existing = await prisma.tenant.findUnique({
            where: { subdomain: data.subdomain }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Subdomain already taken'
            });
        }

        // Create Stripe customer
        const stripeCustomer = await stripe.customers.create({
            email: data.ownerEmail,
            name: data.businessName,
            metadata: { subdomain: data.subdomain }
        });

        // Create tenant with 3-month trial
        const tenant = await prisma.tenant.create({
            data: {
                name: data.businessName,
                subdomain: data.subdomain,
                plan: 'TRIAL',
                trialEndsAt: add(new Date(), { months: 3 }),
                stripeCustomerId: stripeCustomer.id,
                settings: {
                    create: {
                        baseCurrency: data.currency,
                        timezone: data.timezone,
                    }
                }
            },
            include: { settings: true }
        });

        // Seed default roles (Cashier, Manager, Accountant, Owner)
        await seedTenantRoles(tenant.id);

        // Create owner user
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);

        const ownerRole = await prisma.role.findFirst({
            where: {
                tenantId: tenant.id,
                name: 'Owner'
            }
        });

        const owner = await prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: data.ownerEmail,
                password: hashedPassword,
                firstName: data.ownerFirstName,
                lastName: data.ownerLastName,
                isVerified: true,
                roles: {
                    connect: { id: ownerRole!.id }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: {
                tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    subdomain: tenant.subdomain,
                    plan: tenant.plan,
                    trialEndsAt: tenant.trialEndsAt,
                },
                owner: {
                    id: owner.id,
                    email: owner.email,
                    firstName: owner.firstName,
                    lastName: owner.lastName,
                },
                loginUrl: `https://${data.subdomain}.nilelink.app`,
            }
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            });
        }

        console.error('Tenant registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create tenant'
        });
    }
});

/**
 * GET /api/tenants/current
 * Get current tenant info
 */
router.get('/current', extractTenant, async (req: Request, res: Response) => {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.tenantId },
            include: {
                settings: true,
                _count: {
                    select: {
                        users: true,
                        restaurants: true,
                    }
                }
            }
        });

        res.json({
            success: true,
            data: tenant
        });
    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tenant'
        });
    }
});

/**
 * PUT /api/tenants/settings
 * Update tenant settings
 */
router.put('/settings', extractTenant, authenticate, async (req: Request, res: Response) => {
    try {
        const settings = await prisma.tenantSettings.update({
            where: { tenantId: req.tenantId },
            data: req.body
        });

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
});

export default router;
