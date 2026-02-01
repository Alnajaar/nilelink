// Real-Time Tracking Engine
// Live delivery tracking with customer visibility and ETA predictions

import { eventBus, createEvent } from '../core/EventBus';
import { deliveryRoutingEngine, DeliveryOrder, DeliveryDriver } from './DeliveryRoutingEngine';

export enum TrackingEventType {
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  ARRIVED_AT_STOP = 'arrived_at_stop',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED_TO_SENDER = 'returned_to_sender',
  DELAYED = 'delayed',
  LOCATION_UPDATE = 'location_update',
  ETA_UPDATE = 'eta_update',
  DRIVER_MESSAGE = 'driver_message'
}

export interface TrackingUpdate {
  id: string;
  deliveryId: string;
  eventType: TrackingEventType;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  driverId?: string;
  message?: string;
  estimatedArrival?: number;
  actualArrival?: number;
  photos?: string[]; // IPFS hashes
  signature?: string; // IPFS hash for digital signature
  metadata?: Record<string, any>;
}

export interface DeliveryTracking {
  deliveryId: string;
  currentStatus: string;
  estimatedDeliveryTime: number;
  actualDeliveryTime?: number;
  driverInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    photo?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  routeProgress: {
    completedStops: number;
    totalStops: number;
    nextStop?: {
      address: string;
      estimatedArrival: number;
    };
  };
  trackingHistory: TrackingUpdate[];
  lastUpdate: number;
  shareableLink?: string; // Public tracking link
}

export interface ETAPrediction {
  deliveryId: string;
  currentETA: number;
  confidence: number; // 0-100
  factors: {
    traffic: number; // Impact on ETA (-60 to +60 minutes)
    weather: number; // Impact on ETA (-30 to +30 minutes)
    driverPerformance: number; // Historical performance factor
    routeComplexity: number; // Additional stops, one-way streets
    timeOfDay: number; // Peak hours impact
  };
  alternativeRoutes?: {
    route: any;
    eta: number;
    reason: string;
  }[];
  lastUpdated: number;
}

export interface CustomerTrackingSession {
  sessionId: string;
  deliveryId: string;
  customerId: string;
  startTime: number;
  lastActivity: number;
  viewCount: number;
  shareCount: number;
  notificationsEnabled: boolean;
  preferredLanguage: string;
  timezone: string;
}

class RealTimeTrackingEngine {
  private trackingUpdates: Map<string, TrackingUpdate[]> = new Map();
  private deliveryTracking: Map<string, DeliveryTracking> = new Map();
  private etaPredictions: Map<string, ETAPrediction> = new Map();
  private trackingSessions: Map<string, CustomerTrackingSession> = new Map();
  private activeDeliveries: Set<string> = new Set();
  private locationUpdateInterval?: NodeJS.Timeout;
  private isInitialized = false;

  // Real-time update intervals
  private readonly LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
  private readonly ETA_UPDATE_INTERVAL = 60000; // 1 minute
  private readonly TRACKING_SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeEventListeners();
    this.startLocationTracking();
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for delivery events
    eventBus.subscribe('DELIVERY_ORDER_CREATED', (event) => {
      this.initializeDeliveryTracking(event.payload.delivery);
    });

    eventBus.subscribe('DELIVERY_STATUS_UPDATE', (event) => {
      this.handleDeliveryStatusUpdate(event.payload.deliveryId, event.payload.status, event.payload.metadata);
    });

    eventBus.subscribe('DRIVER_LOCATION_UPDATE', (event) => {
      this.handleDriverLocationUpdate(event.payload.driverId, event.payload.location);
    });

    eventBus.subscribe('DELIVERY_STATUS_CHANGED', (event) => {
      this.addTrackingUpdate(event.payload.deliveryId, {
        eventType: this.mapStatusToEventType(event.payload.status),
        message: `Delivery status: ${event.payload.status}`,
        metadata: event.payload.metadata
      });
    });

