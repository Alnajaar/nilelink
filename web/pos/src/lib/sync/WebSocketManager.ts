import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  deviceId: string;
  messageId: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'pos' | 'kitchen' | 'admin' | 'mobile';
  lastSeen: number;
  isOnline: boolean;
  version: string;
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private deviceId: string;
  private deviceInfo: DeviceInfo;
  private messageQueue: WebSocketMessage[] = [];
  private pendingMessages = new Map<string, { message: WebSocketMessage; resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();

  constructor(deviceId: string, deviceInfo: DeviceInfo) {
    super();
    this.deviceId = deviceId;
    this.deviceInfo = deviceInfo;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on('connected', this.onConnected.bind(this));
    this.on('disconnected', this.onDisconnected.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('error', this.onError.bind(this));
  }

  async connect(url: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('disconnected', event);
          this.handleReconnection();
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private onConnected() {
    // Send device registration
    this.send({
      type: 'device:register',
      payload: this.deviceInfo,
      timestamp: Date.now(),
      deviceId: this.deviceId,
      messageId: this.generateMessageId()
    });

    // Start heartbeat
    this.startHeartbeat();

    // Send queued messages
    this.flushMessageQueue();
  }

  private onDisconnected(event: CloseEvent) {
    this.stopHeartbeat();

    // Reject pending messages
    for (const [messageId, { reject }] of this.pendingMessages) {
      reject(new Error('WebSocket disconnected'));
    }
    this.pendingMessages.clear();
  }

  private onMessage(message: WebSocketMessage) {
    // Handle message
  }

  private onError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private handleMessage(message: WebSocketMessage) {
    // Resolve pending message if this is a response
    if (message.messageId && this.pendingMessages.has(message.messageId)) {
      const { resolve, reject, timeout } = this.pendingMessages.get(message.messageId)!;
      clearTimeout(timeout);
      this.pendingMessages.delete(message.messageId);

      if (message.type.includes('error')) {
        reject(new Error(message.payload?.error || 'Request failed'));
      } else {
        resolve(message);
      }
    }

    // Emit message event
    this.emit('message', message);

    // Handle specific message types
    switch (message.type) {
      case 'device:registered':
        console.log('✅ Device registered successfully');
        break;
      case 'inventory:updated':
        this.emit('inventory:updated', message.payload);
        break;
      case 'order:updated':
        this.emit('order:updated', message.payload);
        break;
      case 'staff:updated':
        this.emit('staff:updated', message.payload);
        break;
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      // Reconnection logic would go here
      this.emit('reconnecting', this.reconnectAttempts);
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          payload: { timestamp: Date.now() },
          timestamp: Date.now(),
          deviceId: this.deviceId,
          messageId: this.generateMessageId()
        });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  async send(message: Omit<WebSocketMessage, 'messageId'>): Promise<WebSocketMessage> {
    const fullMessage: WebSocketMessage = {
      ...message,
      messageId: message.messageId || this.generateMessageId()
    };

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for later
      this.messageQueue.push(fullMessage);
      return new Promise((resolve, reject) => {
        // This promise will be resolved when connection is restored
        setTimeout(() => reject(new Error('Message queued but connection not available')), 5000);
      });
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(fullMessage.messageId);
        reject(new Error('Message timeout'));
      }, 10000);

      this.pendingMessages.set(fullMessage.messageId, { message: fullMessage, resolve, reject, timeout });

      try {
        this.ws!.send(JSON.stringify(fullMessage));
      } catch (error) {
        clearTimeout(timeout);
        this.pendingMessages.delete(fullMessage.messageId);
        reject(error);
      }
    });
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message).catch(error => {
          console.error('Failed to send queued message:', error);
        });
      }
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  private generateMessageId(): string {
    return `msg_${this.deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for sending specific message types
  async updateInventory(inventoryId: string, changes: any): Promise<WebSocketMessage> {
    return this.send({
      type: 'inventory:update',
      payload: { inventoryId, changes, timestamp: Date.now() },
      timestamp: Date.now(),
      deviceId: this.deviceId
    });
  }

  async createOrder(orderData: any): Promise<WebSocketMessage> {
    return this.send({
      type: 'order:create',
      payload: orderData,
      timestamp: Date.now(),
      deviceId: this.deviceId
    });
  }

  async updateOrder(orderId: string, changes: any): Promise<WebSocketMessage> {
    return this.send({
      type: 'order:update',
      payload: { orderId, changes },
      timestamp: Date.now(),
      deviceId: this.deviceId
    });
  }

  async syncStaff(staffData: any): Promise<WebSocketMessage> {
    return this.send({
      type: 'staff:sync',
      payload: staffData,
      timestamp: Date.now(),
      deviceId: this.deviceId
    });
  }
}
