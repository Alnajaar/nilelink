import { Router } from 'express';
import { prisma } from '../../services/DatabasePoolService';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { requireFeature } from '../../middleware/featureGate';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { emailService } from '../../services/EmailService';
import crypto from 'crypto';

const router = Router();

// Supplier Registration Schema
const supplierRegistrationSchema = z.object({
    // Personal Information
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),

    // Business Information
    companyName: z.string().min(1),
    businessType: z.enum(['manufacturer', 'distributor', 'wholesaler', 'retailer', 'importer', 'other']),
    industry: z.string().min(1),
    companySize: z.string().min(1),
    businessAddress: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
    taxId: z.string().optional(),
    businessDescription: z.string().optional(),

    // Supplier Preferences
    supplyCategories: z.array(z.string()).min(1),
    deliveryRadius: z.string().optional(),
    minimumOrderValue: z.string().optional(),
    paymentTerms: z.string().optional(),
    certifications: z.array(z.string()).optional()
});

// POST /api/suppliers/register - Comprehensive supplier registration
router.post('/register', async (req, res) => {
    try {
        const validatedData = supplierRegistrationSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create supplier profile data
        const supplierProfile = {
            businessType: validatedData.businessType,
            industry: validatedData.industry,
            companySize: validatedData.companySize,
            businessAddress: validatedData.businessAddress,
            city: validatedData.city,
            state: validatedData.state,
            zipCode: validatedData.zipCode,
            country: validatedData.country,
            taxId: validatedData.taxId,
            businessDescription: validatedData.businessDescription,
            supplyCategories: JSON.stringify(validatedData.supplyCategories),
            deliveryRadius: validatedData.deliveryRadius,
            minimumOrderValue: validatedData.minimumOrderValue,
            paymentTerms: validatedData.paymentTerms || 'Net 30',
            certifications: validatedData.certifications ? JSON.stringify(validatedData.certifications) : null,
            isVerified: false,
            creditLimit: 50000, // Default credit limit
            availableCredit: 50000
        };

        // Create User with Supplier Profile
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                phone: validatedData.phone,
                role: 'VENDOR', // Supplier role
                emailVerificationToken: verificationToken,
                emailVerificationExpiresAt: verificationTokenExpires,
                emailVerified: false,
                isActive: false, // Email verification required
                supplierProfile: {
                    create: supplierProfile
                }
            },
            include: {
                supplierProfile: true
            }
        });

        // Send verification email
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
        const emailSent = await emailService.sendRegistrationConfirmation(
            user.email,
            `${user.firstName} ${user.lastName}`,
            verificationLink,
            '24 hours'
        );

        if (!emailSent) {
            console.warn('Failed to send verification email, but supplier was created');
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                email: user.email,
                tenantId: user.tenantId
            },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Supplier account created successfully! Please check your email for verification.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    supplierProfile: user.supplierProfile
                },
                accessToken: token,
                refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7)
            }
        });
    } catch (error) {
        console.error('Supplier registration error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});

// GET /api/suppliers/inventory - Get inventory items for a restaurant
router.get('/inventory', authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context required' });

        // Find the restaurant(s) for this tenant
        // For simplicity, we grab the first one or allow filtering by restaurantId query param
        const restaurant = await prisma.restaurant.findFirst({
            where: { tenantId }
        });

        if (!restaurant) {
            return res.status(404).json({ success: false, error: 'Restaurant not found' });
        }

        const inventory = await prisma.inventory.findMany({
            where: { restaurantId: restaurant.id },
            include: { supplier: true }
        });

        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Inventory fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
    }
});

const restockSchema = z.object({
    restaurantId: z.string(),
    supplierId: z.string(),
    items: z.array(z.object({
        name: z.string(),
        quantity: z.number().positive(),
        unitCost: z.number().positive(),
        unit: z.string()
    }))
});

