import { DatabaseService } from './DatabaseService';

interface DeliveryOffer {
  id: string;
  title: string;
  description: string;
  type: 'free_delivery' | 'discount_delivery' | 'special_promotion' | 'free_item_with_delivery';
  value: number; // percentage or fixed amount
  eligibility: 'all_customers' | 'new_customers' | 'loyal_customers' | 'specific_restaurants';
  targetRestaurants?: string[]; // specific restaurants if applicable
  startDate: number;
  endDate: number;
  status: 'active' | 'inactive' | 'expired';
  createdBy: string;
  createdAt: number;
  metadata: Record<string, any>;
}

interface DeliveryZone {
  id: string;
  name: string;
  zoneCode: string;
  coordinates: { lat: number; lng: number }[];
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number; // in minutes
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface DeliveryFleet {
  id: string;
  name: string;
  capacity: number; // number of simultaneous deliveries
  operatingHours: { start: string; end: string }; // HH:MM format
  zones: string[]; // zone IDs this fleet serves
  activeDrivers: number;
  totalCapacity: number;
  utilizationRate: number;
  createdAt: number;
  updatedAt: number;
}

class DeliveryControlService {
  private static instance: DeliveryControlService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = new DatabaseService();
  }

  public static getInstance(): DeliveryControlService {
    if (!DeliveryControlService.instance) {
      DeliveryControlService.instance = new DeliveryControlService();
    }
    return DeliveryControlService.instance;
  }

  /**
   * Create a new delivery offer
   */
  public async createDeliveryOffer(
    offerData: Omit<DeliveryOffer, 'id' | 'createdAt' | 'status'>,
    createdBy: string
  ): Promise<DeliveryOffer> {
    const offer: DeliveryOffer = {
      ...offerData,
      id: this.generateId(),
      createdBy,
      createdAt: Date.now(),
      status: 'active',
      metadata: offerData.metadata || {}
    };

    await this.dbService.createDeliveryOffer(offer);
    
    // Send notification about the new offer
    await this.notifyAboutOffer(offer);

    return offer;
  }

  /**
   * Update a delivery offer
   */
  public async updateDeliveryOffer(offerId: string, updates: Partial<DeliveryOffer>): Promise<DeliveryOffer> {
    const existingOffer = await this.getDeliveryOfferById(offerId);
    if (!existingOffer) {
      throw new Error('Delivery offer not found');
    }

    const updatedOffer: DeliveryOffer = {
      ...existingOffer,
      ...updates,
      updatedAt: Date.now()
    };

    await this.dbService.updateDeliveryOffer(updatedOffer);
    
    // Send notification if the offer becomes active/inactive
    if (existingOffer.status !== updatedOffer.status) {
      await this.notifyAboutOfferStatusChange(updatedOffer);
    }

    return updatedOffer;
  }

  /**
   * Get delivery offer by ID
   */
  public async getDeliveryOfferById(offerId: string): Promise<DeliveryOffer | null> {
    return await this.dbService.getDeliveryOfferById(offerId);
  }

  /**
   * Get all active delivery offers
   */
  public async getActiveDeliveryOffers(): Promise<DeliveryOffer[]> {
    return await this.dbService.getActiveDeliveryOffers();
  }

  /**
   * Get delivery offers by type
   */
  public async getDeliveryOffersByType(type: DeliveryOffer['type']): Promise<DeliveryOffer[]> {
    return await this.dbService.getDeliveryOffersByType(type);
  }

  /**
   * Get delivery offers by eligibility
   */
  public async getDeliveryOffersByEligibility(eligibility: DeliveryOffer['eligibility']): Promise<DeliveryOffer[]> {
    return await this.dbService.getDeliveryOffersByEligibility(eligibility);
  }

  /**
   * Activate a delivery offer
   */
  public async activateDeliveryOffer(offerId: string, activatedBy: string): Promise<DeliveryOffer> {
    return await this.updateDeliveryOffer(offerId, { 
      status: 'active',
      metadata: {
        ...this.getDeliveryOfferById(offerId)?.metadata,
        activatedBy,
        activatedAt: Date.now()
      }
    });
  }

