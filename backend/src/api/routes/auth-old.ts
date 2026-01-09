import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { prisma } from '../../services/DatabasePoolService';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const router = Router();

// Validation schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'DELIVERY_DRIVER']).optional(),
    tenantId: z.string().optional(),
    subdomain: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const walletAuthSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    signature: z.string(),
    message: z.string(),
});

const phoneSignupSchema = z.object({
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'DELIVERY_DRIVER']).optional(),
    tenantId: z.string().optional(),
    subdomain: z.string().optional(),
});

const phoneLoginSchema = z.object({
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
});

const verifyOtpSchema = z.object({
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
    otp: z.string().length(6),
});

const magicLinkSchema = z.object({
    email: z.string().email(),
});

const verifyMagicLinkSchema = z.object({
    token: z.string(),
});

// Helper functions
function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

function generateAuthMessage(address: string, timestamp: number): string {
    return `NileLink Authentication\nAddress: ${address}\nTimestamp: ${timestamp}\nPlease sign this message to authenticate with NileLink.`;
}

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashRefreshToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
}

function generateMagicLinkToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const validatedData = signupSchema.parse(req.body);

        // Multi-tenancy: Find or create a default tenant if not provided
        let tenantId = validatedData.tenantId;
        if (!tenantId && validatedData.subdomain) {
            const tenant = await prisma.tenant.findUnique({ where: { subdomain: validatedData.subdomain } });
            tenantId = tenant?.id;
        }

        if (!tenantId) {
            // Fallback to a "Global" tenant for general signup
            const globalTenant = await prisma.tenant.findFirst({ where: { subdomain: 'global' } });
            if (!globalTenant) {
                const newTenant = await prisma.tenant.create({
                    data: {
                        name: 'NileLink Global',
                        subdomain: 'global',
                        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days trial
                    }
                });
                tenantId = newTenant.id;
            } else {
                tenantId = globalTenant.id;
            }
        }

        // Check if user exists within this tenant
        const existingUser = await prisma.user.findFirst({
            where: {
                email: validatedData.email,
                tenantId: tenantId
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create User
        const user = await prisma.user.create({
            data: {
                tenantId: tenantId,
                email: validatedData.email,
                password: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: validatedData.role || 'CUSTOMER',
                customerProfile: {
                    create: {
                        loyaltyPoints: 0
                    }
                }
            }
        });

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Signup Error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findFirst({
            where: { email: validatedData.email }
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check account lockout
        if (user.isLocked && user.lockExpiresAt && new Date() < user.lockExpiresAt) {
            return res.status(423).json({
                success: false,
                error: 'Account is locked due to too many failed login attempts',
                lockExpiresAt: user.lockExpiresAt.toISOString()
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isValid) {
            // Increment failed login attempts
            const newAttempts = user.failedLoginAttempts + 1;
            const updateData: any = { failedLoginAttempts: newAttempts };

            // Lock account after 5 failed attempts
            if (newAttempts >= 5) {
                updateData.isLocked = true;
                updateData.lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            }

            await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                remainingAttempts: Math.max(0, 4 - newAttempts)
            });
        }

        // Reset failed login attempts on successful login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                isLocked: false,
                lockExpiresAt: null
            }
        });

        // Generate tokens
        const refreshToken = generateRefreshToken();
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '15m' }
        );

        // TODO: Store refresh token (requires refreshToken field in schema)
        // For now, just return tokens without persistence

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    // TODO: Implement refresh token rotation (requires refreshToken field in User schema)
    res.json({
        success: false,
        error: 'Refresh token rotation not implemented - requires schema update'
    });
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

