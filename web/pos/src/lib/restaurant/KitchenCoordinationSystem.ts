/**
 * Kitchen Coordination System
 * 
 * Manages order flow from POS to kitchen, handles preparation tracking,
 * and coordinates with front-of-house staff
 */

import { EventEmitter } from 'events';
import { eventBus, createEvent } from '../core/EventBus';

export interface KitchenOrder {
    id: string;
    tableNumber?: number;
    customerName?: string;
    items: KitchenOrderItem[];
    status: 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    priority: 'normal' | 'high' | 'rush';
    orderedAt: number;
    preparedAt?: number;
    readyAt?: number;
    deliveredAt?: number;
    specialInstructions?: string;
    serverId: string;
    branchId: string;
    metadata: {
        createdAt: number;
        lastUpdated: number;
    };
}

export interface KitchenOrderItem {
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    status: 'pending' | 'preparing' | 'ready' | 'cancelled';
    specialInstructions?: string;
    preparationTimeEstimate: number; // in minutes
    startedAt?: number;
    completedAt?: number;
    notes?: string;
}

export interface KitchenStation {
    id: string;
    name: string;
    type: 'grill' | 'fryer' | 'prep' | 'cold' | 'pizza' | 'dessert' | 'bar';
    capacity: number; // max orders at once
    activeOrders: number;
    staffAssigned: string[];
    status: 'active' | 'maintenance' | 'closed';
    queue: string[]; // order IDs in this station's queue
}

export interface KitchenStaff {
    id: string;
    name: string;
    role: 'chef' | 'cook' | 'prep' | 'expeditor' | 'runner';
    stations: string[]; // stations they can work on
    activeOrders: number;
    status: 'available' | 'busy' | 'break' | 'offline';
    assignedAt?: number;
}

export class KitchenCoordinationSystem extends EventEmitter {
    private orders: Map<string, KitchenOrder> = new Map();
    private stations: Map<string, KitchenStation> = new Map();
    private staff: Map<string, KitchenStaff> = new Map();
    private branchId: string;

    constructor(branchId: string) {
        super();
        this.branchId = branchId;
        this.initializeDefaultStations();
    }

    /**
     * Initialize default kitchen stations
     */
    private initializeDefaultStations(): void {
        const defaultStations: Omit<KitchenStation, 'queue' | 'activeOrders' | 'staffAssigned'>[] = [
            { id: 'station_grill', name: 'Grill Station', type: 'grill', capacity: 4, status: 'active' },
            { id: 'station_fryer', name: 'Fryer Station', type: 'fryer', capacity: 3, status: 'active' },
            { id: 'station_prep', name: 'Prep Station', type: 'prep', capacity: 2, status: 'active' },
            { id: 'station_cold', name: 'Cold Station', type: 'cold', capacity: 3, status: 'active' },
            { id: 'station_dessert', name: 'Dessert Station', type: 'dessert', capacity: 2, status: 'active' },
        ];

        defaultStations.forEach(stationConfig => {
            const station: KitchenStation = {
                ...stationConfig,
                queue: [],
                activeOrders: 0,
                staffAssigned: []
            };
            this.stations.set(station.id, station);
        });

        console.log(`👨‍🍳 Initialized ${defaultStations.length} kitchen stations for branch ${this.branchId}`);
    }

