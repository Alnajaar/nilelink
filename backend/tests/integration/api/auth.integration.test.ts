import request from 'supertest';
import { app, server } from '../../../src/app';

describe('Auth API Integration Tests', () => {
    afterAll(async () => {
        server.close();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                role: 'CUSTOMER',
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toMatchObject({
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
            });
            expect(response.body.data.token).toBeDefined();
        });

        it('should validate required fields', async () => {
            const invalidData = {
                email: 'invalid-email',
                password: '123', // Too short
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation error');
            expect(response.body.details).toBeDefined();
        });

        it('should handle duplicate email registration', async () => {
            const userData = {
                email: 'duplicate@example.com',
                password: 'password123',
                firstName: 'Duplicate',
                lastName: 'User',
            };

            // First registration
            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            // Second registration with same email
            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(500); // This would be handled by database constraints in real implementation

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user for login tests
            await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'login-test@example.com',
                    password: 'password123',
                    firstName: 'Login',
                    lastName: 'Test',
                });
        });

        it('should authenticate user successfully', async () => {
            const loginData = {
                email: 'login-test@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toMatchObject({
                email: loginData.email,
                firstName: 'Login',
                lastName: 'Test',
            });
            expect(response.body.data.token).toBeDefined();
        });

        it('should reject invalid credentials', async () => {
            const invalidLogin = {
                email: 'login-test@example.com',
                password: 'wrongpassword',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(invalidLogin)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid credentials');
        });

        it('should validate login input', async () => {
            const invalidLogin = {
                email: 'not-an-email',
                password: '',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(invalidLogin)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Validation error');
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh authentication token', async () => {
            // In a real implementation, this would validate the refresh token
            const response = await request(app)
                .post('/api/auth/refresh')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should handle logout request', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logged out successfully');
        });
    });

    describe('Rate Limiting', () => {
        it('should rate limit auth endpoints', async () => {
            const loginData = {
                email: 'rate-limit@example.com',
                password: 'password123',
            };

            // Make multiple requests to trigger rate limiting
            for (let i = 0; i < 10; i++) {
                await request(app)
                    .post('/api/auth/login')
                    .send(loginData);
            }

            // This request should be rate limited
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(429);

            expect(response.body.error).toContain('Too many requests');
        });
    });
});