/**
 * Notification Mesh Service
 * 
 * Unified notification system using WebSocket + Push Notifications
 * Ensures instant state updates across all nodes (POS, Customer, Driver)
 */

import { io, Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationChannel =
    | 'order_updates'
    | 'delivery_updates'
    | 'payment_updates'
    | 'system_alerts'
    | 'driver_assignments'
    | 'kitchen_updates';

export interface NotificationPayload {
    id: string;
    channel: NotificationChannel;
    title: string;
    body: string;
    data?: Record<string, any>;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    timestamp: number;
    userId?: string;
    orderId?: string;
}

export interface MeshNode {
    nodeId: string;
    nodeType: 'pos' | 'customer' | 'driver' | 'kitchen';
    userId: string;
    deviceId: string;
    isOnline: boolean;
    lastSeen: number;
}

export class NotificationMeshService {
    private static instance: NotificationMeshService;
    private socket: Socket | null = null;
    private node: MeshNode | null = null;
    private listeners: Map<NotificationChannel, ((payload: NotificationPayload) => void)[]> = new Map();
    private pushToken: string | null = null;

    private constructor() {
        this.initializePushNotifications();
    }

    static getInstance(): NotificationMeshService {
        if (!NotificationMeshService.instance) {
            NotificationMeshService.instance = new NotificationMeshService();
        }
        return NotificationMeshService.instance;
    }

    /**
     * Initialize push notifications
     */
    private async initializePushNotifications() {
        try {
            // Configure notification handler
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });

            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Push notification permission not granted');
                return;
            }

            // Get push token
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const token = await Notifications.getExpoPushTokenAsync();
            this.pushToken = token.data;
            console.log('📱 Push token:', this.pushToken);

        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
        }
    }

    /**
     * Connect to notification mesh
     */
    async connect(
        apiUrl: string,
        nodeType: 'pos' | 'customer' | 'driver' | 'kitchen',
        userId: string,
        deviceId: string
    ): Promise<boolean> {
        try {
            // Create mesh node identity
            this.node = {
                nodeId: `${nodeType}_${deviceId}`,
                nodeType,
                userId,
                deviceId,
                isOnline: true,
                lastSeen: Date.now()
            };

            // Connect to WebSocket
            this.socket = io(apiUrl, {
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 10,
                auth: {
                    nodeId: this.node.nodeId,
                    nodeType: this.node.nodeType,
                    userId: this.node.userId,
                    deviceId: this.node.deviceId,
                    pushToken: this.pushToken
                }
            });

            // Setup event listeners
            this.socket.on('connect', () => {
                console.log('🌐 Connected to notification mesh');
                this.node!.isOnline = true;

                // Join relevant rooms
                this.socket!.emit('mesh:join', {
                    nodeId: this.node!.nodeId,
                    userId: this.node!.userId,
                    nodeType: this.node!.nodeType
                });
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Disconnected from notification mesh');
                this.node!.isOnline = false;
            });

            this.socket.on('reconnect', (attemptNumber) => {
                console.log(`🔄 Reconnected to mesh (attempt ${attemptNumber})`);
                this.node!.isOnline = true;
            });

            // Listen for notifications
            this.socket.on('notification', (payload: NotificationPayload) => {
                this.handleIncomingNotification(payload);
            });

            // Listen for mesh events
            this.socket.on('mesh:node_joined', (node: MeshNode) => {
                console.log(`➕ Node joined mesh: ${node.nodeId}`);
            });

            this.socket.on('mesh:node_left', (nodeId: string) => {
                console.log(`➖ Node left mesh: ${nodeId}`);
            });

            return true;

        } catch (error) {
            console.error('Failed to connect to notification mesh:', error);
            return false;
        }
    }

    /**
     * Disconnect from mesh
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.node) {
            this.node.isOnline = false;
        }
    }

    /**
     * Subscribe to notification channel
     */
    subscribe(channel: NotificationChannel, callback: (payload: NotificationPayload) => void): void {
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, []);
        }
        this.listeners.get(channel)!.push(callback);

        // Subscribe on server
        if (this.socket && this.socket.connected) {
            this.socket.emit('mesh:subscribe', { channel });
        }
    }

    /**
     * Unsubscribe from notification channel
     */
    unsubscribe(channel: NotificationChannel, callback?: (payload: NotificationPayload) => void): void {
        if (callback) {
            const callbacks = this.listeners.get(channel) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        } else {
            this.listeners.delete(channel);
        }

        // Unsubscribe on server
        if (this.socket && this.socket.connected) {
            this.socket.emit('mesh:unsubscribe', { channel });
        }
    }

    /**
     * Broadcast notification to mesh
     */
    async broadcast(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): Promise<boolean> {
        try {
            const fullPayload: NotificationPayload = {
                ...payload,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now()
            };

            // Send via WebSocket
            if (this.socket && this.socket.connected) {
                this.socket.emit('notification:broadcast', fullPayload);
            }

            // Send local push notification if app is in background
            await this.sendLocalNotification(fullPayload);

            return true;
        } catch (error) {
            console.error('Failed to broadcast notification:', error);
            return false;
        }
    }

    /**
     * Send targeted notification to specific user/node
     */
    async sendToNode(
        targetNodeId: string,
        payload: Omit<NotificationPayload, 'id' | 'timestamp'>
    ): Promise<boolean> {
        try {
            const fullPayload: NotificationPayload = {
                ...payload,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now()
            };

            if (this.socket && this.socket.connected) {
                this.socket.emit('notification:send', {
                    targetNodeId,
                    payload: fullPayload
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to send targeted notification:', error);
            return false;
        }
    }

    /**
     * Handle incoming notification
     */
    private async handleIncomingNotification(payload: NotificationPayload): void {
        console.log('📬 Received notification:', payload.title);

        // Trigger channel listeners
        const callbacks = this.listeners.get(payload.channel) || [];
        callbacks.forEach(callback => callback(payload));

        // Show push notification
        await this.sendLocalNotification(payload);
    }

    /**
     * Send local push notification
     */
    private async sendLocalNotification(payload: NotificationPayload): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    sound: payload.priority === 'urgent' ? 'default' : undefined,
                    priority: this.mapPriority(payload.priority),
                },
                trigger: null, // Show immediately
            });
        } catch (error) {
            console.error('Failed to send local notification:', error);
        }
    }

    private mapPriority(priority: NotificationPayload['priority']): Notifications.AndroidNotificationPriority {
        switch (priority) {
            case 'urgent': return Notifications.AndroidNotificationPriority.MAX;
            case 'high': return Notifications.AndroidNotificationPriority.HIGH;
            case 'normal': return Notifications.AndroidNotificationPriority.DEFAULT;
            case 'low': return Notifications.AndroidNotificationPriority.LOW;
        }
    }

    /**
     * Get current node status
     */
    getNodeStatus(): MeshNode | null {
        return this.node;
    }

    /**
     * Check if connected to mesh
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const notificationMesh = NotificationMeshService.getInstance();