    /**
     * Create new kitchen order from POS
     */
    createOrder(orderData: Omit<KitchenOrder, 'id' | 'status' | 'orderedAt' | 'branchId' | 'metadata'>): string {
        const orderId = `kitchen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const kitchenOrder: KitchenOrder = {
            id: orderId,
            ...orderData,
            status: 'new',
            orderedAt: Date.now(),
            branchId: this.branchId,
            metadata: {
                createdAt: Date.now(),
                lastUpdated: Date.now()
            }
        };

        this.orders.set(orderId, kitchenOrder);

        // Automatically assign to appropriate stations based on items
        this.autoAssignToStations(orderId);

        this.emit('order.created', kitchenOrder);

        // Publish to global event bus
        eventBus.publish(createEvent('ORDER_SENT_TO_KITCHEN', {
            order: kitchenOrder
        }, {
            source: 'KitchenCoordinationSystem',
            branchId: this.branchId
        }));

        console.log(`🍽️ Kitchen order ${orderId} created with ${orderData.items.length} items`);
        return orderId;
    }

    /**
     * Auto-assign order items to appropriate stations
     */
    private autoAssignToStations(orderId: string): void {
        const order = this.orders.get(orderId);
        if (!order) return;

        // For simplicity, distribute items to stations based on item type
        // In reality, this would be more sophisticated
        for (const item of order.items) {
            // Determine station type based on item characteristics
            let stationType: KitchenStation['type'] = 'prep'; // default

            if (item.name.toLowerCase().includes('burger') ||
                item.name.toLowerCase().includes('steak') ||
                item.name.toLowerCase().includes('grill')) {
                stationType = 'grill';
            } else if (item.name.toLowerCase().includes('fries') ||
                item.name.toLowerCase().includes('onion rings') ||
                item.name.toLowerCase().includes('fried')) {
                stationType = 'fryer';
            } else if (item.name.toLowerCase().includes('salad') ||
                item.name.toLowerCase().includes('soup') ||
                item.name.toLowerCase().includes('cold')) {
                stationType = 'cold';
            } else if (item.name.toLowerCase().includes('dessert') ||
                item.name.toLowerCase().includes('cake') ||
                item.name.toLowerCase().includes('ice cream')) {
                stationType = 'dessert';
            }

            // Find available station of this type
            const availableStation = Array.from(this.stations.values())
                .find(s => s.type === stationType && s.status === 'active' && s.activeOrders < s.capacity);

            if (availableStation) {
                // Add to station queue
                availableStation.queue.push(orderId);
                availableStation.activeOrders++;
                this.stations.set(availableStation.id, availableStation);

                // Update item status
                const itemIndex = order.items.findIndex(i => i.id === item.id);
                if (itemIndex !== -1) {
                    order.items[itemIndex].status = 'pending';
                    order.items[itemIndex].startedAt = Date.now();
                }
            }
        }

        this.orders.set(orderId, order);
        this.emit('order.assigned', { orderId, stations: Array.from(this.stations.values()) });
    }

    /**
     * Start preparing an order
     */
    startOrder(orderId: string): boolean {
        const order = this.orders.get(orderId);
        if (!order || order.status !== 'new') {
            return false;
        }

        order.status = 'preparing';
        order.metadata.lastUpdated = Date.now();
        this.orders.set(orderId, order);

        // Update individual items
        for (const item of order.items) {
            if (item.status === 'pending') {
                item.status = 'preparing';
                item.startedAt = Date.now();
            }
        }

        this.emit('order.preparing', { orderId, tableNumber: order.tableNumber });
        console.log(`👨‍🍳 Started preparing order ${orderId} for table ${order.tableNumber}`);
        return true;
    }

    /**
     * Mark individual item as ready
     */
    markItemReady(orderId: string, itemId: string): boolean {
        const order = this.orders.get(orderId);
        if (!order) return false;

        const item = order.items.find(i => i.id === itemId);
        if (!item || item.status !== 'preparing') {
            return false;
        }

        item.status = 'ready';
        item.completedAt = Date.now();
        order.metadata.lastUpdated = Date.now();

        // Check if all items are ready
        const allReady = order.items.every(i => i.status === 'ready' || i.status === 'cancelled');
        if (allReady) {
            order.status = 'ready';
            order.readyAt = Date.now();
        }

        this.orders.set(orderId, order);

        this.emit('item.ready', { orderId, itemId, tableNumber: order.tableNumber });
        console.log(`✅ Item ${itemId} ready for order ${orderId}`);
        return true;
    }

    /**
     * Mark entire order as ready
     */
    markOrderReady(orderId: string): boolean {
        const order = this.orders.get(orderId);
        if (!order || order.status !== 'preparing') {
            return false;
        }

        order.status = 'ready';
        order.readyAt = Date.now();
        order.metadata.lastUpdated = Date.now();

        // Mark all non-cancelled items as ready
        for (const item of order.items) {
            if (item.status !== 'cancelled') {
                item.status = 'ready';
                if (!item.completedAt) {
                    item.completedAt = Date.now();
                }
            }
        }

        this.orders.set(orderId, order);

        this.emit('order.ready', { orderId, tableNumber: order.tableNumber });

        // Determine next step based on order type (in metadata or heuristic)
        // For now, assume if no table number, it might be pickup or delivery
        if (!order.tableNumber) {
            eventBus.publish(createEvent('ORDER_READY_FOR_DELIVERY', {
                order: order
            }, {
                source: 'KitchenCoordinationSystem',
                priority: 'high'
            }));
        } else {
            eventBus.publish(createEvent('ORDER_READY_FOR_PICKUP', {
                order: order
            }, {
                source: 'KitchenCoordinationSystem'
            }));
        }

        console.log(`✅ Order ${orderId} ready for table ${order.tableNumber}`);
        return true;
    }

    /**
     * Deliver order to table
     */
    deliverOrder(orderId: string): boolean {
        const order = this.orders.get(orderId);
        if (!order || order.status !== 'ready') {
            return false;
        }

        order.status = 'delivered';
        order.deliveredAt = Date.now();
        order.metadata.lastUpdated = Date.now();

        this.orders.set(orderId, order);

        // Remove from station queues
        for (const station of this.stations.values()) {
            const index = station.queue.indexOf(orderId);
            if (index !== -1) {
                station.queue.splice(index, 1);
                station.activeOrders = Math.max(0, station.activeOrders - 1);
                this.stations.set(station.id, station);
            }
        }

        this.emit('order.delivered', { orderId, tableNumber: order.tableNumber });
        console.log(`🚗 Order ${orderId} delivered to table ${order.tableNumber}`);
        return true;
    }

    /**
     * Cancel order
     */
    cancelOrder(orderId: string, reason?: string): boolean {
        const order = this.orders.get(orderId);
        if (!order) return false;

        order.status = 'cancelled';
        order.metadata.lastUpdated = Date.now();

        // Mark all items as cancelled
        for (const item of order.items) {
            item.status = 'cancelled';
        }

        this.orders.set(orderId, order);

        // Remove from station queues
        for (const station of this.stations.values()) {
            const index = station.queue.indexOf(orderId);
            if (index !== -1) {
                station.queue.splice(index, 1);
                station.activeOrders = Math.max(0, station.activeOrders - 1);
                this.stations.set(station.id, station);
            }
        }

        this.emit('order.cancelled', { orderId, reason, tableNumber: order.tableNumber });
        console.log(`❌ Order ${orderId} cancelled for table ${order.tableNumber}`);
        return true;
    }

    /**
     * Get order by ID
     */
    getOrder(orderId: string): KitchenOrder | null {
        return this.orders.get(orderId) || null;
    }

    /**
     * Get orders by status
     */
    getOrdersByStatus(status: KitchenOrder['status']): KitchenOrder[] {
        return Array.from(this.orders.values()).filter(order => order.status === status);
    }

    /**
     * Get orders by table number
     */
    getOrderByTable(tableNumber: number): KitchenOrder[] {
        return Array.from(this.orders.values()).filter(order => order.tableNumber === tableNumber);
    }

    /**
     * Get all active orders (not delivered or cancelled)
     */
    getActiveOrders(): KitchenOrder[] {
        return Array.from(this.orders.values()).filter(order =>
            order.status !== 'delivered' && order.status !== 'cancelled'
        );
    }

    /**
     * Get orders by priority
     */
    getOrdersByPriority(priority: KitchenOrder['priority']): KitchenOrder[] {
        return Array.from(this.orders.values()).filter(order => order.priority === priority);
    }

    /**
     * Get kitchen statistics
     */
    getKitchenStats(): {
        totalOrders: number;
        newOrders: number;
        preparingOrders: number;
        readyOrders: number;
        avgPrepTime: number;
        stations: {
            id: string;
            name: string;
            type: KitchenStation['type'];
            activeOrders: number;
            capacity: number;
            queueLength: number;
            utilization: number;
        }[];
    } {
        const orders = Array.from(this.orders.values());
        const totalOrders = orders.length;
        const newOrders = orders.filter(o => o.status === 'new').length;
        const preparingOrders = orders.filter(o => o.status === 'preparing').length;
        const readyOrders = orders.filter(o => o.status === 'ready').length;

        // Calculate average prep time (simplified)
        const avgPrepTime = 15; // Default 15 minutes

        const stationsStats = Array.from(this.stations.values()).map(station => ({
            id: station.id,
            name: station.name,
            type: station.type,
            activeOrders: station.activeOrders,
            capacity: station.capacity,
            queueLength: station.queue.length,
            utilization: station.capacity > 0 ? (station.activeOrders / station.capacity) * 100 : 0
        }));

        return {
            totalOrders,
            newOrders,
            preparingOrders,
            readyOrders,
            avgPrepTime,
            stations: stationsStats
        };
    }

    /**
     * Get kitchen queue for display
     */
    getKitchenQueue(): {
        station: string;
        stationType: KitchenStation['type'];
        orders: {
            orderId: string;
            tableNumber?: number;
            items: number;
            priority: KitchenOrder['priority'];
            timeInQueue: number;
        }[];
    }[] {
        return Array.from(this.stations.values()).map(station => {
            const orders = station.queue.map(orderId => {
                const order = this.orders.get(orderId);
                if (!order) return null;

                return {
                    orderId,
                    tableNumber: order.tableNumber,
                    items: order.items.length,
                    priority: order.priority,
                    timeInQueue: Date.now() - order.orderedAt
                };
            }).filter(Boolean) as any;

            return {
                station: station.name,
                stationType: station.type,
                orders
            };
        });
    }

    /**
     * Add kitchen staff
     */
    addStaff(staff: Omit<KitchenStaff, 'activeOrders' | 'status'>): string {
        const staffId = `staff_kitchen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const kitchenStaff: KitchenStaff = {
            ...staff,
            id: staffId,
            activeOrders: 0,
            status: 'available'
        };

        this.staff.set(staffId, kitchenStaff);

        this.emit('staff.added', kitchenStaff);
        console.log(`👨‍🍳 Added kitchen staff: ${staff.name}`);
        return staffId;
    }

