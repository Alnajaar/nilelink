import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@nilelink/mobile-shared';
import { Platform } from 'react-native';

const SOCKET_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3010'
    : 'http://localhost:3010';

export interface Job {
    id: string;
    restaurant: string;
    branch: string;
    address: string;
    total: number;
    distance: string;
    status: 'READY' | 'PICKED_UP' | 'DELIVERED';
}

import { graphService } from '@nilelink/mobile-blockchain';

export function useRealTimeJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchJobs = async () => {
        setIsRefreshing(true);
        try {
            const data = await graphService.getAvailableDeliveries();
            if (data && data.deliveries) {
                const formatted: Job[] = data.deliveries.map((d: any) => ({
                    id: d.id,
                    restaurant: 'Partner Restaurant', // Fetch name from IPFS in full impl
                    branch: 'Main Node',
                    address: d.order.deliveryAddress || 'Network Address',
                    total: Number(d.order.totalAmountUsd6) / 1000000 || 0,
                    distance: '1.5 km',
                    status: 'READY'
                }));
                setJobs(formatted);
            } else {
                // Provide mock data if GraphQL fails
                setJobs([
                    {
                        id: 'mock-job-1',
                        restaurant: 'Starbucks Downtown',
                        branch: 'Main Branch',
                        address: '123 Main St, Downtown',
                        total: 25.50,
                        distance: '1.2 km',
                        status: 'READY'
                    },
                    {
                        id: 'mock-job-2',
                        restaurant: 'Pizza Palace',
                        branch: 'North Branch',
                        address: '456 Oak Ave, North District',
                        total: 42.75,
                        distance: '2.1 km',
                        status: 'READY'
                    }
                ]);
            }
        } catch (error) {
            console.error('[Driver] Decentralized Fetch Failed:', error);
            // Provide mock data on error
            setJobs([
                {
                    id: 'mock-job-1',
                    restaurant: 'Starbucks Downtown',
                    branch: 'Main Branch',
                    address: '123 Main St, Downtown',
                    total: 25.50,
                    distance: '1.2 km',
                    status: 'READY'
                },
                {
                    id: 'mock-job-2',
                    restaurant: 'Pizza Palace',
                    branch: 'North Branch',
                    address: '456 Oak Ave, North District',
                    total: 42.75,
                    distance: '2.1 km',
                    status: 'READY'
                }
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 30000); // Polling as a fallback for real-time
        return () => clearInterval(interval);
    }, []);

    return { jobs, socket: null, isRefreshing, refresh: fetchJobs };
}