// POST /api/suppliers/restock - Create Purchase Order & Update Inventory
router.post('/restock', authenticate, requireFeature('inventory_advanced'), async (req, res) => {
    try {
        const { restaurantId, supplierId, items } = restockSchema.parse(req.body);

        // 1. Calculate Total Cost
        const totalCost = items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

        // 2. Create Purchase Order
        const po = await prisma.purchaseOrder.create({
            data: {
                restaurantId,
                supplierId,
                status: 'SENT',
                totalCost,
                items: JSON.stringify(items)
            }
        });

        // 3. Update Inventory (or Create if new)
        for (const item of items) {
            const existingItem = await prisma.inventory.findFirst({
                where: {
                    restaurantId,
                    supplierId,
                    name: item.name
                }
            });

            if (existingItem) {
                await prisma.inventory.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: { increment: item.quantity }, // Add stock
                        unitCost: item.unitCost // Update cost price
                    }
                });

                // Log movement
                await prisma.inventoryMovement.create({
                    data: {
                        inventoryId: existingItem.id,
                        type: 'IN',
                        quantity: item.quantity,
                        reason: `Restock PO #${po.id.slice(-6)}`,
                        referenceId: po.id
                    }
                });
            } else {
                const newItem = await prisma.inventory.create({
                    data: {
                        restaurantId,
                        supplierId,
                        name: item.name,
                        unit: item.unit,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        reorderLevel: 10 // Default
                    }
                });

                // Log movement
                await prisma.inventoryMovement.create({
                    data: {
                        inventoryId: newItem.id,
                        type: 'IN',
                        quantity: item.quantity,
                        reason: `Initial Stock PO #${po.id.slice(-6)}`,
                        referenceId: po.id
                    }
                });
            }
        }

        // 4. Calculate NileLink Commission (8% of Supplier Order)
        // In a real system, we might log this to a "Revenue" ledger
        const nileLinkCommission = totalCost * 0.08;
        console.log(`💰 NileLink Commission: ${nileLinkCommission} earned on PO ${po.id}`);

        res.json({
            success: true,
            message: 'Purchase Order created and inventory updated',
            data: {
                poId: po.id,
                totalCost,
                commission: nileLinkCommission
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        }
        console.error('Restock error:', error);
        res.status(500).json({ success: false, error: 'Restock failed' });
    }
});

// POST /api/suppliers/autonomous-draft - AI triggered draft PO
router.post('/autonomous-draft', authenticate, async (req, res) => {
    try {
        const { restaurantId, items, aiRequestId } = req.body;

        // Find a suitable supplier for these items (mock logic: use first active)
        const supplier = await prisma.supplier.findFirst({ where: { isActive: true } });
        if (!supplier) return res.status(404).json({ success: false, error: 'No active suppliers found' });

        const totalCost = items.reduce((acc: number, item: any) => acc + (item.qty * (item.price * 0.7)), 0);

        const po = await prisma.purchaseOrder.create({
            data: {
                restaurantId,
                supplierId: supplier.id,
                status: 'DRAFT', // AI orders start as drafts for supplier approval
                totalCost,
                items: JSON.stringify(items),
                notes: `AI_ORCHESTRATION_TRIGGER: ${aiRequestId}`
            }
        });

        res.json({
            success: true,
            message: 'Autonomous draft order created',
            data: po
        });
    } catch (error) {
        console.error('Autonomous draft error:', error);
        res.status(500).json({ success: false, error: 'Failed to create autonomous draft' });
    }
});

// GET /api/suppliers/purchase-orders - List POs with filtering
router.get('/purchase-orders', authenticate, async (req, res) => {
    try {
        const status = req.query.status as string;
        const tenantId = req.user?.tenantId;

        const pos = await prisma.purchaseOrder.findMany({
            where: {
                ...(status ? { status } : {}),
                // In production, we would filter by supplierId/tenantId
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: pos });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch purchase orders' });
    }
});

// POST /api/suppliers/purchase-orders/:id/approve - Approve a draft PO
router.post('/purchase-orders/:id/approve', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const po = await prisma.purchaseOrder.update({
            where: { id },
            data: { status: 'SENT' }
        });

        // Trigger inventory update (similar to the restock route)
        const items = JSON.parse(po.items);
        for (const item of items) {
            await prisma.inventory.updateMany({
                where: {
                    restaurantId: po.restaurantId,
                    name: item.name
                },
                data: {
                    quantity: { increment: item.qty || item.quantity }
                }
            });
        }

        res.json({ success: true, message: 'Order approved and inventory updated', data: po });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Approval failed' });
    }
});

// GET /api/suppliers - List all suppliers
router.get('/', authenticate, async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { isActive: true }
        });
        res.json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

export default router;