  /**
   * Deactivate a delivery offer
   */
  public async deactivateDeliveryOffer(offerId: string, deactivatedBy: string): Promise<DeliveryOffer> {
    return await this.updateDeliveryOffer(offerId, { 
      status: 'inactive',
      metadata: {
        ...this.getDeliveryOfferById(offerId)?.metadata,
        deactivatedBy,
        deactivatedAt: Date.now()
      }
    });
  }

  /**
   * Create a new delivery zone
   */
  public async createDeliveryZone(zoneData: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryZone> {
    const zone: DeliveryZone = {
      ...zoneData,
      id: this.generateZoneId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.dbService.createDeliveryZone(zone);
    return zone;
  }

  /**
   * Update a delivery zone
   */
  public async updateDeliveryZone(zoneId: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const existingZone = await this.getDeliveryZoneById(zoneId);
    if (!existingZone) {
      throw new Error('Delivery zone not found');
    }

    const updatedZone: DeliveryZone = {
      ...existingZone,
      ...updates,
      updatedAt: Date.now()
    };

    await this.dbService.updateDeliveryZone(updatedZone);
    return updatedZone;
  }

  /**
   * Get delivery zone by ID
   */
  public async getDeliveryZoneById(zoneId: string): Promise<DeliveryZone | null> {
    return await this.dbService.getDeliveryZoneById(zoneId);
  }

  /**
   * Get delivery zones by active status
   */
  public async getDeliveryZonesByActiveStatus(isActive: boolean): Promise<DeliveryZone[]> {
    return await this.dbService.getDeliveryZonesByActiveStatus(isActive);
  }

  /**
   * Activate a delivery zone
   */
  public async activateDeliveryZone(zoneId: string): Promise<DeliveryZone> {
    return await this.updateDeliveryZone(zoneId, { 
      isActive: true,
      updatedAt: Date.now()
    });
  }

  /**
   * Deactivate a delivery zone
   */
  public async deactivateDeliveryZone(zoneId: string): Promise<DeliveryZone> {
    return await this.updateDeliveryZone(zoneId, { 
      isActive: false,
      updatedAt: Date.now()
    });
  }

  /**
   * Create a new delivery fleet
   */
  public async createDeliveryFleet(fleetData: Omit<DeliveryFleet, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryFleet> {
    const fleet: DeliveryFleet = {
      ...fleetData,
      id: this.generateFleetId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.dbService.createDeliveryFleet(fleet);
    return fleet;
  }

  /**
   * Update a delivery fleet
   */
  public async updateDeliveryFleet(fleetId: string, updates: Partial<DeliveryFleet>): Promise<DeliveryFleet> {
    const existingFleet = await this.getDeliveryFleetById(fleetId);
    if (!existingFleet) {
      throw new Error('Delivery fleet not found');
    }

    const updatedFleet: DeliveryFleet = {
      ...existingFleet,
      ...updates,
      updatedAt: Date.now()
    };

    await this.dbService.updateDeliveryFleet(updatedFleet);
    return updatedFleet;
  }

  /**
   * Get delivery fleet by ID
   */
  public async getDeliveryFleetById(fleetId: string): Promise<DeliveryFleet | null> {
    return await this.dbService.getDeliveryFleetById(fleetId);
  }

  /**
   * Get delivery fleets by zone
   */
  public async getDeliveryFleetsByZone(zoneId: string): Promise<DeliveryFleet[]> {
    return await this.dbService.getDeliveryFleetsByZone(zoneId);
  }

  /**
   * Get delivery statistics
   */
  public async getDeliveryStats(): Promise<{
    totalDeliveries: number;
    activeDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    averageDeliveryTime: number;
    totalRevenue: number;
    activeFleets: number;
    activeDrivers: number;
    zonesServed: number;
  }> {
    // This would aggregate delivery statistics from the database
    // For now, we'll return simulated data
    return {
      totalDeliveries: 1250,
      activeDeliveries: 45,
      completedDeliveries: 1200,
      cancelledDeliveries: 5,
      averageDeliveryTime: 28, // minutes
      totalRevenue: 15675.50,
      activeFleets: 3,
      activeDrivers: 32,
      zonesServed: 12
    };
  }

  /**
   * Get delivery performance by zone
   */
  public async getDeliveryPerformanceByZone(): Promise<Array<{
    zoneId: string;
    zoneName: string;
    totalDeliveries: number;
    averageDeliveryTime: number;
    successRate: number;
    revenue: number;
  }>> {
    // This would aggregate delivery performance data by zone
    // For now, we'll return simulated data
    const zones = await this.dbService.getAllDeliveryZones();
    
    return zones.map(zone => ({
      zoneId: zone.id,
      zoneName: zone.name,
      totalDeliveries: Math.floor(Math.random() * 100) + 50,
      averageDeliveryTime: Math.floor(Math.random() * 15) + 20, // 20-35 minutes
      successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      revenue: parseFloat((Math.random() * 5000).toFixed(2))
    }));
  }

  /**
   * Get delivery performance by fleet
   */
  public async getDeliveryPerformanceByFleet(): Promise<Array<{
    fleetId: string;
    fleetName: string;
    totalDeliveries: number;
    activeDeliveries: number;
    utilizationRate: number;
    averageDeliveryTime: number;
    successRate: number;
  }>> {
    // This would aggregate delivery performance data by fleet
    // For now, we'll return simulated data
    const fleets = await this.dbService.getAllDeliveryFleets();
    
    return fleets.map(fleet => ({
      fleetId: fleet.id,
      fleetName: fleet.name,
      totalDeliveries: Math.floor(Math.random() * 200) + 100,
      activeDeliveries: Math.floor(Math.random() * 10) + 5,
      utilizationRate: fleet.utilizationRate,
      averageDeliveryTime: Math.floor(Math.random() * 10) + 25, // 25-35 minutes
      successRate: Math.floor(Math.random() * 15) + 85 // 85-100%
    }));
  }

  /**
   * Apply delivery offer to specific restaurants
   */
  public async applyOfferToRestaurants(offerId: string, restaurantIds: string[]): Promise<void> {
    const offer = await this.getDeliveryOfferById(offerId);
    if (!offer) {
      throw new Error('Delivery offer not found');
    }

    // Update the offer with specific restaurant targets
    await this.updateDeliveryOffer(offerId, {
      targetRestaurants: restaurantIds,
      eligibility: 'specific_restaurants'
    });
  }

  /**
   * Get eligible offers for a customer
   */
  public async getEligibleOffersForCustomer(
    customerId: string,
    restaurantId?: string
  ): Promise<DeliveryOffer[]> {
    const allActiveOffers = await this.getActiveDeliveryOffers();
    
    // Filter offers based on eligibility criteria
    return allActiveOffers.filter(offer => {
      // Check if offer is within date range
      const now = Date.now();
      if (now < offer.startDate || now > offer.endDate) {
        return false;
      }

      // Check eligibility type
      if (offer.eligibility === 'all_customers') {
        return true;
      }

      // If specific restaurants are targeted, check if this restaurant is included
      if (offer.targetRestaurants && restaurantId) {
        return offer.targetRestaurants.includes(restaurantId);
      }

      // For other eligibility types, we'd need customer data to determine eligibility
      // This is a simplified implementation
      return true;
    });
  }

  /**
   * Get delivery pricing matrix for distance-based pricing
   */
  public async getDeliveryPricingMatrix(): Promise<Record<string, any>> {
    // This would return the delivery pricing matrix based on distance, zones, etc.
    // For now, we'll return a simulated pricing matrix
    return {
      baseFee: 2.50,
      perKmRate: 0.50,
      minOrderAmount: 10.00,
      surgeMultiplier: 1.5, // during busy periods
      freeDeliveryThreshold: 25.00,
      zones: {
        'zone-1': { baseFee: 2.00, surcharge: 0 },
        'zone-2': { baseFee: 3.00, surcharge: 0.50 },
        'zone-3': { baseFee: 4.00, surcharge: 1.00 }
      }
    };
  }

  /**
   * Update delivery pricing matrix
   */
  public async updateDeliveryPricingMatrix(newMatrix: Record<string, any>): Promise<void> {
    // This would update the delivery pricing in the database
    await this.dbService.updateDeliveryPricingMatrix(newMatrix);
  }

  /**
   * Get delivery availability for a location
   */
  public async isDeliveryAvailable(location: { lat: number; lng: number }): Promise<{
    isAvailable: boolean;
    zoneId?: string;
    fee?: number;
    estimatedTime?: number;
  }> {
    // This would check if delivery is available for a specific location
    // For now, we'll return simulated data
    const zones = await this.dbService.getAllDeliveryZones();
    
    // Find the zone that contains this location (simplified)
    const zone = zones.find(z => z.isActive);
    
    if (zone) {
      return {
        isAvailable: true,
        zoneId: zone.id,
        fee: zone.deliveryFee,
        estimatedTime: zone.estimatedDeliveryTime
      };
    }
    
    return {
      isAvailable: false
    };
  }

  /**
   * Generate a unique ID for offers
   */
  private generateId(): string {
    return `doffer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for zones
   */
  private generateZoneId(): string {
    return `dzone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for fleets
   */
  private generateFleetId(): string {
    return `dfleet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notify about a new offer
   */
  private async notifyAboutOffer(offer: DeliveryOffer): Promise<void> {
    // This would send notifications to relevant parties
    console.log(`New delivery offer created: ${offer.title}`);
  }

  /**
   * Notify about offer status change
   */
  private async notifyAboutOfferStatusChange(offer: DeliveryOffer): Promise<void> {
    // This would send notifications about offer status changes
    console.log(`Delivery offer status changed: ${offer.title} is now ${offer.status}`);
  }

  /**
   * Get delivery offers by date range
   */
  public async getDeliveryOffersByDateRange(startDate: number, endDate: number): Promise<DeliveryOffer[]> {
    const allOffers = await this.dbService.getAllDeliveryOffers();
    return allOffers.filter(offer => 
      offer.startDate >= startDate && offer.endDate <= endDate
    );
  }

  /**
   * Get delivery analytics
   */
  public async getDeliveryAnalytics(): Promise<{
    dailyStats: Array<{ date: string; deliveries: number; revenue: number }>;
    hourlyStats: Array<{ hour: string; deliveries: number; successRate: number }>;
    performanceTrends: Array<{ period: string; growth: number; efficiency: number }>;
  }> {
    // Generate simulated analytics data
    const dailyStats = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return {
        date,
        deliveries: Math.floor(Math.random() * 100) + 50,
        revenue: parseFloat((Math.random() * 2000).toFixed(2))
      };
    }).reverse();

    const hourlyStats = Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      return {
        hour,
        deliveries: Math.floor(Math.random() * 20) + 5,
        successRate: Math.floor(Math.random() * 20) + 80 // 80-100%
      };
    });

    const performanceTrends = Array.from({ length: 12 }, (_, i) => {
      const period = new Date(2023, i, 1).toLocaleString('default', { month: 'short', year: 'numeric' });
      return {
        period,
        growth: parseFloat((Math.random() * 15 - 5).toFixed(2)), // -5% to +10%
        efficiency: parseFloat((Math.random() * 15 + 85).toFixed(2)) // 85-100%
      };
    });

    return {
      dailyStats,
      hourlyStats,
      performanceTrends
    };
  }
}

// Export singleton instance
export const deliveryControlService = DeliveryControlService.getInstance();

// Export types
export type { DeliveryOffer, DeliveryZone, DeliveryFleet };
export { DeliveryControlService };