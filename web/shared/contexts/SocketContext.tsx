'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    isConnected: boolean;
    // Removed socket from context to avoid serialization issues
    // Socket instance is now managed internally
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children, user }: { children: ReactNode; user?: any }) {
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        // Determine backend URL
        // In a fully decentralized system, we'd use blockchain events instead of centralized sockets
        // For backward compatibility, we'll still check for centralized API
        // But in true decentralized mode, this would connect to blockchain event listeners
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

        // If no API URL is set, we're in fully decentralized mode
        if (!apiUrl) {
            // In a real implementation, connect to blockchain event listeners instead
            console.log('Running in fully decentralized mode - no socket connection needed');
            return; // Early return to avoid connecting to centralized socket
        }

        const socketUrl = apiUrl.replace('/api', '');

        console.log('Connecting to socket at:', socketUrl);

        const socket = io(socketUrl, {
            auth: {
                token: typeof window !== 'undefined' ? localStorage.getItem('nilelink_auth_token') : null
            },
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 5000, // Longer delay between retries
            autoConnect: false,
            transports: ['websocket'] // Skip polling to avoid XHR errors
        });

        setSocketInstance(socket);

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            // Silencing noise for developer experience - only log if explicitly requested or critical
            if (process.env.NODE_ENV === 'development') {
                // Just a subtle log instead of a full error object
                console.log('Socket connection pending (server may be offline)');
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socketInstance && user) {
            // Update auth token if user changes (e.g. login)
            socketInstance.auth = { token: localStorage.getItem('nilelink_auth_token') };
            if (!socketInstance.connected) {
                socketInstance.connect();
            }

            // Join user specific room
            socketInstance.emit('join', user.id);

            // If restaurant staff, join restaurant room
            if (user.role === 'STAFF' || user.role === 'OWNER') {
                // In a real app we'd get businessId from user or context
                const businessId = (user as any).businessId; // Verify this field exists in your User type
                if (businessId) {
                    console.log('Joining restaurant room:', businessId);
                    socketInstance.emit('joinRestaurant', businessId);
                }
            }
        } else if (socketInstance && !user) {
            socketInstance.disconnect();
        }
    }, [socketInstance, user]);

    return (
        <SocketContext.Provider value={{ isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}