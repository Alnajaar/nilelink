import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@nilelink/mobile-shared';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

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

export function useRealTimeJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    const { token } = useAuth(); // Get token from auth hook

    useEffect(() => {
        if (!token) return;

        // Connect to Socket.IO with Auth Token
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: token
            }
        });

        newSocket.on('connect', () => {
            console.log('[Driver] Connected to Real-time Hub');
            newSocket.emit('join', 'driver_pool');
        });

        // Listen for new ready orders
        newSocket.on('order:ready', (data: any) => {
            console.log('[Driver] New Job Available:', data.id);
            const newJob: Job = {
                id: data.id,
                restaurant: data.restaurantName || 'Partner Restaurant',
                branch: 'Main Branch',
                address: data.deliveryAddress || '123 Nile St, Cairo',
                total: Number(data.totalAmount) || 0,
                distance: '2.5 km',
                status: 'READY'
            };

            setJobs(prev => [newJob, ...prev]);
        });

        // Listen for updates (taken by other drivers)
        newSocket.on('order:taken', (data: { orderId: string }) => {
            setJobs(prev => prev.filter(j => j.id !== data.orderId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const fetchInitialJobs = async () => {
        try {
            const response = await api.get('/orders?status=READY');
            const orders = response.data.orders || response.data; // Handle different API shapes

            if (Array.isArray(orders)) {
                const formatted = orders.map((o: any) => ({
                    id: o.id,
                    restaurant: o.restaurant?.name || 'Partner Restaurant',
                    branch: 'Main',
                    address: o.deliveryAddress || 'Tahrir Square',
                    total: Number(o.totalAmount) || 0,
                    distance: '1.2 km',
                    status: 'READY'
                }));
                setJobs(formatted);
            }
        } catch (e) {
            console.warn('Failed to fetch initial jobs');
        }
    };

    useEffect(() => {
        fetchInitialJobs();
    }, []);

    return { jobs, socket };
}
