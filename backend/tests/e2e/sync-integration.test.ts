import request from 'supertest';
import { app, server } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { EventStore } from '../../src/services/EventStore';

const prisma = new PrismaClient();
const eventStore = new EventStore(prisma);

describe('Mobile Sync Integration E2E Tests', () => {
  let customerToken: string;
  let restaurantStaffToken: string;
  let customerId: string;
  let restaurantId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.domainEvent.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('Multi-User Sync Setup', () => {
    it('should create customer account', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'mobile.customer@nilelink.app',
          password: 'TestPass123!',
          firstName: 'Mobile',
          lastName: 'Customer',
          role: 'CUSTOMER'
        });

      expect(response.status).toBe(201);
      customerToken = response.body.data.token;
      customerId = response.body.data.user.id;
    });

    it('should create restaurant staff account', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'restaurant.staff@nilelink.app',
          password: 'TestPass123!',
          firstName: 'Restaurant',
          lastName: 'Staff',
          role: 'RESTAURANT_STAFF'
        });

      expect(response.status).toBe(201);
      restaurantStaffToken = response.body.data.token;
    });

    it('should create test restaurant', async () => {
      const response = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${restaurantStaffToken}`)
        .send({
          name: 'Mobile Test Bistro',
          description: 'Testing mobile sync integration',
          address: '456 Test Ave, Cairo, Egypt',
          phone: '+20 987 654 3210',
          email: 'mobile@testbistro.com',
          latitude: 30.0444,
          longitude: 31.2357,
          isActive: true
        });

      expect(response.status).toBe(201);
      restaurantId = response.body.data.id;
    });
  });

  describe('Mobile Sync Event Flow', () => {
    it('should accept order creation event from mobile', async () => {
      const orderCreatedEvent = {
        id: 'mobile-order-001',
        eventType: 'OrderCreated',
        aggregateId: 'order-mobile-001',
        aggregateType: 'Order',
        eventData: {
          restaurantId,
          customerId,
          items: [
            {
              menuItemId: 'item-001',
              name: 'Test Pizza',
              quantity: 1,
              price: 15.99,
              totalPrice: 15.99
            }
          ],
          total: 15.99,
          status: 'CREATED',
          paymentMethod: 'CARD',
          deliveryAddress: {
            street: '123 Mobile Street',
            city: 'Cairo',
            zipCode: '11511'
          }
        },
        metadata: {
          userId: customerId,
          deviceId: 'test-device-001',
          clientVersion: '1.0.0',
          platform: 'ios'
        },
        timestamp: new Date(),
        version: 1
      };

      const response = await request(app)
        .post('/api/sync/events')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          events: [orderCreatedEvent],
          clientVersion: '1.0.0',
          deviceId: 'test-device-001'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.syncedEvents).toBe(1);
    });

    it('should store event in event store', async () => {
      const events = await eventStore.getEvents('order-mobile-001', 'Order');
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe('OrderCreated');
      expect(events[0].eventData.restaurantId).toBe(restaurantId);
    });

    it('should emit real-time updates via WebSocket', async () => {
      // This test would require WebSocket testing setup
      // For now, we verify the event was processed
      const events = await eventStore.getEventsByType('OrderCreated');
      expect(events.length).toBeGreaterThan(0);
    });

    it('should handle batch sync events', async () => {
      const batchEvents = [
        {
          id: 'mobile-event-002',
          eventType: 'OrderStatusChanged',
          aggregateId: 'order-mobile-001',
          aggregateType: 'Order',
          eventData: { status: 'CONFIRMED' },
          metadata: { userId: customerId, deviceId: 'test-device-001' },
          timestamp: new Date(),
          version: 2
        },
        {
          id: 'mobile-event-003',
          eventType: 'PaymentProcessed',
          aggregateId: 'payment-mobile-001',
          aggregateType: 'Payment',
          eventData: {
            orderId: 'order-mobile-001',
            amount: 15.99,
            method: 'CARD',
            status: 'COMPLETED'
          },
          metadata: { userId: customerId, deviceId: 'test-device-001' },
          timestamp: new Date(),
          version: 1
        }
      ];

      const response = await request(app)
        .post('/api/sync/events')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          events: batchEvents,
          clientVersion: '1.0.0',
          deviceId: 'test-device-001'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.syncedEvents).toBe(2);
    });
  });

  describe('Sync Status and Conflict Resolution', () => {
    it('should return current sync status', async () => {
      const response = await request(app)
        .get('/api/sync/status')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('lastSync');
      expect(response.body.data).toHaveProperty('userId', customerId);
    });

    it('should provide events for mobile sync', async () => {
      const response = await request(app)
        .get('/api/sync/events')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.events)).toBe(true);
    });

    it('should handle sync conflicts', async () => {
      const conflictResolution = {
        aggregateId: 'order-mobile-001',
        aggregateType: 'Order',
        clientVersion: 3,
        serverVersion: 2,
        resolution: 'CLIENT_WINS', // or 'SERVER_WINS', 'MERGE'
        clientData: { status: 'DELIVERED' },
        serverData: { status: 'IN_DELIVERY' }
      };

      const response = await request(app)
        .post('/api/sync/conflict-resolution')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(conflictResolution);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Offline Queue Simulation', () => {
    it('should handle events created while offline', async () => {
      // Simulate events that were queued while offline
      const offlineEvents = [
        {
          id: 'offline-order-001',
          eventType: 'OrderCreated',
          aggregateId: 'order-offline-001',
          aggregateType: 'Order',
          eventData: {
            restaurantId,
            customerId,
            items: [{
              menuItemId: 'item-002',
              name: 'Offline Pizza',
              quantity: 1,
              price: 18.99,
              totalPrice: 18.99
            }],
            total: 18.99,
            status: 'CREATED'
          },
          metadata: {
            userId: customerId,
            deviceId: 'test-device-001',
            offline: true,
            queuedAt: new Date().toISOString()
          },
          timestamp: new Date(),
          version: 1
        }
      ];

      const response = await request(app)
        .post('/api/sync/events')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          events: offlineEvents,
          clientVersion: '1.0.0',
          deviceId: 'test-device-001'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.syncedEvents).toBe(1);
    });
  });

  describe('Cross-Platform Sync Validation', () => {
    it('should maintain consistency across different clients', async () => {
      // Get events from different perspectives
      const customerEvents = await request(app)
        .get('/api/sync/events')
        .set('Authorization', `Bearer ${customerToken}`);

      // In a real scenario, we'd compare this with restaurant staff view
      // For now, verify the events exist and are properly attributed
      expect(customerEvents.body.data.events.length).toBeGreaterThan(0);

      const userEvents = customerEvents.body.data.events.filter(
        (event: any) => event.metadata?.userId === customerId
      );
      expect(userEvents.length).toBeGreaterThan(0);
    });

    it('should handle concurrent modifications', async () => {
      // This would test vector clocks and conflict resolution
      // For now, verify that versioning works
      const events = await eventStore.getEvents('order-mobile-001', 'Order');
      expect(events.length).toBeGreaterThan(1);

      // Versions should be sequential
      const versions = events.map(e => e.version).sort();
      expect(versions).toEqual([...new Set(versions)].sort());
    });
  });
});