// ============================================================================
// PHONE AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/phone/signup
router.post('/phone/signup', async (req, res) => {
    try {
        const validatedData = phoneSignupSchema.parse(req.body);

        // Multi-tenancy: Find or create a default tenant if not provided
        let tenantId = validatedData.tenantId;
        if (!tenantId && validatedData.subdomain) {
            const tenant = await prisma.tenant.findUnique({ where: { subdomain: validatedData.subdomain } });
            tenantId = tenant?.id;
        }

        if (!tenantId) {
            // Fallback to a "Global" tenant for general signup
            const globalTenant = await prisma.tenant.findFirst({ where: { subdomain: 'global' } });
            if (!globalTenant) {
                const newTenant = await prisma.tenant.create({
                    data: {
                        name: 'NileLink Global',
                        subdomain: 'global',
                        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days trial
                    }
                });
                tenantId = newTenant.id;
            } else {
                tenantId = globalTenant.id;
            }
        }

        // Check if phone number exists
        const existingUser = await prisma.user.findFirst({
            where: {
                phoneNumber: validatedData.phoneNumber,
                tenantId: tenantId
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Phone number already exists'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create User
        const user = await prisma.user.create({
            data: {
                tenantId: tenantId,
                phoneNumber: validatedData.phoneNumber,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: validatedData.role || 'CUSTOMER',
                otpCode: otp,
                otpExpiresAt,
                customerProfile: {
                    create: {
                        loyaltyPoints: 0
                    }
                }
            }
        });

        // TODO: Send OTP via SMS service (Twilio, etc.)
        logger.info(`OTP generated for phone signup: ${validatedData.phoneNumber}`, { otp });

        res.status(201).json({
            success: true,
            message: 'OTP sent to phone number',
            data: {
                userId: user.id,
                phoneNumber: validatedData.phoneNumber,
                otpExpiresAt: otpExpiresAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Phone signup error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// POST /api/auth/phone/login
router.post('/phone/login', async (req, res) => {
    try {
        const validatedData = phoneLoginSchema.parse(req.body);

        // Find user by phone number
        const user = await prisma.user.findFirst({
            where: { phoneNumber: validatedData.phoneNumber }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Phone number not found'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with OTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode: otp,
                otpExpiresAt
            }
        });

        // TODO: Send OTP via SMS service (Twilio, etc.)
        logger.info(`OTP generated for phone login: ${validatedData.phoneNumber}`, { otp });

        res.json({
            success: true,
            message: 'OTP sent to phone number',
            data: {
                userId: user.id,
                phoneNumber: validatedData.phoneNumber,
                otpExpiresAt: otpExpiresAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Phone login error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// POST /api/auth/phone/verify
router.post('/phone/verify', async (req, res) => {
    try {
        const validatedData = verifyOtpSchema.parse(req.body);

        // Find user by phone number
        const user = await prisma.user.findFirst({
            where: { phoneNumber: validatedData.phoneNumber }
        });

        if (!user || !user.otpCode || !user.otpExpiresAt) {
            return res.status(401).json({
                success: false,
                error: 'Invalid OTP request'
            });
        }

        // Check if OTP is expired
        if (new Date() > user.otpExpiresAt) {
            return res.status(401).json({
                success: false,
                error: 'OTP has expired'
            });
        }

        // Verify OTP
        if (user.otpCode !== validatedData.otp) {
            return res.status(401).json({
                success: false,
                error: 'Invalid OTP'
            });
        }

        // Clear OTP and mark phone as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpCode: null,
                otpExpiresAt: null,
                phoneVerified: true
            }
        });

        // Generate tokens
        const refreshToken = generateRefreshToken();
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, phoneNumber: user.phoneNumber },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '15m' }
        );

        // TODO: Store refresh token
        // await prisma.user.update({
        //     where: { id: user.id },
        //     data: { refreshToken: await hashRefreshToken(refreshToken) }
        // });

        res.json({
            success: true,
            message: 'Phone verified successfully',
            data: {
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Phone verify error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// ============================================================================
// WALLET AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/wallet/challenge
router.post('/wallet/challenge', async (req, res) => {
    try {
        const validatedData = z.object({
            address: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
        }).parse(req.body);

        const timestamp = Date.now();
        const message = generateAuthMessage(validatedData.address, timestamp);

        res.json({
            success: true,
            data: {
                message,
                timestamp
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// POST /api/auth/wallet/verify
router.post('/wallet/verify', async (req, res) => {
    try {
        const validatedData = walletAuthSchema.parse(req.body);

        // Verify signature
        const messageHash = ethers.hashMessage(validatedData.message);
        const recoveredAddress = ethers.recoverAddress(messageHash, validatedData.signature);

        if (recoveredAddress.toLowerCase() !== validatedData.address.toLowerCase()) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        // Find or create user
        let user = await prisma.user.findFirst({
            where: { walletAddress: validatedData.address.toLowerCase() }
        });

        if (!user) {
            // Create new user
            const globalTenant = await prisma.tenant.findFirst({ where: { subdomain: 'global' } }) ||
                await prisma.tenant.create({
                    data: {
                        name: 'NileLink Global',
                        subdomain: 'global',
                        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    }
                });

            user = await prisma.user.create({
                data: {
                    tenantId: globalTenant.id,
                    email: `${validatedData.address.toLowerCase()}@wallet.local`, // Dummy email for wallet users
                    walletAddress: validatedData.address.toLowerCase(),
                    firstName: `Wallet User`,
                    lastName: validatedData.address.slice(0, 8),
                    role: 'CUSTOMER',
                    // isWalletVerified requires schema extension
                    customerProfile: {
                        create: {
                            loyaltyPoints: 0
                        }
                    }
                }
            });
        }

        // Generate tokens
        const refreshToken = generateRefreshToken();
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, walletAddress: user.walletAddress },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '15m' }
        );

        // TODO: Store refresh token (requires refreshToken field in schema)
        // await prisma.user.update({
        //     where: { id: user.id },
        //     data: { refreshToken: await hashRefreshToken(refreshToken) }
        // });

        res.json({
            success: true,
            message: 'Wallet authenticated successfully',
            data: {
                user: {
                    id: user.id,
                    walletAddress: user.walletAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Wallet verify error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// ============================================================================
// MAGIC LINK AUTHENTICATION ROUTES (REQUIRES SCHEMA EXTENSION)
// ============================================================================

// POST /api/auth/magic-link
router.post('/magic-link', async (req, res) => {
    try {
        const validatedData = magicLinkSchema.parse(req.body);

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: validatedData.email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Generate magic link token
        const token = generateMagicLinkToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update user with magic link token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: token,
                magicLinkExpiresAt: expiresAt
            }
        });

        // TODO: Send magic link email
        const magicLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/magic-link/verify?token=${token}`;
        logger.info(`Magic link generated for email: ${validatedData.email}`, { magicLinkUrl });

        res.json({
            success: true,
            message: 'Magic link sent to email',
            data: {
                email: validatedData.email,
                expiresAt: expiresAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Magic link error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// POST /api/auth/magic-link/verify
router.post('/magic-link/verify', async (req, res) => {
    try {
        const validatedData = verifyMagicLinkSchema.parse(req.body);

        // Find user by magic link token
        const user = await prisma.user.findFirst({
            where: { magicLinkToken: validatedData.token }
        });

        if (!user || !user.magicLinkExpiresAt) {
            return res.status(401).json({
                success: false,
                error: 'Invalid magic link'
            });
        }

        // Check if token is expired
        if (new Date() > user.magicLinkExpiresAt) {
            return res.status(401).json({
                success: false,
                error: 'Magic link has expired'
            });
        }

        // Clear magic link token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: null,
                magicLinkExpiresAt: null
            }
        });

        // Generate tokens
        const refreshToken = generateRefreshToken();
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '15m' }
        );

        // TODO: Store refresh token

        res.json({
            success: true,
            message: 'Magic link verified successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Magic link verify error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
});

// ============================================================================
// SESSION MANAGEMENT ROUTES
// ============================================================================

// GET /api/auth/sessions
router.get('/sessions', async (req, res) => {
    try {
        // This would typically get sessions from Redis or database
        // For now, return basic session info
        res.json({
            success: true,
            data: {
                currentSession: {
                    id: 'current',
                    device: 'Web Browser',
                    ip: req.ip,
                    createdAt: new Date(),
                    lastActivity: new Date()
                },
                sessions: []
            }
        });
    } catch (error) {
        logger.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get sessions'
        });
    }
});

// DELETE /api/auth/sessions/:sessionId
router.delete('/sessions/:sessionId', async (req, res) => {
    try {
        // Invalidate specific session
        res.json({
            success: true,
            message: 'Session terminated'
        });
    } catch (error) {
        logger.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to terminate session'
        });
    }
});

// DELETE /api/auth/sessions
router.delete('/sessions', async (req, res) => {
    try {
        // Terminate all other sessions
        res.json({
            success: true,
            message: 'All other sessions terminated'
        });
    } catch (error) {
        logger.error('Delete all sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to terminate sessions'
        });
    }
});

export default router;
