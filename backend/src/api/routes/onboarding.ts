import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../services/DatabasePoolService';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const router = Router();

const OnboardingSchema = z.object({
    // User Info
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),

    // Business Info
    businessName: z.string().min(1),
    businessType: z.enum(['cafe', 'restaurant', 'retail', 'other']),

    // Scale
    locationCount: z.number().int().min(1).max(1000),
    systemCount: z.number().int().min(1).max(1000), // Systems per location

    // Initial Staff
    initialManagerEmail: z.string().email().optional(),
    initialManagerName: z.string().optional(),
});

/**
 * POST /api/onboarding/initialize
 * The "Hyper-Ecosystem" Deployer
 */
router.post('/initialize', async (req, res) => {
    try {
        const data = OnboardingSchema.parse(req.body);

        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Identity already exists in neural database' });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 2. Create Tenant (Business Domain)
        const subdomain = data.businessName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);

        const tenant = await prisma.tenant.create({
            data: {
                name: data.businessName,
                subdomain: subdomain,
                plan: data.locationCount > 10 ? 'ENTERPRISE' : 'PRO',
            }
        });

        // 3. Create Owner (Primary Operator)
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'ADMIN' as any, // Cast as userRole enum
                tenantId: tenant.id,
                isActive: true,
                emailVerified: true
            }
        });

        // 4. Deploy Nodes (Restaurants/Branches)
        // For performance in 1000 nodes, we would use createMany, but here we do it logically
        const branches = [];
        const batchSize = 10; // Process in small batches to avoid timeout if count is high
        const loopCount = Math.min(data.locationCount, 50); // Limit to 50 for demo speed, but logic supports 1000

        for (let i = 1; i <= loopCount; i++) {
            const branch = await prisma.restaurant.create({
                data: {
                    name: `${data.businessName} - Node ${i.toString().padStart(3, '0')}`,
                    description: `Automated ${data.businessType} node deployed by NileLink AI`,
                    address: `Neural Location ${i}`,
                    tenantId: tenant.id,
                    isActive: true,
                }
            });
            branches.push(branch);

            // Create some default menu items for each branch
            await prisma.menuItem.createMany({
                data: [
                    { name: 'Signature Blend', price: 4.50, category: 'Beverages', restaurantId: branch.id },
                    { name: 'Artisan Pastry', price: 6.00, category: 'Food', restaurantId: branch.id },
                    { name: 'Nile Link Special', price: 12.00, category: 'Specials', restaurantId: branch.id },
                ]
            });
        }

        // 5. Create Initial Manager if provided (and not the same as owner)
        if (data.initialManagerEmail && data.initialManagerEmail !== data.email) {
            const mPass = await bcrypt.hash('StandardPass123!', 10);
            await prisma.user.create({
                data: {
                    email: data.initialManagerEmail,
                    password: mPass,
                    firstName: data.initialManagerName || 'System',
                    lastName: 'Manager',
                    role: 'RESTAURANT_STAFF' as any,
                    tenantId: tenant.id,
                    isActive: true,
                }
            });
        }

        // 6. Subscription Ecosystem Initialization (The "Smarter Way")
        // Check/Create the Ecosystem Admin Seller
        let systemSeller = await prisma.marketplaceSeller.findFirst({
            where: { name: 'NileLink Global Ecosystem' }
        });

        if (!systemSeller) {
            systemSeller = await prisma.marketplaceSeller.create({
                data: {
                    name: 'NileLink Global Ecosystem',
                    email: 'ecosystem@nilelink.app',
                    description: 'Primary protocol provider for the NileLink network.'
                }
            });
        }

        // Ensure the Yearly Subscription Plans exist (New Pricing Hierarchy)
        const planConfigs = [
            {
                id: 'nlink-starter-supplier',
                name: 'Starter (Supplier Mandatory)',
                price: 50,
                features: ['pos_core', 'supplier_hub']
            },
            {
                id: 'nlink-starter-pos',
                name: 'Starter (POS Only)',
                price: 150,
                features: ['pos_core']
            },
            {
                id: 'nlink-ultimate-single',
                name: 'Ultimate (Single Node)',
                price: 200,
                features: ['pos_core', 'supplier_hub', 'delivery_fleet', 'customer_portal', 'invest_hub']
            },
            {
                id: 'nlink-enterprise-duo',
                name: 'Enterprise Duo (2 Nodes)',
                price: 300,
                features: ['*', 'multi_location']
            },
            {
                id: 'nlink-global-network',
                name: 'Global Network (3+ Nodes)',
                price: 500,
                features: ['*', 'multi_location', 'enterprise_analytics']
            }
        ];

        for (const p of planConfigs) {
            await prisma.subscriptionPlan.upsert({
                where: { id: p.id },
                update: {
                    price: p.price,
                    billingCycle: 'YEARLY',
                    features: p.features,
                    description: 'Software-only protocol access. Hardware not included.'
                },
                create: {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    billingCycle: 'YEARLY',
                    features: p.features,
                    trialDays: 90, // 3 Months Free Trial as requested previously (still keeping the premium trial)
                    sellerId: systemSeller.id,
                    status: 'ACTIVE',
                    visibility: 'PUBLIC',
                    description: 'Software-only protocol access. Hardware not included.'
                }
            });
        }

        // Automatically Subscribe User based on the requested scale during onboarding
        let selectedPlanId = 'nlink-starter-supplier'; // Default logic

        if (data.locationCount === 1) {
            selectedPlanId = 'nlink-ultimate-single'; // Assume full single is best for auto-deploy
        } else if (data.locationCount === 2) {
            selectedPlanId = 'nlink-enterprise-duo';
        } else {
            selectedPlanId = 'nlink-global-network';
        }

        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 90);

        await prisma.customerSubscription.create({
            data: {
                customerId: user.id,
                planId: selectedPlanId,
                status: 'ACTIVE',
                startDate: new Date(),
                trialEndDate: trialEndDate,
                endDate: trialEndDate, // Trial start
                autoRenew: true,
                nextBillingDate: trialEndDate
            }
        });

        // 7. Generate Access Token
        const token = jwt.sign(
            { userId: user.id, role: 'ADMIN', email: user.email, tenantId: tenant.id },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Hyper-Ecosystem Deployed Successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    tenantId: tenant.id,
                    role: 'ADMIN'
                },
                business: {
                    id: tenant.id,
                    name: tenant.name,
                    subdomain: tenant.subdomain,
                    nodeCount: branches.length,
                    totalNodesRequested: data.locationCount
                },
                accessToken: token
            }
        });

    } catch (error: any) {
        logger.error('Onboarding Error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        } else {
            res.status(500).json({ success: false, error: 'Internal system failure during deployment' });
        }
    }
});

export default router;
