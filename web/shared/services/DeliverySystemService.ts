import { DatabaseService } from './DatabaseService';
import { driverMonitoringService } from './DriverMonitoringService';

interface DeliveryOrder {
  id: string;
  orderId: string; // Reference to the original order
  restaurantId: string;
  customerId: string;
  driverId?: string; // Assigned driver
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { lat: number; lng: number };
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { lat: number; lng: number };
  };
  status: 'pending_assignment' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  estimatedDeliveryTime: number; // timestamp
  actualDeliveryTime?: number; // timestamp
  deliveryFee: number;
  tipAmount: number;
  totalCharge: number;
  vehicleType?: 'car' | 'bike' | 'motorcycle' | 'scooter';
  specialInstructions?: string;
  trackingId: string;
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, any>;
}

interface DeliveryAssignment {
  id: string;
  deliveryOrderId: string;
  driverId: string;
  assignedAt: number;
  acceptedAt?: number;
  rejectedAt?: number;
  status: 'pending_acceptance' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  estimatedPickupTime: number;
  estimatedDeliveryTime: number;
  route: Array<{
    lat: number;
    lng: number;
    address: string;
    type: 'pickup' | 'delivery';
    estimatedArrival: number;
  }>;
  metadata: Record<string, any>;
}

interface DeliveryRoute {
  id: string;
  driverId: string;
  deliveryIds: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  totalDistance: number; // in km
  estimatedDuration: number; // in minutes
  plannedStops: number;
  completedStops: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  metadata: Record<string, any>;
}

interface DeliveryPayout {
  id: string;
  deliveryOrderId: string;
  driverId: string;
  baseAmount: number;
  tipAmount: number;
  bonusAmount: number;
  totalPayout: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  payoutDate?: number;
  transactionId?: string;
  metadata: Record<string, any>;
}

