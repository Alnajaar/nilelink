import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

let socket: Socket | null = null;

// Standardized event names
export const SocketEvents = {
  // Order events
  ORDER_CREATED: 'order:new',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:statusChanged',

  // Delivery events
  DRIVER_ASSIGNED: 'driver:assigned',
  DRIVER_LOCATION: 'driver:location',
  DELIVERY_STARTED: 'delivery:started',
  DELIVERY_COMPLETED: 'delivery:completed',

  // Financial events
  PAYMENT_RECEIVED: 'payment:received',
  LEDGER_UPDATE: 'ledger:update',

  // System events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
} as const;

export type SocketEventName = typeof SocketEvents[keyof typeof SocketEvents];

// Initialize socket connection
export function initializeSocket(userId?: string, token?: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const options: any = {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  };

  if (token) {
    options.auth = { token };
  }

  socket = io(SOCKET_URL, options);

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);

    // Join user-specific room if userId provided
    if (userId) {
      socket?.emit('join', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
}

// Get existing socket or create new one
export function getSocket(userId?: string, token?: string): Socket {
  if (!socket) {
    return initializeSocket(userId, token);
  }
  return socket;
}

// Join a specific room (restaurant, order, etc.)
export function joinRoom(roomName: string): void {
  const s = getSocket();

  if (roomName.startsWith('restaurant_')) {
    s.emit('joinRestaurant', roomName.replace('restaurant_', ''));
  } else if (roomName.startsWith('order_')) {
    s.emit('joinOrder', roomName.replace('order_', ''));
  }
}

// Leave a room
export function leaveRoom(roomName: string): void {
  const s = getSocket();
  s.emit('leaveRoom', roomName);
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Subscribe to an event
export function subscribeToEvent(
  eventName: SocketEventName,
  callback: (data: any) => void
): () => void {
  const s = getSocket();
  s.on(eventName, callback);

  // Return unsubscribe function
  return () => {
    s.off(eventName, callback);
  };
}

// Emit an event
export function emitEvent(eventName: string, data: any): void {
  const s = getSocket();
  s.emit(eventName, data);
}
