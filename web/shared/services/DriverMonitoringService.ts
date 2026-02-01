import { DatabaseService } from './DatabaseService';

interface DriverLocation {
  id: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number; // in meters
  timestamp: number;
  speed?: number; // in km/h
  heading?: number; // in degrees
  altitude?: number; // in meters
  batteryLevel?: number; // percentage
  isCharging?: boolean;
  appVersion?: string;
  networkType?: 'wifi' | 'cellular' | 'unknown';
}

interface DriverPerformance {
  id: string;
  driverId: string;
  period: string; // YYYY-MM or YYYY-WW
  deliveriesCompleted: number;
  deliveriesAttempted: number;
  avgRating: number;
  totalEarnings: number;
  totalDistance: number; // in km
  totalTime: number; // in minutes
  cancellationRate: number; // percentage
  avgDeliveryTime: number; // in minutes
  onTimeRate: number; // percentage
  customerComplaints: number;
  customerCompliments: number;
  violations: number; // traffic, parking, etc.
  createdAt: number;
  updatedAt: number;
}

interface DriverEvent {
  id: string;
  driverId: string;
  eventType: 'location_update' | 'delivery_start' | 'delivery_pickup' | 'delivery_dropoff' | 'delivery_cancel' | 'status_change' | 'violation' | 'incident';
  timestamp: number;
  location?: DriverLocation;
  details: Record<string, any>;
  metadata: Record<string, any>;
}

interface DriverStatus {
  id: string;
  driverId: string;
  status: 'online' | 'offline' | 'busy' | 'break' | 'away' | 'emergency';
  location?: DriverLocation;
  lastStatusUpdate: number;
  vehicleType?: 'car' | 'bike' | 'motorcycle' | 'scooter';
  vehiclePlate?: string;
  createdAt: number;
  updatedAt: number;
}

interface DriverBonus {
  id: string;
  driverId: string;
  type: 'performance' | 'referral' | 'retention' | 'peak_hours' | 'long_distance' | 'special_event';
  amount: number;
  reason: string;
  awardedBy: string;
  awardedAt: number;
  metadata: Record<string, any>;
}

