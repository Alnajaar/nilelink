/**
 * Notification Mesh Server - Backend WebSocket Handler
 * 
 * Manages real-time notification routing between all nodes
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface MeshNode {
    nodeId: string;
    nodeType: 'pos' | 'customer' | 'driver' | 'kitchen';
    userId: string;
    deviceId: string;
    pushToken?: string;
    socketId: string;
    connectedAt: number;
}

interface NotificationPayload {
    id: string;
    channel: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    timestamp: number;
    userId?: string;
    orderId?: string;
}

export class NotificationMeshServer {
    private io: SocketIOServer;
    private nodes: Map<string, MeshNode> = new Map();
    private channelSubscriptions: Map<string, Set<string>> = new Map(); // channel -> Set<socketId>

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: '*', // Configure properly in production
                methods: ['GET', 'POST']
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventHandlers();
        console.log('🌐 Notification Mesh Server initialized');
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`🔌 Node connected: ${socket.id}`);

            // Handle mesh join
            socket.on('mesh:join', (data: {
                nodeId: string;
                userId: string;
                nodeType: 'pos' | 'customer' | 'driver' | 'kitchen';
            }) => {
                const node: MeshNode = {
                    nodeId: data.nodeId,
                    nodeType: data.nodeType,
                    userId: data.userId,
                    deviceId: socket.handshake.auth.deviceId || socket.id,
                    pushToken: socket.handshake.auth.pushToken,
                    socketId: socket.id,
                    connectedAt: Date.now()
                };

                this.nodes.set(socket.id, node);

                // Join user-specific room
                socket.join(`user_${data.userId}`);

                // Join node-type room
                socket.join(`${data.nodeType}_nodes`);

                // Broadcast node joined
                this.io.emit('mesh:node_joined', node);

                console.log(`➕ Node joined mesh: ${data.nodeId} (${data.nodeType})`);
            });

            // Handle channel subscription
            socket.on('mesh:subscribe', (data: { channel: string }) => {
                if (!this.channelSubscriptions.has(data.channel)) {
                    this.channelSubscriptions.set(data.channel, new Set());
                }
                this.channelSubscriptions.get(data.channel)!.add(socket.id);
                socket.join(`channel_${data.channel}`);

                console.log(`📡 Node ${socket.id} subscribed to ${data.channel}`);
            });

            // Handle channel unsubscription
            socket.on('mesh:unsubscribe', (data: { channel: string }) => {
                const subscribers = this.channelSubscriptions.get(data.channel);
                if (subscribers) {
                    subscribers.delete(socket.id);
                }
                socket.leave(`channel_${data.channel}`);
            });

            // Handle notification broadcast
            socket.on('notification:broadcast', (payload: NotificationPayload) => {
                console.log(`📢 Broadcasting notification: ${payload.title}`);

                // Broadcast to channel subscribers
                this.io.to(`channel_${payload.channel}`).emit('notification', payload);

                // If orderId specified, also send to order room
                if (payload.orderId) {
                    this.io.to(`order_${payload.orderId}`).emit('notification', payload);
                }

                // If userId specified, send to user room
                if (payload.userId) {
                    this.io.to(`user_${payload.userId}`).emit('notification', payload);
                }
            });

            // Handle targeted notification
            socket.on('notification:send', (data: {
                targetNodeId: string;
                payload: NotificationPayload;
            }) => {
                const targetNode = Array.from(this.nodes.values()).find(
                    n => n.nodeId === data.targetNodeId
                );

                if (targetNode) {
                    this.io.to(targetNode.socketId).emit('notification', data.payload);
                    console.log(`📨 Sent notification to ${data.targetNodeId}`);
                } else {
                    console.warn(`⚠️ Target node not found: ${data.targetNodeId}`);
                }
            });

            // Handle order-specific events
            socket.on('order:join', (orderId: string) => {
                socket.join(`order_${orderId}`);
                console.log(`📦 Socket ${socket.id} joined order room: ${orderId}`);
            });

            socket.on('order:leave', (orderId: string) => {
                socket.leave(`order_${orderId}`);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                const node = this.nodes.get(socket.id);
                if (node) {
                    this.io.emit('mesh:node_left', node.nodeId);
                    this.nodes.delete(socket.id);
                    console.log(`➖ Node left mesh: ${node.nodeId}`);
                }

                // Clean up channel subscriptions
                this.channelSubscriptions.forEach((subscribers) => {
                    subscribers.delete(socket.id);
                });
            });
        });
    }

    /**
     * Broadcast system-wide notification
     */
    broadcastSystemNotification(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): void {
        const fullPayload: NotificationPayload = {
            ...payload,
            id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        this.io.emit('notification', fullPayload);
        console.log(`🔔 System notification sent: ${fullPayload.title}`);
    }

    /**
     * Send notification to specific user
     */
    notifyUser(userId: string, payload: Omit<NotificationPayload, 'id' | 'timestamp'>): void {
        const fullPayload: NotificationPayload = {
            ...payload,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            userId
        };

        this.io.to(`user_${userId}`).emit('notification', fullPayload);
    }

    /**
     * Send notification to all nodes of a specific type
     */
    notifyNodeType(
        nodeType: 'pos' | 'customer' | 'driver' | 'kitchen',
        payload: Omit<NotificationPayload, 'id' | 'timestamp'>
    ): void {
        const fullPayload: NotificationPayload = {
            ...payload,
            id: `type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        this.io.to(`${nodeType}_nodes`).emit('notification', fullPayload);
    }

    /**
     * Get mesh statistics
     */
    getMeshStats(): {
        totalNodes: number;
        nodesByType: Record<string, number>;
        activeChannels: number;
        uptime: number;
    } {
        const nodesByType: Record<string, number> = {};

        this.nodes.forEach(node => {
            nodesByType[node.nodeType] = (nodesByType[node.nodeType] || 0) + 1;
        });

        return {
            totalNodes: this.nodes.size,
            nodesByType,
            activeChannels: this.channelSubscriptions.size,
            uptime: process.uptime()
        };
    }

    /**
     * Get connected nodes
     */
    getConnectedNodes(): MeshNode[] {
        return Array.from(this.nodes.values());
    }
}

export default NotificationMeshServer;
