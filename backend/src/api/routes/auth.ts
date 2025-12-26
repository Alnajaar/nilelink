import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

// Use a shared prisma instance if available, otherwise create one (best practice is shared)
const prisma = new PrismaClient();

const router = Router();

// Validation schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'DELIVERY_DRIVER']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
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

        // Create User
        const user = await prisma.user.create({
            data: {
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
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
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
            { userId: user.id, role: user.role, email: user.email },
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
                    role: user.role,
                },
                token,
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

export default router;