class DriverMonitoringService {
  private static instance: DriverMonitoringService;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = new DatabaseService();
  }

  public static getInstance(): DriverMonitoringService {
    if (!DriverMonitoringService.instance) {
      DriverMonitoringService.instance = new DriverMonitoringService();
    }
    return DriverMonitoringService.instance;
  }

  /**
   * Update driver location in real-time
   */
  public async updateDriverLocation(driverId: string, location: Omit<DriverLocation, 'id' | 'timestamp' | 'driverId'>): Promise<DriverLocation> {
    const locationData: DriverLocation = {
      ...location,
      id: this.generateLocationId(),
      driverId,
      timestamp: Date.now()
    };

    await this.dbService.updateDriverLocation(locationData);
    
    // Update driver status with new location
    const currentStatus = await this.getDriverStatus(driverId);
    if (currentStatus) {
      await this.updateDriverStatus(driverId, { ...currentStatus, location: locationData });
    }

    // Log the location update event
    await this.logDriverEvent(driverId, 'location_update', { location: locationData });

    return locationData;
  }

  /**
   * Get driver current location
   */
  public async getDriverCurrentLocation(driverId: string): Promise<DriverLocation | null> {
    return await this.dbService.getDriverCurrentLocation(driverId);
  }

  /**
   * Get driver location history
   */
  public async getDriverLocationHistory(
    driverId: string, 
    startTime: number, 
    endTime: number,
    limit: number = 100
  ): Promise<DriverLocation[]> {
    return await this.dbService.getDriverLocationHistory(driverId, startTime, endTime, limit);
  }

  /**
   * Get all active drivers with locations
   */
  public async getActiveDriversWithLocations(): Promise<Array<{
    driverId: string;
    name: string;
    status: DriverStatus['status'];
    location: DriverLocation;
    vehicleType?: string;
  }>> {
    const activeStatuses: DriverStatus['status'][] = ['online', 'busy', 'away'];
    const statuses = await this.dbService.getActiveDriverStatuses(activeStatuses);
    
    const result = [];
    for (const status of statuses) {
      if (status.location) {
        const driver = await this.dbService.getDriverById(status.driverId);
        result.push({
          driverId: status.driverId,
          name: driver?.name || status.driverId,
          status: status.status,
          location: status.location,
          vehicleType: status.vehicleType
        });
      }
    }
    
    return result;
  }

  /**
   * Update driver status
   */
  public async updateDriverStatus(driverId: string, status: Omit<DriverStatus, 'id' | 'driverId' | 'createdAt' | 'updatedAt'>): Promise<DriverStatus> {
    const existingStatus = await this.getDriverStatus(driverId);
    
    if (existingStatus) {
      // Update existing status
      const updatedStatus: DriverStatus = {
        ...existingStatus,
        ...status,
        lastStatusUpdate: Date.now(),
        updatedAt: Date.now()
      };

      await this.dbService.updateDriverStatus(updatedStatus);
      
      // Log status change event
      if (existingStatus.status !== status.status) {
        await this.logDriverEvent(driverId, 'status_change', { 
          oldStatus: existingStatus.status, 
          newStatus: status.status 
        });
      }
      
      return updatedStatus;
    } else {
      // Create new status
      const newStatus: DriverStatus = {
        id: this.generateStatusId(),
        driverId,
        ...status,
        lastStatusUpdate: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await this.dbService.createDriverStatus(newStatus);
      
      // Log status change event
      await this.logDriverEvent(driverId, 'status_change', { 
        oldStatus: 'none', 
        newStatus: status.status 
      });
      
      return newStatus;
    }
  }

  /**
   * Get driver status
   */
  public async getDriverStatus(driverId: string): Promise<DriverStatus | null> {
    return await this.dbService.getDriverStatus(driverId);
  }

  /**
   * Get driver performance metrics
   */
  public async getDriverPerformance(driverId: string, period?: string): Promise<DriverPerformance[]> {
    if (period) {
      return await this.dbService.getDriverPerformanceByPeriod(driverId, period);
    }
    return await this.dbService.getDriverPerformance(driverId);
  }

  /**
   * Calculate and save driver performance for a period
   */
  public async calculateDriverPerformance(driverId: string, period: string): Promise<DriverPerformance> {
    // This would aggregate delivery data, ratings, etc. to calculate performance
    // For now, we'll return simulated data
    const performance: DriverPerformance = {
      id: this.generatePerformanceId(),
      driverId,
      period,
      deliveriesCompleted: Math.floor(Math.random() * 100) + 50,
      deliveriesAttempted: Math.floor(Math.random() * 100) + 55,
      avgRating: parseFloat((Math.random() * 1 + 4).toFixed(2)), // 4.0 - 5.0
      totalEarnings: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
      totalDistance: parseFloat((Math.random() * 500 + 200).toFixed(2)),
      totalTime: Math.floor(Math.random() * 400 + 100), // minutes
      cancellationRate: parseFloat((Math.random() * 5).toFixed(2)), // 0-5%
      avgDeliveryTime: Math.floor(Math.random() * 20 + 20), // 20-40 minutes
      onTimeRate: parseFloat((Math.random() * 15 + 85).toFixed(2)), // 85-100%
      customerComplaints: Math.floor(Math.random() * 3),
      customerCompliments: Math.floor(Math.random() * 10) + 5,
      violations: Math.floor(Math.random() * 2),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.dbService.saveDriverPerformance(performance);
    return performance;
  }

  /**
   * Get driver performance leaderboard
   */
  public async getDriverLeaderboard(period: string, limit: number = 10): Promise<DriverPerformance[]> {
    const allPerformance = await this.dbService.getAllDriverPerformance(period);
    
    // Sort by rating and deliveries completed
    return allPerformance
      .sort((a, b) => {
        // Primary sort: average rating descending
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        // Secondary sort: deliveries completed descending
        return b.deliveriesCompleted - a.deliveriesCompleted;
      })
      .slice(0, limit);
  }

  /**
   * Log a driver event
   */
  public async logDriverEvent(
    driverId: string, 
    eventType: DriverEvent['eventType'], 
    details: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<DriverEvent> {
    const event: DriverEvent = {
      id: this.generateEventId(),
      driverId,
      eventType,
      timestamp: Date.now(),
      details,
      metadata
    };

    // Include location if available
    const currentLocation = await this.getDriverCurrentLocation(driverId);
    if (currentLocation) {
      event.location = currentLocation;
    }

    await this.dbService.logDriverEvent(event);
    return event;
  }

  /**
   * Get driver events
   */
  public async getDriverEvents(
    driverId: string, 
    eventType?: DriverEvent['eventType'], 
    startTime?: number, 
    endTime?: number,
    limit: number = 50
  ): Promise<DriverEvent[]> {
    return await this.dbService.getDriverEvents(driverId, eventType, startTime, endTime, limit);
  }

  /**
   * Award bonus to driver
   */
  public async awardDriverBonus(
    driverId: string,
    bonusData: Omit<DriverBonus, 'id' | 'awardedAt'>
  ): Promise<DriverBonus> {
    const bonus: DriverBonus = {
      ...bonusData,
      id: this.generateBonusId(),
      awardedAt: Date.now(),
      metadata: bonusData.metadata || {}
    };

    await this.dbService.awardDriverBonus(bonus);
    
    // Log the bonus award event
    await this.logDriverEvent(driverId, 'status_change', { 
      bonusType: bonus.type,
      amount: bonus.amount,
      reason: bonus.reason
    });

    return bonus;
  }

  /**
   * Get driver bonuses
   */
  public async getDriverBonuses(driverId: string): Promise<DriverBonus[]> {
    return await this.dbService.getDriverBonuses(driverId);
  }

  /**
   * Monitor driver for violations or incidents
   */
  public async monitorDriver(driverId: string): Promise<{
    isViolating: boolean;
    violations: Array<{ type: string; severity: 'low' | 'medium' | 'high'; timestamp: number; details: any }>;
    incidents: Array<{ type: string; severity: 'low' | 'medium' | 'high'; timestamp: number; details: any }>;
    overallSafetyScore: number; // 0-100
  }> {
    // This would analyze driver behavior, location data, and events to detect violations
    // For now, we'll return simulated monitoring data
    
    const events = await this.getDriverEvents(driverId, undefined, Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    const violations = events
      .filter(event => event.eventType === 'violation')
      .map(event => ({
        type: event.details.violationType || 'unknown',
        severity: event.details.severity || 'medium' as const,
        timestamp: event.timestamp,
        details: event.details
      }));

    const incidents = events
      .filter(event => event.eventType === 'incident')
      .map(event => ({
        type: event.details.incidentType || 'unknown',
        severity: event.details.severity || 'medium' as const,
        timestamp: event.timestamp,
        details: event.details
      }));

    // Calculate safety score based on violations and incidents
    const violationPoints = violations.reduce((sum, v) => {
      if (v.severity === 'high') return sum + 10;
      if (v.severity === 'medium') return sum + 5;
      return sum + 2;
    }, 0);

    const incidentPoints = incidents.reduce((sum, i) => {
      if (i.severity === 'high') return sum + 15;
      if (i.severity === 'medium') return sum + 8;
      return sum + 3;
    }, 0);

    const totalPenaltyPoints = violationPoints + incidentPoints;
    const safetyScore = Math.max(0, 100 - totalPenaltyPoints);

    return {
      isViolating: violations.length > 0 || incidents.length > 0,
      violations,
      incidents,
      overallSafetyScore: safetyScore
    };
  }

  /**
   * Get driver analytics
   */
  public async getDriverAnalytics(driverId: string): Promise<{
    performanceTrends: Array<{ period: string; metric: string; value: number }>;
    efficiencyMetrics: {
      utilizationRate: number; // percentage of time online vs busy
      productivityRate: number; // deliveries per hour when busy
      fuelEfficiency: number; // km per liter (if applicable)
    };
    customerFeedback: {
      avgRating: number;
      complaintRate: number; // percentage
      complimentRate: number; // percentage
      commonFeedback: string[];
    };
    earnings: {
      weekly: number;
      monthly: number;
      yearly: number;
      projected: number;
    };
  }> {
    // This would aggregate various driver metrics
    // For now, we'll return simulated data
    return {
      performanceTrends: [
        { period: 'Jan', metric: 'deliveries', value: 85 },
        { period: 'Feb', metric: 'deliveries', value: 92 },
        { period: 'Mar', metric: 'deliveries', value: 78 },
        { period: 'Apr', metric: 'deliveries', value: 95 },
      ],
      efficiencyMetrics: {
        utilizationRate: parseFloat((Math.random() * 20 + 70).toFixed(2)), // 70-90%
        productivityRate: parseFloat((Math.random() * 5 + 8).toFixed(2)), // 8-13 deliveries/hour
        fuelEfficiency: parseFloat((Math.random() * 5 + 10).toFixed(2)) // 10-15 km/liter
      },
      customerFeedback: {
        avgRating: parseFloat((Math.random() * 1 + 4).toFixed(2)), // 4.0-5.0
        complaintRate: parseFloat((Math.random() * 3).toFixed(2)), // 0-3%
        complimentRate: parseFloat((Math.random() * 10 + 5).toFixed(2)), // 5-15%
        commonFeedback: ['Punctual', 'Friendly', 'Careful handling']
      },
      earnings: {
        weekly: parseFloat((Math.random() * 300 + 150).toFixed(2)),
        monthly: parseFloat((Math.random() * 1200 + 600).toFixed(2)),
        yearly: parseFloat((Math.random() * 15000 + 8000).toFixed(2)),
        projected: parseFloat((Math.random() * 18000 + 10000).toFixed(2))
      }
    };
  }

  /**
   * Get all driver statuses
   */
  public async getAllDriverStatuses(): Promise<DriverStatus[]> {
    return await this.dbService.getAllDriverStatuses();
  }

  /**
   * Get drivers by status
   */
  public async getDriversByStatus(status: DriverStatus['status']): Promise<string[]> {
    return await this.dbService.getDriverIdsByStatus(status);
  }

  /**
   * Generate driver performance reports
   */
  public async generateDriverPerformanceReport(
    filters?: {
      period?: string;
      minRating?: number;
      minDeliveries?: number;
      status?: DriverStatus['status'];
    }
  ): Promise<Array<{
    driverId: string;
    name: string;
    status: DriverStatus['status'];
    performance: DriverPerformance;
    safetyScore: number;
    bonusEligibility: boolean;
  }>> {
    // Get all drivers based on filters
    let driverIds: string[] = [];
    
    if (filters?.status) {
      driverIds = await this.getDriversByStatus(filters.status);
    } else {
      // Get all driver IDs
      const allStatuses = await this.getAllDriverStatuses();
      driverIds = allStatuses.map(s => s.driverId);
    }

    const report = [];
    for (const driverId of driverIds) {
      const status = await this.getDriverStatus(driverId);
      if (!status) continue;

      // Get latest performance data
      const performances = await this.getDriverPerformance(driverId, filters?.period);
      const latestPerformance = performances.length > 0 
        ? performances[0] 
        : await this.calculateDriverPerformance(driverId, filters?.period || this.getCurrentPeriod());

      // Get safety score
      const monitoring = await this.monitorDriver(driverId);

      // Check bonus eligibility (example criteria)
      const bonusEligibility = latestPerformance.avgRating >= 4.5 && 
                              latestPerformance.onTimeRate >= 90 &&
                              monitoring.overallSafetyScore >= 80;

      // Skip if filters don't match
      if (filters?.minRating && latestPerformance.avgRating < filters.minRating) continue;
      if (filters?.minDeliveries && latestPerformance.deliveriesCompleted < filters.minDeliveries) continue;

      const driver = await this.dbService.getDriverById(driverId);
      
      report.push({
        driverId,
        name: driver?.name || driverId,
        status: status.status,
        performance: latestPerformance,
        safetyScore: monitoring.overallSafetyScore,
        bonusEligibility
      });
    }

    return report;
  }

  /**
   * Get current period in YYYY-MM format
   */
  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  /**
   * Generate a unique ID for locations
   */
  private generateLocationId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for statuses
   */
  private generateStatusId(): string {
    return `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for performance records
   */
  private generatePerformanceId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for events
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for bonuses
   */
  private generateBonusId(): string {
    return `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const driverMonitoringService = DriverMonitoringService.getInstance();

// Export types
export type { DriverLocation, DriverPerformance, DriverEvent, DriverStatus, DriverBonus };
export { DriverMonitoringService };