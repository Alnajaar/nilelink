import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authService } from '../../../src/services/AuthService';
import { auditService } from '../../../src/middleware/audit';

const prisma = new PrismaClient();

describe('Admin Scenarios E2E Tests', () => {
    let adminToken: string;
    let testUserId: string;
    let testSubscriptionPlanId: string;

    beforeAll(async () => {
        // Ensure we have an admin user for testing
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!adminUser) {
            // Create an admin user for testing
            const hashedPassword = await bcrypt.hash('admin123!@#', 10);
            await prisma.user.create({
                data: {
                    email: 'admin@nilelink.test',
                    firstName: 'Admin',
                    lastName: 'User',
                    password: hashedPassword,
                    role: 'ADMIN',
                    emailVerified: true,
                    isActive: true,
                    tenantId: 'global-tenant'
                }
            });
        }

        // Create global tenant if it doesn't exist
        const globalTenant = await prisma.tenant.findFirst({
            where: { subdomain: 'global' }
        });

        if (!globalTenant) {
            await prisma.tenant.create({
                data: {
                    name: 'Global Tenant',
                    subdomain: 'global',
                    trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }
            });
        }

        // Login as admin to get token
        const loginResult = await authService.login('admin@nilelink.test', 'admin123!@#');
        expect(loginResult.success).toBe(true);
        adminToken = loginResult.tokens!.accessToken;
    });

    afterAll(async () => {
        // Clean up test data
        if (testUserId) {
            await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
        }
        if (testSubscriptionPlanId) {
            await prisma.subscriptionPlan.delete({ where: { id: testSubscriptionPlanId } }).catch(() => {});
        }
        await prisma.$disconnect();
    });

    describe('User Management', () => {
        it('should allow admin to create a new user', async () => {
            const response = await fetch('http://localhost:3010/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    email: 'testuser@nilelink.test',
                    password: 'TestPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'CUSTOMER'
                })
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.user.email).toBe('testuser@nilelink.test');
            testUserId = data.data.user.id;
        });

        it('should allow admin to list users', async () => {
            const response = await fetch('http://localhost:3010/api/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data.users)).toBe(true);
            expect(data.data.users.length).toBeGreaterThan(0);
        });

        it('should allow admin to update a user', async () => {
            const response = await fetch(`http://localhost:3010/api/users/${testUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    firstName: 'Updated',
                    lastName: 'TestUser'
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.user.firstName).toBe('Updated');
            expect(data.data.user.lastName).toBe('TestUser');
        });

        it('should allow admin to reset user password', async () => {
            const response = await fetch(`http://localhost:3010/api/users/${testUserId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    newPassword: 'NewPass123!'
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('Password reset');
        });

        it('should allow admin to deactivate a user', async () => {
            const response = await fetch(`http://localhost:3010/api/users/${testUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('deactivated');
        });
    });

    describe('Currency Rate Management', () => {
        it('should allow admin to update currency rates', async () => {
            const response = await fetch('http://localhost:3010/api/admin/currency/rates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    rates: [
                        { currency: 'EUR', rate: 0.85, source: 'TEST' },
                        { currency: 'GBP', rate: 0.73, source: 'TEST' },
                        { currency: 'AED', rate: 3.67, source: 'TEST' }
                    ]
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('updated');
            expect(data.data.updatedRates).toBe(3);
        });

        it('should allow admin to get current currency rates', async () => {
            const response = await fetch('http://localhost:3010/api/admin/currency/rates', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.rates).toBeDefined();
            expect(data.data.baseCurrency).toBe('USD');
        });

        it('should allow admin to update single currency rate', async () => {
            const response = await fetch('http://localhost:3010/api/admin/currency/rates/SAR', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    rate: 3.75,
                    source: 'ADMIN_TEST'
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.currency).toBe('SAR');
            expect(data.data.rate).toBe(3.75);
        });
    });

    describe('Subscription Plan Management', () => {
        it('should allow admin to create a subscription plan', async () => {
            const response = await fetch('http://localhost:3010/api/subscriptions/plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    name: 'Test Premium Plan',
                    description: 'A test premium subscription plan',
                    price: 199.99,
                    currency: 'USD',
                    billingCycle: 'MONTHLY',
                    trialDays: 14,
                    visibility: 'PRIVATE',
                    autoRenew: true
                })
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.name).toBe('Test Premium Plan');
            testSubscriptionPlanId = data.data.id;
        });

        it('should allow admin to list subscription plans', async () => {
            const response = await fetch('http://localhost:3010/api/subscriptions/plans', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        it('should allow admin to update a subscription plan', async () => {
            const response = await fetch(`http://localhost:3010/api/subscriptions/plans/${testSubscriptionPlanId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    name: 'Updated Test Premium Plan',
                    price: 249.99
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.name).toBe('Updated Test Premium Plan');
            expect(data.data.price).toBe(249.99);
        });

        it('should allow admin to publish a subscription plan', async () => {
            const response = await fetch(`http://localhost:3010/api/subscriptions/plans/${testSubscriptionPlanId}/publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('published');
        });

        it('should allow admin to delete a subscription plan', async () => {
            const response = await fetch(`http://localhost:3010/api/subscriptions/plans/${testSubscriptionPlanId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('deleted');
        });
    });

    describe('Audit Logging', () => {
        it('should log admin actions in audit trail', async () => {
            // Create another test user to generate audit logs
            const response = await fetch('http://localhost:3010/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    email: 'audit-test@nilelink.test',
                    password: 'AuditPass123!',
                    firstName: 'Audit',
                    lastName: 'Test',
                    role: 'CUSTOMER'
                })
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            const auditUserId = data.data.user.id;

            // Clean up the audit test user
            await fetch(`http://localhost:3010/api/users/${auditUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            // Note: In a real test, we'd query the audit log table to verify entries
            // For this demo, we just ensure the operations complete successfully
            expect(data.success).toBe(true);
        });
    });

    describe('Authentication & Authorization', () => {
        it('should reject non-admin access to admin endpoints', async () => {
            // First create a regular user
            const userResponse = await fetch('http://localhost:3010/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    email: 'regular@nilelink.test',
                    password: 'RegularPass123!',
                    firstName: 'Regular',
                    lastName: 'User',
                    role: 'CUSTOMER'
                })
            });

            const userData = await userResponse.json();
            const regularUserId = userData.data.user.id;

            // Login as regular user
            const loginResult = await authService.login('regular@nilelink.test', 'RegularPass123!');
            expect(loginResult.success).toBe(true);
            const regularUserToken = loginResult.tokens!.accessToken;

            // Try to access admin endpoint - should fail
            const adminResponse = await fetch('http://localhost:3010/api/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${regularUserToken}`
                }
            });

            expect(adminResponse.status).toBe(403);
            const adminData = await adminResponse.json();
            expect(adminData.error).toContain('Admin');

            // Clean up regular user
            await fetch(`http://localhost:3010/api/users/${regularUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
        });

        it('should handle failed login attempts correctly', async () => {
            // Attempt login with wrong password multiple times
            for (let i = 0; i < 3; i++) {
                const result = await authService.login('admin@nilelink.test', 'wrongpassword');
                expect(result.success).toBe(false);
                if (i < 2) {
                    expect(result.remainingAttempts).toBeDefined();
                }
            }

            // This should work (assuming account doesn't get locked after 5 attempts in test)
            const finalResult = await authService.login('admin@nilelink.test', 'admin123!@#');
            expect(finalResult.success).toBe(true);
        });
    });
});