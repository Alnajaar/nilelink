/**
 * Geospatial Service - GPS Enforcement & Location Management
 * 
 * Enforces GPS requirements for POS and Driver apps
 * Provides precise location tracking and validation
 */

import * as Location from 'expo-location';

export interface GPSCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp: number;
}

export interface LocationValidation {
    isValid: boolean;
    coordinates?: GPSCoordinates;
    error?: string;
    accuracy: 'high' | 'medium' | 'low' | 'none';
}

export interface RouteSegment {
    distance: number; // meters
    duration: number; // seconds
    instructions: string;
    coordinates: [number, number][];
}

export interface NavigationRoute {
    origin: GPSCoordinates;
    destination: GPSCoordinates;
    totalDistance: number;
    estimatedDuration: number;
    segments: RouteSegment[];
    lastMileInstructions?: string;
}

export class GeospatialService {
    private static instance: GeospatialService;
    private currentLocation: GPSCoordinates | null = null;
    private watchId: Location.LocationSubscription | null = null;
    private locationCallbacks: ((location: GPSCoordinates) => void)[] = [];

    private constructor() { }

    static getInstance(): GeospatialService {
        if (!GeospatialService.instance) {
            GeospatialService.instance = new GeospatialService();
        }
        return GeospatialService.instance;
    }

    /**
     * MANDATORY GPS CHECK - Enforces location requirement
     * Returns error if GPS is disabled or permission denied
     */
    async enforceGPSRequirement(): Promise<LocationValidation> {
        try {
            // Request foreground permissions
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                return {
                    isValid: false,
                    error: 'GPS permission denied. This app requires location access to function.',
                    accuracy: 'none'
                };
            }

            // Check if location services are enabled
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (!isEnabled) {
                return {
                    isValid: false,
                    error: 'GPS is disabled. Please enable location services in device settings.',
                    accuracy: 'none'
                };
            }

            // Get current location with high accuracy
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 1
            });

            const coordinates: GPSCoordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || 0,
                altitude: location.coords.altitude || undefined,
                heading: location.coords.heading || undefined,
                speed: location.coords.speed || undefined,
                timestamp: location.timestamp
            };

            this.currentLocation = coordinates;

            // Determine accuracy level
            let accuracyLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
            if (coordinates.accuracy <= 10) accuracyLevel = 'high';
            else if (coordinates.accuracy <= 50) accuracyLevel = 'medium';
            else if (coordinates.accuracy <= 100) accuracyLevel = 'low';

            return {
                isValid: true,
                coordinates,
                accuracy: accuracyLevel
            };

        } catch (error) {
            console.error('GPS enforcement failed:', error);
            return {
                isValid: false,
                error: 'Failed to access GPS. Please check device settings.',
                accuracy: 'none'
            };
        }
    }

    /**
     * Start continuous location tracking
     * Required for Driver app during active delivery
     */
    async startLocationTracking(callback: (location: GPSCoordinates) => void): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return false;

            this.locationCallbacks.push(callback);

            this.watchId = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Update every 5 seconds
                    distanceInterval: 10 // Or every 10 meters
                },
                (location) => {
                    const coordinates: GPSCoordinates = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        accuracy: location.coords.accuracy || 0,
                        altitude: location.coords.altitude || undefined,
                        heading: location.coords.heading || undefined,
                        speed: location.coords.speed || undefined,
                        timestamp: location.timestamp
                    };

                    this.currentLocation = coordinates;
                    this.locationCallbacks.forEach(cb => cb(coordinates));
                }
            );

            return true;
        } catch (error) {
            console.error('Failed to start location tracking:', error);
            return false;
        }
    }

    /**
     * Stop location tracking
     */
    stopLocationTracking(): void {
        if (this.watchId) {
            this.watchId.remove();
            this.watchId = null;
        }
        this.locationCallbacks = [];
    }

    /**
     * Calculate distance between two points (Haversine formula)
     * Returns distance in meters
     */
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Calculate bearing between two points
     * Returns bearing in degrees (0-360)
     */
    calculateBearing(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x =
            Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);

        return ((θ * 180) / Math.PI + 360) % 360;
    }

    /**
     * LAST MILE ROUTING - Precise navigation to exact POS coordinates
     * Generates turn-by-turn instructions for final approach
     */
    async calculateLastMileRoute(
        currentLat: number,
        currentLon: number,
        targetLat: number,
        targetLon: number
    ): Promise<NavigationRoute> {
        const distance = this.calculateDistance(currentLat, currentLon, targetLat, targetLon);
        const bearing = this.calculateBearing(currentLat, currentLon, targetLat, targetLon);

        // Generate last mile instructions based on distance and bearing
        let lastMileInstructions = '';

        if (distance < 10) {
            lastMileInstructions = '🎯 You have arrived at the destination';
        } else if (distance < 50) {
            lastMileInstructions = `📍 Destination is ${Math.round(distance)}m ahead. Look for the restaurant entrance.`;
        } else if (distance < 200) {
            const direction = this.getCardinalDirection(bearing);
            lastMileInstructions = `🧭 Continue ${direction} for ${Math.round(distance)}m. Destination will be on your ${this.getRelativeDirection(bearing)}.`;
        } else {
            const direction = this.getCardinalDirection(bearing);
            lastMileInstructions = `➡️ Head ${direction} for ${Math.round(distance)}m`;
        }

        // Create simple route (in production, integrate with Google Maps/Mapbox)
        const route: NavigationRoute = {
            origin: {
                latitude: currentLat,
                longitude: currentLon,
                accuracy: 0,
                timestamp: Date.now()
            },
            destination: {
                latitude: targetLat,
                longitude: targetLon,
                accuracy: 0,
                timestamp: Date.now()
            },
            totalDistance: distance,
            estimatedDuration: Math.ceil(distance / 1.4), // Assume 1.4 m/s walking speed
            segments: [{
                distance,
                duration: Math.ceil(distance / 1.4),
                instructions: lastMileInstructions,
                coordinates: [[currentLon, currentLat], [targetLon, targetLat]]
            }],
            lastMileInstructions
        };

        return route;
    }

    /**
     * Verify driver is at pickup/delivery location
     * Returns true if within acceptable radius (default 50m)
     */
    verifyLocationProximity(
        currentLat: number,
        currentLon: number,
        targetLat: number,
        targetLon: number,
        radiusMeters: number = 50
    ): { isNearby: boolean; distance: number; message: string } {
        const distance = this.calculateDistance(currentLat, currentLon, targetLat, targetLon);

        if (distance <= radiusMeters) {
            return {
                isNearby: true,
                distance,
                message: `✅ Location verified (${Math.round(distance)}m from target)`
            };
        } else {
            return {
                isNearby: false,
                distance,
                message: `❌ You are ${Math.round(distance)}m away. Please move closer to the location.`
            };
        }
    }

    private getCardinalDirection(bearing: number): string {
        const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
        const index = Math.round(bearing / 45) % 8;
        return directions[index];
    }

    private getRelativeDirection(bearing: number): string {
        if (bearing >= 315 || bearing < 45) return 'right';
        if (bearing >= 45 && bearing < 135) return 'right';
        if (bearing >= 135 && bearing < 225) return 'left';
        return 'left';
    }

    getCurrentLocation(): GPSCoordinates | null {
        return this.currentLocation;
    }
}

export const geospatialService = GeospatialService.getInstance();
