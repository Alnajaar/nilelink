import { DeliveryTask } from './DeliveryEngine';

export class RouteEngine {

    optimizeRoute(currentLocation: { lat: number; lng: number }, tasks: DeliveryTask[]): DeliveryTask[] {
        // Mock Optimization: Sort by distance from current location (simple greedy)
        // In fully realized Phase 4, this would use OSRM or Google Maps API

        const sorted = [...tasks].sort((a, b) => {
            const distA = this.calcDistance(currentLocation, a.coordinates);
            const distB = this.calcDistance(currentLocation, b.coordinates);
            return distA - distB;
        });

        return sorted;
    }

    private calcDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) {
        return Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lng - p1.lng, 2));
    }
}