    /**
     * Assign staff to station
     */
    assignStaffToStation(staffId: string, stationId: string): boolean {
        const staff = this.staff.get(staffId);
        const station = this.stations.get(stationId);

        if (!staff || !station) return false;

        // Check if staff can work at this station
        if (!staff.stations.includes(stationId) && staff.stations.length > 0) {
            return false;
        }

        if (!station.staffAssigned.includes(staffId)) {
            station.staffAssigned.push(staffId);
            this.stations.set(stationId, station);

            staff.status = 'busy';
            staff.assignedAt = Date.now();
            this.staff.set(staffId, staff);

            this.emit('staff.assigned', { staffId, stationId });
            console.log(`👤 Assigned ${staff.name} to ${station.name}`);
        }

        return true;
    }

    /**
     * Remove staff from station
     */
    removeStaffFromStation(staffId: string, stationId: string): boolean {
        const station = this.stations.get(stationId);
        if (!station) return false;

        const index = station.staffAssigned.indexOf(staffId);
        if (index !== -1) {
            station.staffAssigned.splice(index, 1);
            this.stations.set(stationId, station);

            // Update staff status if not assigned to other stations
            const staff = this.staff.get(staffId);
            if (staff) {
                const otherAssignments = station.staffAssigned.filter(id => id !== staffId).length > 0;
                if (!otherAssignments) {
                    staff.status = 'available';
                    staff.assignedAt = undefined;
                }
                this.staff.set(staffId, staff);
            }

            this.emit('staff.unassigned', { staffId, stationId });
            console.log(`👤 Removed ${staffId} from ${stationId}`);
        }

        return true;
    }

