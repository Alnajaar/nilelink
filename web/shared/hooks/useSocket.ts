'use client';

import { useEffect, useState } from 'react';
import { getSocket, subscribeToEvent, SocketEventName } from '../utils/socket';

/**
 * Hook to subscribe to real-time socket events
 */
export function useSocketEvent<T = any>(
  eventName: SocketEventName,
  callback: (data: T) => void,
  deps: any[] = []
) {
  useEffect(() => {
    const unsubscribe = subscribeToEvent(eventName, callback);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...deps]);
}

/**
 * Hook to manage socket connection state
 */
export function useSocket(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      // In decentralized mode, we're "always connected" to the network
      setIsConnected(true);
      return;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set initial state
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [userId]);

  return { isConnected };
}