class DeliverySystemService {
  private static instance: DeliverySystemService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = new DatabaseService();
  }

  public static getInstance(): DeliverySystemService {
    if (!DeliverySystemService.instance) {
      DeliverySystemService.instance = new DeliverySystemService();
    }
    return DeliverySystemService.instance;
  }

  /**
   * Create a new delivery order
   */
  public async createDeliveryOrder(
    orderData: Omit<DeliveryOrder, 'id' | 'trackingId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<DeliveryOrder> {
    const deliveryOrder: DeliveryOrder = {
      ...orderData,
      id: this.generateId(),
      trackingId: this.generateTrackingId(),
      status: 'pending_assignment',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: orderData.metadata || {}
    };

    await this.dbService.createDeliveryOrder(deliveryOrder);
    
    // Automatically trigger driver assignment
    await this.autoAssignDriver(deliveryOrder.id);

    return deliveryOrder;
  }

  /**
   * Assign a driver to a delivery order
   */
  public async assignDriver(deliveryOrderId: string, driverId: string): Promise<DeliveryAssignment> {
    const deliveryOrder = await this.getDeliveryOrderById(deliveryOrderId);
    if (!deliveryOrder) {
      throw new Error('Delivery order not found');
    }

    if (deliveryOrder.status !== 'pending_assignment') {
      throw new Error('Delivery order is not in pending assignment status');
    }

    // Calculate estimated times
    const estimatedTimes = await this.calculateEstimatedTimes(
      deliveryOrder.pickupAddress.coordinates,
      deliveryOrder.deliveryAddress.coordinates
    );

    const assignment: DeliveryAssignment = {
      id: this.generateAssignmentId(),
      deliveryOrderId,
      driverId,
      assignedAt: Date.now(),
      status: 'pending_acceptance',
      estimatedPickupTime: estimatedTimes.estimatedPickupTime,
      estimatedDeliveryTime: estimatedTimes.estimatedDeliveryTime,
      route: [
        {
          lat: deliveryOrder.pickupAddress.coordinates.lat,
          lng: deliveryOrder.pickupAddress.coordinates.lng,
          address: `${deliveryOrder.pickupAddress.street}, ${deliveryOrder.pickupAddress.city}`,
          type: 'pickup',
          estimatedArrival: estimatedTimes.estimatedPickupTime
        },
        {
          lat: deliveryOrder.deliveryAddress.coordinates.lat,
          lng: deliveryOrder.deliveryAddress.coordinates.lng,
          address: `${deliveryOrder.deliveryAddress.street}, ${deliveryOrder.deliveryAddress.city}`,
          type: 'delivery',
          estimatedArrival: estimatedTimes.estimatedDeliveryTime
        }
      ],
      metadata: {}
    };

    await this.dbService.createDeliveryAssignment(assignment);
    
    // Update delivery order status
    await this.updateDeliveryOrderStatus(deliveryOrderId, 'assigned', { assignedDriver: driverId });

    // Notify driver about the assignment
    await this.notifyDriverAssignment(driverId, assignment);

    return assignment;
  }

  /**
   * Auto-assign a driver to a delivery order based on availability and proximity
   */
  public async autoAssignDriver(deliveryOrderId: string): Promise<DeliveryAssignment | null> {
    const deliveryOrder = await this.getDeliveryOrderById(deliveryOrderId);
    if (!deliveryOrder) {
      throw new Error('Delivery order not found');
    }

    // Find available drivers near the pickup location
    const nearbyDrivers = await this.findNearbyAvailableDrivers(
      deliveryOrder.pickupAddress.coordinates,
      5 // Within 5km radius
    );

    if (nearbyDrivers.length === 0) {
      console.log(`No available drivers found for delivery ${deliveryOrderId}`);
      return null;
    }

    // Select the best driver (closest and highest rated)
    const bestDriver = nearbyDrivers.reduce((best, current) => {
      // Prefer higher rated drivers, but also consider proximity
      const currentScore = this.calculateDriverScore(current);
      const bestScore = this.calculateDriverScore(best);
      
      return currentScore > bestScore ? current : best;
    });

    // Assign the driver
    return await this.assignDriver(deliveryOrderId, bestDriver.driverId);
  }

  /**
   * Accept a delivery assignment
   */
  public async acceptAssignment(assignmentId: string, driverId: string): Promise<DeliveryAssignment> {
    const assignment = await this.getAssignmentById(assignmentId);
    if (!assignment || assignment.driverId !== driverId) {
      throw new Error('Assignment not found or unauthorized');
    }

    if (assignment.status !== 'pending_acceptance') {
      throw new Error('Assignment is not in pending acceptance status');
    }

    const updatedAssignment: DeliveryAssignment = {
      ...assignment,
      status: 'accepted',
      acceptedAt: Date.now()
    };

    await this.dbService.updateDeliveryAssignment(updatedAssignment);
    
    // Update delivery order status
    await this.updateDeliveryOrderStatus(assignment.deliveryOrderId, 'assigned', {
      driverId: driverId,
      acceptedAt: Date.now()
    });

    // Create a delivery route for the driver
    await this.createDeliveryRouteForAssignment(assignment);

    return updatedAssignment;
  }

  /**
   * Reject a delivery assignment
   */
  public async rejectAssignment(assignmentId: string, driverId: string, reason?: string): Promise<DeliveryAssignment> {
    const assignment = await this.getAssignmentById(assignmentId);
    if (!assignment || assignment.driverId !== driverId) {
      throw new Error('Assignment not found or unauthorized');
    }

    if (assignment.status !== 'pending_acceptance') {
      throw new Error('Assignment is not in pending acceptance status');
    }

    const updatedAssignment: DeliveryAssignment = {
      ...assignment,
      status: 'rejected',
      rejectedAt: Date.now()
    };

    await this.dbService.updateDeliveryAssignment(updatedAssignment);
    
    // Update delivery order status back to pending assignment
    await this.updateDeliveryOrderStatus(assignment.deliveryOrderId, 'pending_assignment', {
      rejectedAssignment: assignmentId,
      rejectionReason: reason
    });

    // Try to auto-assign another driver
    setTimeout(async () => {
      await this.autoAssignDriver(assignment.deliveryOrderId);
    }, 5000); // Wait 5 seconds before trying another assignment

    return updatedAssignment;
  }

  /**
   * Mark delivery as picked up
   */
  public async markAsPickedUp(deliveryOrderId: string, driverId: string): Promise<DeliveryOrder> {
    const deliveryOrder = await this.getDeliveryOrderById(deliveryOrderId);
    if (!deliveryOrder || deliveryOrder.driverId !== driverId) {
      throw new Error('Delivery order not found or unauthorized');
    }

    if (deliveryOrder.status !== 'assigned') {
      throw new Error('Delivery order is not in assigned status');
    }

    const updatedOrder = await this.updateDeliveryOrderStatus(deliveryOrderId, 'picked_up', {
      pickedUpAt: Date.now(),
      driverId
    });

    // Update assignment status
    const assignment = await this.getAssignmentByDeliveryOrderId(deliveryOrderId);
    if (assignment) {
      await this.updateAssignmentStatus(assignment.id, 'in_progress');
    }

    return updatedOrder;
  }

  /**
   * Mark delivery as delivered
   */
  public async markAsDelivered(
    deliveryOrderId: string, 
    driverId: string, 
    proofOfDelivery?: { photo?: string; signature?: string; notes?: string }
  ): Promise<DeliveryOrder> {
    const deliveryOrder = await this.getDeliveryOrderById(deliveryOrderId);
    if (!deliveryOrder || deliveryOrder.driverId !== driverId) {
      throw new Error('Delivery order not found or unauthorized');
    }

    if (deliveryOrder.status !== 'picked_up' && deliveryOrder.status !== 'in_transit') {
      throw new Error('Delivery order is not in transit or picked up status');
    }

    const updatedOrder = await this.updateDeliveryOrderStatus(deliveryOrderId, 'delivered', {
      actualDeliveryTime: Date.now(),
      proofOfDelivery,
      driverId
    });

    // Process driver payout
    await this.processDriverPayout(deliveryOrder);

    // Update assignment status
    const assignment = await this.getAssignmentByDeliveryOrderId(deliveryOrderId);
    if (assignment) {
      await this.updateAssignmentStatus(assignment.id, 'completed');
    }

    return updatedOrder;
  }

  /**
   * Update delivery order status
   */
  public async updateDeliveryOrderStatus(
    deliveryOrderId: string, 
    status: DeliveryOrder['status'], 
    metadataUpdates?: Record<string, any>
  ): Promise<DeliveryOrder> {
    const existingOrder = await this.getDeliveryOrderById(deliveryOrderId);
    if (!existingOrder) {
      throw new Error('Delivery order not found');
    }

    const updatedOrder: DeliveryOrder = {
      ...existingOrder,
      status,
      updatedAt: Date.now(),
      metadata: {
        ...existingOrder.metadata,
        ...metadataUpdates
      }
    };

    await this.dbService.updateDeliveryOrder(updatedOrder);
    return updatedOrder;
  }

  /**
   * Get delivery order by ID
   */
  public async getDeliveryOrderById(deliveryOrderId: string): Promise<DeliveryOrder | null> {
    return await this.dbService.getDeliveryOrderById(deliveryOrderId);
  }

  /**
   * Get delivery order by tracking ID
   */
  public async getDeliveryOrderByTrackingId(trackingId: string): Promise<DeliveryOrder | null> {
    return await this.dbService.getDeliveryOrderByTrackingId(trackingId);
  }

  /**
   * Get deliveries by status
   */
  public async getDeliveriesByStatus(status: DeliveryOrder['status']): Promise<DeliveryOrder[]> {
    return await this.dbService.getDeliveriesByStatus(status);
  }

  /**
   * Get deliveries by driver
   */
  public async getDeliveriesByDriver(driverId: string, status?: DeliveryOrder['status']): Promise<DeliveryOrder[]> {
    return await this.dbService.getDeliveriesByDriver(driverId, status);
  }

  /**
   * Get deliveries by customer
   */
  public async getDeliveriesByCustomer(customerId: string): Promise<DeliveryOrder[]> {
    return await this.dbService.getDeliveriesByCustomer(customerId);
  }

  /**
   * Get assignment by ID
   */
  public async getAssignmentById(assignmentId: string): Promise<DeliveryAssignment | null> {
    return await this.dbService.getDeliveryAssignmentById(assignmentId);
  }

  /**
   * Get assignment by delivery order ID
   */
  public async getAssignmentByDeliveryOrderId(deliveryOrderId: string): Promise<DeliveryAssignment | null> {
    return await this.dbService.getDeliveryAssignmentByOrderId(deliveryOrderId);
  }

  /**
   * Update assignment status
   */
  public async updateAssignmentStatus(
    assignmentId: string,
    status: DeliveryAssignment['status']
  ): Promise<DeliveryAssignment> {
    const existingAssignment = await this.getAssignmentById(assignmentId);
    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    const updatedAssignment: DeliveryAssignment = {
      ...existingAssignment,
      status
    };

    await this.dbService.updateDeliveryAssignment(updatedAssignment);
    return updatedAssignment;
  }

  /**
   * Find nearby available drivers
   */
  public async findNearbyAvailableDrivers(
    location: { lat: number; lng: number },
    radiusKm: number
  ): Promise<Array<{
    driverId: string;
    location: { lat: number; lng: number };
    distance: number; // in km
    status: string;
    rating: number;
  }>> {
    // Get all active drivers with locations
    const { driverMonitoringService } = await import('./DriverMonitoringService');
    const activeDrivers = await driverMonitoringService.getActiveDriversWithLocations();
    
    // Calculate distances and filter by radius
    const nearbyDrivers = activeDrivers
      .map(driver => {
        const distance = this.calculateDistance(
          location.lat, 
          location.lng, 
          driver.location.latitude, 
          driver.location.longitude
        );
        return {
          driverId: driver.driverId,
          location: { lat: driver.location.latitude, lng: driver.location.longitude },
          distance,
          status: driver.status,
          rating: 4.5 // Would come from driver profile in real implementation
        };
      })
      .filter(driver => driver.distance <= radiusKm && driver.status === 'online');

    return nearbyDrivers.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate estimated delivery times
   */
  private async calculateEstimatedTimes(
    pickupCoords: { lat: number; lng: number },
    dropoffCoords: { lat: number; lng: number }
  ): Promise<{ estimatedPickupTime: number; estimatedDeliveryTime: number }> {
    // Calculate distance
    const distance = this.calculateDistance(
      pickupCoords.lat,
      pickupCoords.lng,
      dropoffCoords.lat,
      dropoffCoords.lng
    );

    // Estimate travel time (average speed of 20 km/h in city)
    const travelTimeMinutes = (distance / 20) * 60;
    
    // Add buffer time for pickup (5 mins) and delivery (5 mins)
    const totalEstimatedTime = travelTimeMinutes + 10;
    
    const now = Date.now();
    const estimatedPickupTime = now + 5 * 60 * 1000; // 5 minutes from now
    const estimatedDeliveryTime = now + totalEstimatedTime * 60 * 1000;

    return {
      estimatedPickupTime,
      estimatedDeliveryTime
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Calculate driver score for assignment
   */
  private calculateDriverScore(driver: any): number {
    // A simple scoring algorithm - in reality this would be more complex
    // considering rating, proximity, availability, etc.
    let score = driver.rating || 4.0;
    
    // Closer drivers get higher scores
    score += (10 - Math.min(driver.distance, 10)) / 10;
    
    return score;
  }

  /**
   * Notify driver about assignment
   */
  private async notifyDriverAssignment(driverId: string, assignment: DeliveryAssignment): Promise<void> {
    // This would send a push notification to the driver's app
    console.log(`Assignment notified to driver ${driverId}: ${assignment.id}`);
  }

  /**
   * Create delivery route for assignment
   */
  private async createDeliveryRouteForAssignment(assignment: DeliveryAssignment): Promise<DeliveryRoute> {
    const route: DeliveryRoute = {
      id: this.generateRouteId(),
      driverId: assignment.driverId,
      deliveryIds: [assignment.deliveryOrderId],
      status: 'planned',
      totalDistance: assignment.route.reduce((total, stop, index, arr) => {
        if (index < arr.length - 1) {
          return total + this.calculateDistance(
            stop.lat, 
            stop.lng, 
            arr[index + 1].lat, 
            arr[index + 1].lng
          );
        }
        return total;
      }, 0),
      estimatedDuration: Math.round((assignment.estimatedDeliveryTime - assignment.estimatedPickupTime) / 60000), // in minutes
      plannedStops: assignment.route.length,
      completedStops: 0,
      createdAt: Date.now(),
      metadata: {}
    };

    await this.dbService.createDeliveryRoute(route);
    return route;
  }

  /**
   * Process driver payout
   */
  private async processDriverPayout(deliveryOrder: DeliveryOrder): Promise<DeliveryPayout> {
    if (!deliveryOrder.driverId) {
      throw new Error('No driver assigned to delivery order');
    }

    // Calculate payout amounts
    const baseAmount = deliveryOrder.deliveryFee;
    const tipAmount = deliveryOrder.tipAmount || 0;
    const bonusAmount = this.calculateDeliveryBonus(deliveryOrder); // Additional bonuses
    const totalPayout = baseAmount + tipAmount + bonusAmount;

    const payout: DeliveryPayout = {
      id: this.generatePayoutId(),
      deliveryOrderId: deliveryOrder.id,
      driverId: deliveryOrder.driverId,
      baseAmount,
      tipAmount,
      bonusAmount,
      totalPayout,
      currency: 'USD',
      status: 'pending'
    };

    await this.dbService.createDeliveryPayout(payout);
    
    // Update driver's earnings
    const { userManagementService } = await import('./UserManagementService');
    await userManagementService.updateUserEarnings(deliveryOrder.driverId, {
      totalEarnings: totalPayout,
      pendingEarnings: totalPayout
    });

    return payout;
  }

  /**
   * Calculate delivery bonus
   */
  private calculateDeliveryBonus(deliveryOrder: DeliveryOrder): number {
    // Bonuses based on various factors
    let bonus = 0;
    
    // Peak hour bonus
    const hour = new Date().getUTCHours();
    if ((hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19)) {
      bonus += 1.00; // $1.00 peak hour bonus
    }
    
    // Long distance bonus
    const distance = this.calculateDistance(
      deliveryOrder.pickupAddress.coordinates.lat,
      deliveryOrder.pickupAddress.coordinates.lng,
      deliveryOrder.deliveryAddress.coordinates.lat,
      deliveryOrder.deliveryAddress.coordinates.lng
    );
    
    if (distance > 5) {
      bonus += 0.50; // $0.50 for long distances
    }
    
    return bonus;
  }

  /**
   * Get delivery statistics
   */
  public async getDeliveryStats(): Promise<{
    totalDeliveries: number;
    completedDeliveries: number;
    activeDeliveries: number;
    avgDeliveryTime: number; // in minutes
    successRate: number; // percentage
    avgRating: number;
    totalRevenue: number;
    activeDrivers: number;
  }> {
    // This would aggregate delivery statistics from the database
    // For now, we'll return simulated data
    return {
      totalDeliveries: 1250,
      completedDeliveries: 1200,
      activeDeliveries: 45,
      avgDeliveryTime: 28, // minutes
      successRate: 96.8, // percentage
      avgRating: 4.7,
      totalRevenue: 15675.50,
      activeDrivers: 32
    };
  }

  /**
   * Get delivery analytics
   */
  public async getDeliveryAnalytics(): Promise<{
    dailyStats: Array<{ date: string; deliveries: number; revenue: number; avgRating: number }>;
    driverPerformance: Array<{ driverId: string; name: string; deliveries: number; avgRating: number; earnings: number }>;
    routeEfficiency: Array<{ routeId: string; distance: number; time: number; efficiency: number }>;
  }> {
    // This would aggregate delivery analytics from the database
    // For now, we'll return simulated data
    const dailyStats = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return {
        date,
        deliveries: Math.floor(Math.random() * 100) + 50,
        revenue: parseFloat((Math.random() * 2000).toFixed(2)),
        avgRating: parseFloat((Math.random() * 0.8 + 4.2).toFixed(2))
      };
    }).reverse();

    const driverPerformance = Array.from({ length: 10 }, (_, i) => ({
      driverId: `driver_${i}`,
      name: `Driver ${i}`,
      deliveries: Math.floor(Math.random() * 200) + 50,
      avgRating: parseFloat((Math.random() * 0.8 + 4.2).toFixed(2)),
      earnings: parseFloat((Math.random() * 3000).toFixed(2))
    }));

    const routeEfficiency = Array.from({ length: 20 }, (_, i) => ({
      routeId: `route_${i}`,
      distance: parseFloat((Math.random() * 20 + 5).toFixed(2)),
      time: Math.floor(Math.random() * 60 + 20), // minutes
      efficiency: parseFloat((Math.random() * 20 + 80).toFixed(2)) // percentage
    }));

    return {
      dailyStats,
      driverPerformance,
      routeEfficiency
    };
  }

  /**
   * Get delivery tracking information
   */
  public async getDeliveryTrackingInfo(trackingId: string): Promise<{
    status: DeliveryOrder['status'];
    location?: { lat: number; lng: number };
    estimatedDeliveryTime?: number;
    driverInfo?: {
      name: string;
      phone: string;
      rating: number;
      vehicleType?: string;
      vehiclePlate?: string;
    };
    progress: {
      currentStop: number;
      totalStops: number;
      percentage: number;
    };
  } | null> {
    const deliveryOrder = await this.getDeliveryOrderByTrackingId(trackingId);
    if (!deliveryOrder) {
      return null;
    }

    // Get driver location if delivery is in progress
    let driverLocation;
    if (deliveryOrder.driverId && 
        (deliveryOrder.status === 'in_transit' || deliveryOrder.status === 'picked_up')) {
      driverLocation = await driverMonitoringService.getDriverCurrentLocation(deliveryOrder.driverId);
    }

    // Get driver info
    let driverInfo;
    if (deliveryOrder.driverId) {
      // In a real implementation, this would fetch driver details
      driverInfo = {
        name: `Driver ${deliveryOrder.driverId.slice(-4)}`,
        phone: '+961-71-XXX-XXX',
        rating: 4.7,
        vehicleType: 'car',
        vehiclePlate: 'DEL-123'
      };
    }

    return {
      status: deliveryOrder.status,
      location: driverLocation ? {
        lat: driverLocation.latitude,
        lng: driverLocation.longitude
      } : undefined,
      estimatedDeliveryTime: deliveryOrder.estimatedDeliveryTime,
      driverInfo,
      progress: {
        currentStop: deliveryOrder.status === 'delivered' ? 2 : 
                    deliveryOrder.status === 'picked_up' ? 1 : 0,
        totalStops: 2,
        percentage: deliveryOrder.status === 'delivered' ? 100 :
                   deliveryOrder.status === 'picked_up' ? 50 : 0
      }
    };
  }

  /**
   * Generate a unique ID for deliveries
   */
  private generateId(): string {
    return `deliv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a tracking ID
   */
  private generateTrackingId(): string {
    return `NL${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  /**
   * Generate a unique ID for assignments
   */
  private generateAssignmentId(): string {
    return `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for routes
   */
  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for payouts
   */
  private generatePayoutId(): string {
    return `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const deliverySystemService = DeliverySystemService.getInstance();

// Export types
export type { DeliveryOrder, DeliveryAssignment, DeliveryRoute, DeliveryPayout };
export { DeliverySystemService };