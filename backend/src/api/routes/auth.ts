import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { config } from '../../config';
import { walletService } from '../../services/WalletService';
import { authenticate } from '../../middleware/authenticate';
import { emailService } from '../../services/EmailService';
import crypto from 'crypto';

import { prisma } from '../../services/DatabasePoolService';

const router = Router();

// Validation schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'DELIVERY_DRIVER', 'ADMIN', 'SUPER_ADMIN', 'VENDOR']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const walletChallengeSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

const walletAuthSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
    signature: z.string().min(130, 'Invalid signature'),
    message: z.string().min(1, 'Message is required'),
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const validatedData = signupSchema.parse(req.body);

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

        // Create User
        // Note: Casting data to any because Prisma Client might not be regenerated yet
        const userData: any = {
            email: validatedData.email,
            password: hashedPassword,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            role: validatedData.role || 'CUSTOMER',
            customerProfile: {
                create: {
                    loyaltyPoints: 0
                }
            },
            emailVerificationToken: verificationToken,
            emailVerificationExpiresAt: verificationTokenExpires,
            emailVerified: false
        };

        const user = await prisma.user.create({
            data: userData
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
            console.warn('Failed to send verification email, but user was created');
        }

        const u = user as any;

        // Generate Token
        const token = jwt.sign(
            {
                userId: user.id,
                role: u.role,
                email: user.email,
                tenantId: user.tenantId
            },
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
                    role: u.role,
                    tenantId: user.tenantId
                },
                accessToken: token,
                refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7)
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
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if email is verified
        const u = user as any;
        if (!u.emailVerified) {
            return res.status(403).json({
                success: false,
                error: 'Please verify your email address before logging in',
                code: 'EMAIL_NOT_VERIFIED',
                data: {
                    email: user.email
                }
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate Token
        const token = jwt.sign(
            {
                userId: user.id,
                role: u.role,
                email: user.email,
                tenantId: user.tenantId
            },
            config.jwt.secret || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: u.role,
                    tenantId: user.tenantId,
                    isActive: u.isActive
                },
                accessToken: token,
                refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7)
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
    // Basic refresh implementation - in prod, use refresh tokens
    res.json({ success: false, message: 'Not implemented' });
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            include: { tenant: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Force cast to any to handle schema updates if client generation failed
        const u = user as any;

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: u.role,
                    tenantId: user.tenantId,
                    isActive: u.isActive,
                    tenant: user.tenant ? {
                        id: user.tenant.id,
                        name: user.tenant.name,
                        subdomain: user.tenant.subdomain
                    } : null
                }
            }
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================================================
// WALLET AUTHENTICATION
// ============================================================================

/**
 * POST /api/auth/wallet/challenge
 * Get message to sign for wallet authentication
 */
router.post('/wallet/challenge', async (req, res) => {
    try {
        const validatedData = walletChallengeSchema.parse(req.body);

        const result = await walletService.createWalletChallenge(validatedData.address, (req as any).user?.userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                code: 'WALLET_CHALLENGE_FAILED'
            });
        }

        res.json({
            success: true,
            data: {
                message: result.message,
                challengeId: result.challenge?.id,
                expiresAt: result.challenge?.expiresAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Wallet challenge error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/auth/wallet/verify
 * Verify wallet signature and login
 */
router.post('/wallet/verify', async (req, res) => {
    try {
        const validatedData = walletAuthSchema.parse(req.body);

        const verification = await walletService.verifyWalletSignature(
            validatedData.address,
            validatedData.signature,
            (req.body as any).challengeId
        );

        if (!verification.valid) {
            return res.status(401).json({
                success: false,
                error: verification.error,
                code: 'WALLET_VERIFICATION_FAILED'
            });
        }

        // If user exists, generate tokens and login
        if (verification.userId) {
            const user = await prisma.user.findUnique({
                where: { id: verification.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    // role: true // Prisma client hack
                }
            });

            if (user) {
                const u = user as any; // Handle potentially missing role in type

                const token = jwt.sign(
                    {
                        userId: user.id,
                        role: u.role,
                        email: user.email,
                        tenantId: u.tenantId
                    },
                    config.jwt.secret || 'fallback_secret',
                    { expiresIn: '7d' }
                );

                res.json({
                    success: true,
                    message: 'Wallet authenticated successfully',
                    data: {
                        user: {
                            ...user,
                            role: u.role,
                            tenantId: u.tenantId
                        },
                        accessToken: token,
                        refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7)
                    }
                });
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'User account not found',
                    code: 'USER_NOT_FOUND'
                });
            }
        } else {
            // New wallet user - return challenge for registration
            res.json({
                success: true,
                message: 'Wallet verified. Please complete registration.',
                data: {
                    address: verification.address,
                    requiresRegistration: true
                }
            });
        }

    } catch (error) {
        console.error('Wallet verify error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
        }

        // Find user by verification token
        const user = await prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired verification token'
            });
        }

        // Update user as verified and active
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                isActive: true, // Activate account upon verification
                emailVerificationToken: null,
                emailVerificationExpiresAt: null
            }
        });

        res.json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
            data: {
                email: user.email
            }
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email address is required'
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const u = user as any;
        if (u.isEmailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: verificationToken,
                emailVerificationExpiresAt: verificationTokenExpires
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
            return res.status(500).json({
                success: false,
                error: 'Failed to send verification email'
            });
        }

        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
