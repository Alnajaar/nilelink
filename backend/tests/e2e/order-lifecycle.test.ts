import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, server } from '../../src/app';
import { prisma } from '../../src/services/DatabasePoolService';
import { EventStore } from '../../src/services/EventStore';
const eventStore = new EventStore(prisma);

describe('Order Lifecycle E2E Tests', () => {
    let authToken: string;
    let restaurantId: string;
    let customerId: string;
    let createdMenuItems: any[] = [];

    /*
    beforeAll(async () => {
        // Clean up test data
        await prisma.order.deleteMany();
        await prisma.user.deleteMany();
        await prisma.restaurant.deleteMany();
        await prisma.domainEvent.deleteMany();
    });
    */

    afterAll(async () => {
        await prisma.$disconnect();
        server.close();
    });

    describe('Authentication Flow', () => {
        it('should register a new customer', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test.customer@nilelink.app',
                    password: 'TestPass123!',
                    firstName: 'Test',
                    lastName: 'Customer',
                    role: 'CUSTOMER',
                    subdomain: 'test'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();

            authToken = response.body.data.token;
            customerId = response.body.data.user.id;
        });

        it('should login with created account', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test.customer@nilelink.app',
                    password: 'TestPass123!'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });
    });

    describe('Restaurant Setup', () => {
        it('should create a test restaurant', async () => {
            const restaurantData = {
                name: 'Test Bistro',
                description: 'A test restaurant for E2E testing',
                address: '123 Test Street, Cairo, Egypt',
                phone: '+20 123 456 7890',
                email: 'test@testbistro.com',
                latitude: 30.0444,
                longitude: 31.2357,
                isActive: true
            };

            const response = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${authToken}`)
                .send(restaurantData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            restaurantId = response.body.data.id;
        });

        it('should create menu items for the restaurant', async () => {
            const menuItems = [
                {
                    name: 'Margherita Pizza',
                    description: 'Classic tomato, mozzarella, and basil',
                    price: 12.99,
                    category: 'Pizza',
                    isAvailable: true,
                    preparationTime: 15
                },
                {
                    name: 'Caesar Salad',
                    description: 'Romaine lettuce with Caesar dressing',
                    price: 8.99,
                    category: 'Salads',
                    isAvailable: true,
                    preparationTime: 5
                }
            ];

            for (const item of menuItems) {
                const response = await request(app)
                    .post(`/api/restaurants/${restaurantId}/menu`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(item);

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                createdMenuItems.push(response.body.data);
            }
        });
    });

    describe('Order Creation Flow', () => {
        it('should create a new order', async () => {
            const orderData = {
                restaurantId,
                customerId,
                items: [
                    {
                        menuItemId: createdMenuItems[0].id,
                        quantity: 2,
                        specialInstructions: 'Extra cheese please'
                    },
                    {
                        menuItemId: createdMenuItems[1].id,
                        quantity: 1,
                        specialInstructions: ''
                    }
                ]
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.order).toBeDefined();
        });

        it('should retrieve the created order', async () => {
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.orders)).toBe(true);
            expect(response.body.data.orders.length).toBeGreaterThan(0);
        });
    });

    describe('Order Status Updates', () => {
        let orderId: string;

        beforeAll(async () => {
            // Get the created order ID
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${authToken}`);

            orderId = response.body.data.orders[0].id;
        });

        it('should update order status to confirmed', async () => {
            const response = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'CONFIRMED'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should update order status to preparing', async () => {
            const response = await request(app)
                .patch(`/api/orders/${orderId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'PREPARING'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Event Store Validation', () => {
        it('should have recorded order events', async () => {
            const events = await eventStore.getEventsByType('OrderCreated');
            expect(events.length).toBeGreaterThan(0);

            const orderEvent = events[0];
            expect(orderEvent.eventType).toBe('OrderCreated');
            expect(orderEvent.eventData).toHaveProperty('restaurantId');
            expect(orderEvent.eventData).toHaveProperty('customerId');
        });

        it('should have recorded order status change events', async () => {
            const events = await eventStore.getEventsByType('OrderStatusChanged');
            expect(events.length).toBeGreaterThan(0);
        });
    });

    describe('Sync Engine Integration', () => {
        it('should accept mobile sync events', async () => {
            const syncEvent = {
                id: 'sync-event-1',
                eventType: 'OrderStatusChanged',
                aggregateId: 'order-123',
                aggregateType: 'Order',
                eventData: { status: 'DELIVERED' },
                metadata: { userId: customerId, deviceId: 'test-device' },
                timestamp: new Date(),
                version: 1
            };

            const response = await request(app)
                .post('/api/sync/events')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    events: [syncEvent],
                    clientVersion: '1.0.0',
                    deviceId: 'test-device'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.syncedEvents).toBe(1);
        });

        it('should return sync status', async () => {
            const response = await request(app)
                .get('/api/sync/status')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('status');
            expect(response.body.data).toHaveProperty('userId', customerId);
        });
    });
});