    /**
     * Update order priority
     */
    updateOrderPriority(orderId: string, priority: KitchenOrder['priority']): boolean {
        const order = this.orders.get(orderId);
        if (!order) return false;

        order.priority = priority;
        order.metadata.lastUpdated = Date.now();
        this.orders.set(orderId, order);

        this.emit('order.priority.updated', { orderId, priority });
        console.log(`⚡ Updated priority for order ${orderId} to ${priority}`);
        return true;
    }

    /**
     * Add special instruction to order
     */
    addSpecialInstruction(orderId: string, instruction: string): boolean {
        const order = this.orders.get(orderId);
        if (!order) return false;

        order.specialInstructions = instruction;
        order.metadata.lastUpdated = Date.now();
        this.orders.set(orderId, order);

        this.emit('order.instruction.added', { orderId, instruction });
        console.log(`📝 Added special instruction to order ${orderId}`);
        return true;
    }
}

// Singleton instances per branch
const kitchenSystems: Map<string, KitchenCoordinationSystem> = new Map();

export function getKitchenCoordinationSystem(branchId: string): KitchenCoordinationSystem {
    if (!kitchenSystems.has(branchId)) {
        kitchenSystems.set(branchId, new KitchenCoordinationSystem(branchId));
    }
    return kitchenSystems.get(branchId)!;
}