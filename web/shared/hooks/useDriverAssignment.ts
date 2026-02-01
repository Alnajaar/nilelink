/**
 * useDriverAssignment Hook
 * Smart contract integration for driver assignment
 * 
 * Provides methods to:
 * - Get available drivers
 * - Assign driver to order
 * - Get driver info
 * - Track driver location
 * - Get driver earnings
 */

import { useState, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import DeliveryCoordinatorABI from '../abis/DeliveryCoordinator.json';

export interface Driver {
  id: string;
  address: string;
  name: string;
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  earnings: number;
  phoneNumber?: string;
}

export interface DriverAssignment {
  orderId: string;
  driverId: string;
  assignedAt: number;
  pickupTime?: number;
  deliveredTime?: number;
  estimatedArrival?: number;
  distance?: number;
  eta?: number;
}

const DELIVERY_COORDINATOR_ADDRESS = process.env.NEXT_PUBLIC_DELIVERY_COORDINATOR_ADDRESS || '';

export function useDriverAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignment, setAssignment] = useState<DriverAssignment | null>(null);

  // Initialize contract instance
  const getDriverContract = useCallback(async (): Promise<Contract | null> => {
    try {
      if (!window.ethereum || !DELIVERY_COORDINATOR_ADDRESS) {
        console.warn('Ethereum provider or contract address not available');
        return null;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        DELIVERY_COORDINATOR_ADDRESS,
        DeliveryCoordinatorABI,
        signer
      );
      return contract;
    } catch (err) {
      console.error('Error initializing driver contract:', err);
      return null;
    }
  }, []);

  /**
   * Get available drivers for assignment
   */
  const getAvailableDrivers = useCallback(async (): Promise<Driver[]> => {
    setLoading(true);
    setError(null);

    try {
      // Mock implementation - will fetch from smart contract
      const mockDrivers: Driver[] = [
        {
          id: 'driver1',
          address: '0x1234567890123456789012345678901234567890',
          name: 'Ahmed Al-Mansouri',
          rating: 4.8,
          totalDeliveries: 542,
          isActive: true,
          currentLocation: {
            latitude: 25.2048,
            longitude: 55.2708,
            timestamp: Date.now(),
          },
          earnings: 8420,
          phoneNumber: '+971 50 123 4567',
        },
        {
          id: 'driver2',
          address: '0x0987654321098765432109876543210987654321',
          name: 'Fatima Al-Mazrouei',
          rating: 4.9,
          totalDeliveries: 728,
          isActive: true,
          currentLocation: {
            latitude: 25.1856,
            longitude: 55.2757,
            timestamp: Date.now(),
          },
          earnings: 12840,
          phoneNumber: '+971 50 234 5678',
        },
        {
          id: 'driver3',
          address: '0x1111111111111111111111111111111111111111',
          name: 'Mohammed Al-Shehhi',
          rating: 4.6,
          totalDeliveries: 365,
          isActive: true,
          currentLocation: {
            latitude: 25.1772,
            longitude: 55.272,
            timestamp: Date.now(),
          },
          earnings: 5420,
          phoneNumber: '+971 50 345 6789',
        },
      ];

      setDrivers(mockDrivers);
      return mockDrivers;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch available drivers');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get specific driver info
   */
  const getDriver = useCallback(
    async (driverId: string): Promise<Driver | null> => {
      try {
        const allDrivers = await getAvailableDrivers();
        return allDrivers.find((driver) => driver.id === driverId) || null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch driver info');
        setError(error);
        return null;
      }
    },
    [getAvailableDrivers]
  );

  /**
   * Assign driver to order
   */
  const assignDriver = useCallback(
    async (orderId: string, driverId: string): Promise<DriverAssignment> => {
      setLoading(true);
      setError(null);

      try {
        const contract = await getDriverContract();
        if (!contract) {
          throw new Error('Driver contract not available');
        }

        // Call smart contract to assign driver
        const tx = await contract.assignDriver(orderId, driverId);
        await tx.wait();

        const newAssignment: DriverAssignment = {
          orderId,
          driverId,
          assignedAt: Date.now(),
          estimatedArrival: Date.now() + 15 * 60 * 1000, // 15 min ETA
        };

        setAssignment(newAssignment);
        return newAssignment;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to assign driver');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getDriverContract]
  );

  /**
   * Update driver location
   */
  const updateDriverLocation = useCallback(
    async (driverId: string, latitude: number, longitude: number): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const contract = await getDriverContract();
        if (!contract) {
          throw new Error('Driver contract not available');
        }

        // Call smart contract to update location
        const tx = await contract.updateDriverLocation(
          driverId,
          Math.round(latitude * 1e6),
          Math.round(longitude * 1e6)
        );
        await tx.wait();

        // Update local driver list
        setDrivers((prev) =>
          prev.map((driver) =>
            driver.id === driverId
              ? {
                  ...driver,
                  currentLocation: {
                    latitude,
                    longitude,
                    timestamp: Date.now(),
                  },
                }
              : driver
          )
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update driver location');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getDriverContract]
  );

  /**
   * Get driver earnings
   */
  const getDriverEarnings = useCallback(async (driverId: string): Promise<number> => {
    try {
      const driver = await getDriver(driverId);
      return driver?.earnings || 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch driver earnings');
      setError(error);
      return 0;
    }
  }, [getDriver]);

  /**
   * Complete delivery
   */
  const completeDelivery = useCallback(
    async (orderId: string, driverId: string, proofHash?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const contract = await getDriverContract();
        if (!contract) {
          throw new Error('Driver contract not available');
        }

        // Call smart contract to complete delivery
        const tx = await contract.completeDelivery(orderId, driverId, proofHash || '');
        await tx.wait();

        if (assignment) {
          setAssignment({
            ...assignment,
            deliveredTime: Date.now(),
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to complete delivery');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [assignment, getDriverContract]
  );

  return {
    loading,
    error,
    drivers,
    assignment,
    getAvailableDrivers,
    getDriver,
    assignDriver,
    updateDriverLocation,
    getDriverEarnings,
    completeDelivery,
  };
}
