import web3Service from '../services/Web3Service';

// Standardized event names
export const SocketEvents = {
  // Order events
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',

  // Delivery events
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_LOCATION: 'DRIVER_LOCATION',
  DELIVERY_STARTED: 'DELIVERY_STARTED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED',

  // Financial events
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  LEDGER_UPDATE: 'LEDGER_UPDATE',
} as const;

export type SocketEventName = keyof typeof SocketEvents;

/**
 * Decentralized Event Bus replacing centralized Socket.IO
 * Integrates directly with Web3Service listeners
 */
export function initializeSocket(userId?: string, token?: string) {
  console.log('✅ Global Decentralized Event Bus Initialized');
  return null;
}

export function subscribeToEvent(
  eventName: SocketEventName,
  callback: (data: any) => void
): () => void {
  // Map internal event names to Web3 listener triggers
  if (eventName === 'ORDER_CREATED') {
    return web3Service.onOrderCreated((orderId, restaurantId, customer) => {
      callback({ id: orderId, restaurantId, customer });
    });
  } else if (eventName === 'PAYMENT_RECEIVED') {
    return web3Service.onPaymentReceived((orderId, amount, customer) => {
      callback({ orderId, amount, customer });
    });
  }

  return () => {
    console.log(`Unsubscribed from ${eventName} (Decentralized Global)`);
  };
}

export function emitEvent(eventName: string, data: any): void {
  console.warn(`Direct emission of ${eventName} is deprecated in decentralized mode.`);
}

export function disconnectSocket(): void { }
export function getSocket(): null { return null; }
export function joinRoom(roomName: string): void { }
export function leaveRoom(roomName: string): void { }