    // Listen for customer tracking requests
    eventBus.subscribe('CUSTOMER_TRACKING_REQUEST', (event) => {
      this.createTrackingSession(event.payload.deliveryId, event.payload.customerId);
    });
  }

  /**
   * Initialize tracking for a new delivery
   */
  private async initializeDeliveryTracking(delivery: DeliveryOrder): Promise<void> {
    const tracking: DeliveryTracking = {
      deliveryId: delivery.id,
      currentStatus: delivery.status,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime || Date.now() + (60 * 60 * 1000), // 1 hour default
      routeProgress: {
        completedStops: 0,
        totalStops: 1, // Simplified: pickup + delivery
        nextStop: delivery.estimatedDeliveryTime ? {
          address: delivery.deliveryLocation.address,
          estimatedArrival: delivery.estimatedDeliveryTime
        } : undefined
      },
      trackingHistory: [],
      lastUpdate: Date.now(),
      shareableLink: this.generateShareableLink(delivery.id)
    };

    this.deliveryTracking.set(delivery.id, tracking);
    this.activeDeliveries.add(delivery.id);

    // Initialize ETA prediction
    await this.calculateETAPrediction(delivery.id);

    await eventBus.publish(createEvent('DELIVERY_TRACKING_INITIALIZED', {
      deliveryId: delivery.id,
      shareableLink: tracking.shareableLink
    }, {
      source: 'RealTimeTrackingEngine'
    }));
  }

  /**
   * Handle delivery status updates
   */
  private async handleDeliveryStatusUpdate(
    deliveryId: string,
    status: string,
    metadata?: any
  ): Promise<void> {
    const tracking = this.deliveryTracking.get(deliveryId);
    if (!tracking) return;

    tracking.currentStatus = status;
    tracking.lastUpdate = Date.now();

    // Update progress based on status
    switch (status) {
      case 'picked_up':
        tracking.routeProgress.completedStops = 1;
        break;
      case 'delivered':
        tracking.routeProgress.completedStops = tracking.routeProgress.totalStops;
        tracking.actualDeliveryTime = Date.now();
        this.activeDeliveries.delete(deliveryId);
        break;
      case 'failed':
      case 'cancelled':
        this.activeDeliveries.delete(deliveryId);
        break;
    }

    // Notify tracking sessions
    await this.notifyTrackingSessions(deliveryId, {
      eventType: TrackingEventType.ETA_UPDATE,
      message: `Status updated: ${status}`,
      estimatedArrival: tracking.estimatedDeliveryTime
    });
  }

  /**
   * Handle driver location updates
   */
  private async handleDriverLocationUpdate(driverId: string, location: any): Promise<void> {
    // Find deliveries assigned to this driver
    for (const [deliveryId, tracking] of this.deliveryTracking) {
      const delivery = deliveryRoutingEngine.getDeliveryOrder(deliveryId);
      if (delivery?.assignedDriverId === driverId) {
        tracking.currentLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp
        };
        tracking.lastUpdate = Date.now();

        // Update ETA based on new location
        await this.calculateETAPrediction(deliveryId);

        // Notify tracking sessions
        await this.notifyTrackingSessions(deliveryId, {
          eventType: TrackingEventType.LOCATION_UPDATE,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || 10
          }
        });
      }
    }
  }

  /**
   * Calculate ETA prediction using AI
   */
  private async calculateETAPrediction(deliveryId: string): Promise<void> {
    const delivery = deliveryRoutingEngine.getDeliveryOrder(deliveryId);
    const tracking = this.deliveryTracking.get(deliveryId);

    if (!delivery || !tracking) return;

    // Get current factors affecting ETA
    const factors = await this.analyzeETAFactors(delivery, tracking);

    // Calculate confidence and adjustments
    const totalAdjustment = factors.traffic + factors.weather + factors.timeOfDay;
    const confidence = Math.max(60, 95 - Math.abs(totalAdjustment) / 2); // 60-95% confidence

    const currentETA = (tracking.estimatedDeliveryTime || Date.now()) + (totalAdjustment * 60 * 1000);

    const prediction: ETAPrediction = {
      deliveryId,
      currentETA,
      confidence,
      factors,
      lastUpdated: Date.now()
    };

    // Update tracking with new ETA
    tracking.estimatedDeliveryTime = currentETA;
    tracking.lastUpdate = Date.now();

    this.etaPredictions.set(deliveryId, prediction);

    // Notify if ETA changed significantly
    const previousETA = this.etaPredictions.get(deliveryId)?.currentETA;
    if (previousETA && Math.abs(currentETA - previousETA) > 10 * 60 * 1000) { // 10 minutes
      await this.notifyTrackingSessions(deliveryId, {
        eventType: TrackingEventType.ETA_UPDATE,
        message: `ETA updated: ${this.formatETA(currentETA)}`,
        estimatedArrival: currentETA
      });
    }

    await eventBus.publish(createEvent('ETA_UPDATED', {
      deliveryId,
      eta: currentETA,
      confidence,
      factors
    }, {
      source: 'RealTimeTrackingEngine'
    }));
  }

  /**
   * Analyze factors affecting ETA
   */
  private async analyzeETAFactors(delivery: DeliveryOrder, tracking: DeliveryTracking): Promise<ETAPrediction['factors']> {
    // Simplified analysis (real implementation would use external APIs)
    const now = new Date();
    const hour = now.getHours();

    let traffic = 0;
    let weather = 0;
    let timeOfDay = 0;

    // Traffic analysis
    if (hour >= 7 && hour <= 9) traffic += 15; // Morning rush
    if (hour >= 16 && hour <= 19) traffic += 20; // Evening rush

    // Weather impact (mock)
    weather = Math.random() * 10 - 5; // -5 to +5 minutes

    // Time of day factor
    if (hour >= 22 || hour <= 6) timeOfDay += 10; // Late night/early morning
    if (hour >= 11 && hour <= 14) timeOfDay -= 5; // Lunch time (faster)

    // Driver performance (based on historical data)
    const driverPerformance = 1.0; // Mock: 1.0 = on-time, 0.8 = slower

    // Route complexity
    const routeComplexity = delivery.priority === 'express' ? 5 : 0;

    return {
      traffic,
      weather,
      driverPerformance,
      routeComplexity,
      timeOfDay
    };
  }

  /**
   * Add tracking update
   */
  private async addTrackingUpdate(deliveryId: string, update: Omit<TrackingUpdate, 'id' | 'deliveryId' | 'timestamp'>): Promise<void> {
    const trackingUpdate: TrackingUpdate = {
      id: `tracking_${Date.now()}_${Math.random()}`,
      deliveryId,
      timestamp: Date.now(),
      ...update
    };

    if (!this.trackingUpdates.has(deliveryId)) {
      this.trackingUpdates.set(deliveryId, []);
    }

    this.trackingUpdates.get(deliveryId)!.push(trackingUpdate);

    // Update delivery tracking
    const tracking = this.deliveryTracking.get(deliveryId);
    if (tracking) {
      tracking.trackingHistory.push(trackingUpdate);
      tracking.lastUpdate = Date.now();
    }

    await eventBus.publish(createEvent('TRACKING_UPDATE_ADDED', {
      deliveryId,
      update: trackingUpdate
    }, {
      source: 'RealTimeTrackingEngine'
    }));
  }

  /**
   * Create customer tracking session
   */
  private async createTrackingSession(deliveryId: string, customerId: string): Promise<CustomerTrackingSession> {
    const sessionId = `tracking_session_${Date.now()}_${Math.random()}`;

    const session: CustomerTrackingSession = {
      sessionId,
      deliveryId,
      customerId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      viewCount: 0,
      shareCount: 0,
      notificationsEnabled: true,
      preferredLanguage: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    this.trackingSessions.set(sessionId, session);

    await eventBus.publish(createEvent('TRACKING_SESSION_CREATED', {
      session
    }, {
      source: 'RealTimeTrackingEngine'
    }));

    return session;
  }

  /**
   * Notify all tracking sessions for a delivery
   */
  private async notifyTrackingSessions(deliveryId: string, update: Partial<TrackingUpdate>): Promise<void> {
    const sessions = Array.from(this.trackingSessions.values())
      .filter(session => session.deliveryId === deliveryId);

    for (const session of sessions) {
      if (session.notificationsEnabled) {
        await eventBus.publish(createEvent('CUSTOMER_NOTIFICATION', {
          sessionId: session.sessionId,
          deliveryId,
          type: 'tracking_update',
          message: update.message || 'Delivery status updated',
          data: update
        }, {
          source: 'RealTimeTrackingEngine'
        }));
      }
    }
  }

  /**
   * Start location tracking for active deliveries
   */
  private startLocationTracking(): void {
    this.locationUpdateInterval = setInterval(async () => {
      for (const deliveryId of this.activeDeliveries) {
        const delivery = deliveryRoutingEngine.getDeliveryOrder(deliveryId);
        if (delivery?.assignedDriverId) {
          // In a real implementation, this would poll driver locations
          // For now, we'll simulate location updates
          this.simulateDriverLocationUpdate(delivery.assignedDriverId);
        }
      }
    }, this.LOCATION_UPDATE_INTERVAL);

    // ETA updates
    setInterval(() => {
      for (const deliveryId of this.activeDeliveries) {
        this.calculateETAPrediction(deliveryId);
      }
    }, this.ETA_UPDATE_INTERVAL);
  }

  /**
   * Simulate driver location updates (for development)
   */
  private simulateDriverLocationUpdate(driverId: string): void {
    // Find deliveries for this driver
    const deliveries = Array.from(this.deliveryTracking.values())
      .map(tracking => deliveryRoutingEngine.getDeliveryOrder(tracking.deliveryId))
      .filter(delivery => delivery?.assignedDriverId === driverId) as DeliveryOrder[];

    if (deliveries.length === 0) return;

    // Simulate movement towards delivery location
    for (const delivery of deliveries) {
      const tracking = this.deliveryTracking.get(delivery.id);
      if (!tracking) continue;

      // Simple simulation: move 100 meters closer every 30 seconds
      const currentLat = tracking.currentLocation?.latitude || delivery.deliveryLocation.latitude;
      const currentLng = tracking.currentLocation?.longitude || delivery.deliveryLocation.longitude;
      const targetLat = delivery.deliveryLocation.latitude;
      const targetLng = delivery.deliveryLocation.longitude;

      // Calculate direction
      const dLat = targetLat - currentLat;
      const dLng = targetLng - currentLng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      if (distance > 0.001) { // If more than ~100 meters away
        const step = 0.001; // Move 100 meters
        const newLat = currentLat + (dLat / distance) * step;
        const newLng = currentLng + (dLng / distance) * step;

        eventBus.publish({
          type: 'DRIVER_LOCATION_UPDATE',
          payload: {
            driverId,
            location: {
              latitude: newLat,
              longitude: newLng,
              timestamp: Date.now(),
              accuracy: 10
            }
          },
          metadata: { source: 'simulation' }
        });
      }
    }
  }

  /**
   * Generate shareable tracking link
   */
  private generateShareableLink(deliveryId: string): string {
    return `https://nilelink.com/track/${deliveryId}`;
  }

  /**
   * Format ETA for display
   */
  private formatETA(timestamp: number): string {
    const diff = timestamp - Date.now();
    const minutes = Math.round(diff / (60 * 1000));

    if (minutes < 0) return 'Overdue';
    if (minutes === 0) return 'Arriving now';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Map delivery status to tracking event type
   */
  private mapStatusToEventType(status: string): TrackingEventType {
    switch (status) {
      case 'picked_up': return TrackingEventType.PICKED_UP;
      case 'in_transit': return TrackingEventType.IN_TRANSIT;
      case 'out_for_delivery': return TrackingEventType.OUT_FOR_DELIVERY;
      case 'delivered': return TrackingEventType.DELIVERED;
      case 'failed': return TrackingEventType.FAILED_DELIVERY;
      case 'returned': return TrackingEventType.RETURNED_TO_SENDER;
      default: return TrackingEventType.DELAYED;
    }
  }

  /**
   * Get delivery tracking information
   */
  getDeliveryTracking(deliveryId: string): DeliveryTracking | null {
    return this.deliveryTracking.get(deliveryId) || null;
  }

  /**
   * Get ETA prediction
   */
  getETAPrediction(deliveryId: string): ETAPrediction | null {
    return this.etaPredictions.get(deliveryId) || null;
  }

  /**
   * Get tracking history
   */
  getTrackingHistory(deliveryId: string): TrackingUpdate[] {
    return this.trackingUpdates.get(deliveryId) || [];
  }

  /**
   * Update customer preferences for tracking
   */
  async updateTrackingPreferences(sessionId: string, preferences: Partial<CustomerTrackingSession>): Promise<void> {
    const session = this.trackingSessions.get(sessionId);
    if (session) {
      Object.assign(session, preferences);
      session.lastActivity = Date.now();
    }
  }

  /**
   * Get real-time dashboard data
   */
  getRealTimeDashboard(): {
    activeDeliveries: number;
    onTimeDeliveries: number;
    averageETA: number;
    totalDistance: number;
  } {
    const activeDeliveries = Array.from(this.deliveryTracking.values())
      .filter(t => this.activeDeliveries.has(t.deliveryId));

    const onTimeDeliveries = activeDeliveries.filter(t => {
      if (!t.estimatedDeliveryTime || !t.actualDeliveryTime) return true;
      return t.actualDeliveryTime <= t.estimatedDeliveryTime;
    }).length;

    const totalETA = activeDeliveries
      .filter(t => t.estimatedDeliveryTime)
      .reduce((sum, t) => sum + (t.estimatedDeliveryTime! - Date.now()), 0);

    const averageETA = activeDeliveries.length > 0 ? totalETA / activeDeliveries.length : 0;

    return {
      activeDeliveries: activeDeliveries.length,
      onTimeDeliveries,
      averageETA: Math.max(0, averageETA),
      totalDistance: 0 // Would calculate from route data
    };
  }

  /**
   * Initialize the engine
   */
  initialize(): void {
    this.isInitialized = true;
    console.log('RealTimeTrackingEngine: Initialized');
  }

  /**
   * Shutdown the engine
   */
  shutdown(): void {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
    this.isInitialized = false;
    console.log('RealTimeTrackingEngine: Shutdown');
  }
}

// Global real-time tracking engine instance
export const realTimeTrackingEngine = new RealTimeTrackingEngine();