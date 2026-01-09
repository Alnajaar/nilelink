import { LocationData } from '@/components/Map';

export interface Driver {
    id: string;
    name: string;
    status: 'active' | 'idle' | 'offline';
    latitude: number;
    longitude: number;
    currentDelivery?: string;
    completedToday: number;
    rating: number;
}

export interface Delivery {
    id: string;
    driverId: string;
    customerName: string;
    address: string;
    latitude: number;
    longitude: number;
    status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
    estimatedTime: string;
}

export const mockDrivers: Driver[] = [
    {
        id: 'driver-1',
        name: 'Ahmed Hassan',
        status: 'active',
        latitude: 30.0444,
        longitude: 31.2357,
        currentDelivery: 'del-101',
        completedToday: 12,
        rating: 4.8
    },
    {
        id: 'driver-2',
        name: 'Sara Mohamed',
        status: 'active',
        latitude: 30.0626,
        longitude: 31.2497,
        currentDelivery: 'del-102',
        completedToday: 15,
        rating: 4.9
    },
    {
        id: 'driver-3',
        name: 'Omar Ali',
        status: 'idle',
        latitude: 30.0330,
        longitude: 31.2336,
        completedToday: 8,
        rating: 4.7
    },
    {
        id: 'driver-4',
        name: 'Nour Ibrahim',
        status: 'active',
        latitude: 30.0500,
        longitude: 31.2400,
        currentDelivery: 'del-103',
        completedToday: 10,
        rating: 4.9
    }
];

export const mockDeliveries: Delivery[] = [
    {
        id: 'del-101',
        driverId: 'driver-1',
        customerName: 'Khaled Samir',
        address: '123 Tahrir Square',
        latitude: 30.0444,
        longitude: 31.2357,
        status: 'in_transit',
        estimatedTime: '15 mins'
    },
    {
        id: 'del-102',
        driverId: 'driver-2',
        customerName: 'Layla Ahmed',
        address: '456 Zamalek St',
        latitude: 30.0626,
        longitude: 31.2497,
        status: 'picked_up',
        estimatedTime: '20 mins'
    },
    {
        id: 'del-103',
        driverId: 'driver-4',
        customerName: 'Hassan Youssef',
        address: '789 Heliopolis Ave',
        latitude: 30.0500,
        longitude: 31.2400,
        status: 'assigned',
        estimatedTime: '30 mins'
    }
];

// Convert drivers to LocationData format for map display
export const driversToLocations = (drivers: Driver[]): LocationData[] => {
    return drivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        latitude: driver.latitude,
        longitude: driver.longitude,
        type: driver.status,
        load: `${driver.completedToday} deliveries`,
        color: driver.status === 'active' ? '#10b981' : driver.status === 'idle' ? '#f59e0b' : '#6b7280'
    }));
};

// Convert deliveries to LocationData format
export const deliveriesToLocations = (deliveries: Delivery[]): LocationData[] => {
    return deliveries.map(delivery => ({
        id: delivery.id,
        name: delivery.customerName,
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        type: delivery.status,
        load: delivery.estimatedTime,
        color: delivery.status === 'delivered' ? '#10b981' :
            delivery.status === 'in_transit' ? '#3b82f6' :
                delivery.status === 'picked_up' ? '#8b5cf6' : '#f59e0b'
    }));
};
