/**
 * Restaurant Table Management System
 * 
 * Handles table states, reservations, assignments, and coordination between front-of-house and kitchen
 */

import { EventEmitter } from 'events';

export interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'closed' | 'needs_cleaning';
    currentOrderId?: string;
    assignedServer?: string;
    seatedAt?: number;
    customerId?: string;
    zone: 'indoor' | 'outdoor' | 'patio' | 'bar' | 'vip';
    features: {
        wheelchairAccessible: boolean;
        nearWindow: boolean;
        quietArea: boolean;
        highChair: boolean;
    };
    metadata: {
        createdAt: number;
        lastUpdated: number;
        branchId: string;
    };
}

export interface TableAssignment {
    tableId: string;
    orderId: string;
    customerId?: string;
    serverId: string;
    assignedAt: number;
    expectedDuration?: number; // minutes
}

export interface Reservation {
    id: string;
    tableId: string;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    partySize: number;
    reservationTime: number;
    estimatedDuration: number; // minutes
    status: 'confirmed' | 'seated' | 'cancelled' | 'no_show' | 'completed';
    specialRequests?: string;
    createdAt: number;
    branchId: string;
}

export class TableManager extends EventEmitter {
    private tables: Map<string, Table> = new Map();
    private assignments: Map<string, TableAssignment> = new Map();
    private reservations: Map<string, Reservation> = new Map();
    private branchId: string;

    constructor(branchId: string) {
        super();
        this.branchId = branchId;
        this.initializeDefaultTables();
    }

    /**
     * Initialize default table configuration for a restaurant
     */
    private initializeDefaultTables(): void {
        // Indoor tables (2-6 people)
        const indoorTables = [
            { number: 1, capacity: 2, zone: 'indoor' as const, features: { wheelchairAccessible: true, nearWindow: false, quietArea: false, highChair: false } },
            { number: 2, capacity: 2, zone: 'indoor' as const, features: { wheelchairAccessible: true, nearWindow: false, quietArea: false, highChair: false } },
            { number: 3, capacity: 4, zone: 'indoor' as const, features: { wheelchairAccessible: true, nearWindow: true, quietArea: false, highChair: true } },
            { number: 4, capacity: 4, zone: 'indoor' as const, features: { wheelchairAccessible: false, nearWindow: false, quietArea: true, highChair: true } },
            { number: 5, capacity: 6, zone: 'indoor' as const, features: { wheelchairAccessible: true, nearWindow: false, quietArea: false, highChair: true } },
            { number: 6, capacity: 6, zone: 'indoor' as const, features: { wheelchairAccessible: true, nearWindow: true, quietArea: false, highChair: true } },
        ];

        // Outdoor/patio tables
        const outdoorTables = [
            { number: 101, capacity: 2, zone: 'outdoor' as const, features: { wheelchairAccessible: false, nearWindow: true, quietArea: true, highChair: false } },
            { number: 102, capacity: 4, zone: 'outdoor' as const, features: { wheelchairAccessible: false, nearWindow: true, quietArea: true, highChair: true } },
            { number: 103, capacity: 4, zone: 'patio' as const, features: { wheelchairAccessible: false, nearWindow: true, quietArea: false, highChair: true } },
        ];

        // Bar seating
        const barTables = [
            { number: 201, capacity: 1, zone: 'bar' as const, features: { wheelchairAccessible: false, nearWindow: false, quietArea: false, highChair: false } },
            { number: 202, capacity: 1, zone: 'bar' as const, features: { wheelchairAccessible: false, nearWindow: false, quietArea: false, highChair: false } },
            { number: 203, capacity: 2, zone: 'bar' as const, features: { wheelchairAccessible: false, nearWindow: false, quietArea: false, highChair: false } },
        ];

        const allTables = [...indoorTables, ...outdoorTables, ...barTables];
        
        allTables.forEach(tableConfig => {
            const tableId = `table_${this.branchId}_${tableConfig.number}`;
            const table: Table = {
                id: tableId,
                number: tableConfig.number,
                capacity: tableConfig.capacity,
                status: 'available',
                zone: tableConfig.zone,
                features: tableConfig.features,
                metadata: {
                    createdAt: Date.now(),
                    lastUpdated: Date.now(),
                    branchId: this.branchId
                }
            };
            this.tables.set(tableId, table);
        });

        console.log(`🏪 Initialized ${allTables.length} tables for branch ${this.branchId}`);
    }

    /**
     * Get all tables
     */
    getAllTables(): Table[] {
        return Array.from(this.tables.values());
    }

    /**
     * Get table by ID
     */
    getTable(tableId: string): Table | null {
        return this.tables.get(tableId) || null;
    }

    /**
     * Get tables by status
     */
    getTablesByStatus(status: Table['status']): Table[] {
        return Array.from(this.tables.values()).filter(table => table.status === status);
    }

    /**
     * Get tables by zone
     */
    getTablesByZone(zone: Table['zone']): Table[] {
        return Array.from(this.tables.values()).filter(table => table.zone === zone);
    }

    /**
     * Get available tables for a party size
     */
    getAvailableTables(partySize: number, zone?: Table['zone']): Table[] {
        let tables = Array.from(this.tables.values()).filter(table => 
            table.status === 'available' && table.capacity >= partySize
        );

        if (zone) {
            tables = tables.filter(table => table.zone === zone);
        }

        // Sort by capacity (closest fit first)
        return tables.sort((a, b) => a.capacity - b.capacity);
    }

    /**
     * Assign table to an order/customer
     */
    assignTable(tableId: string, orderId: string, serverId: string, customerId?: string): boolean {
        const table = this.tables.get(tableId);
        if (!table || table.status !== 'available') {
            return false;
        }

        // Update table status
        table.status = 'occupied';
        table.currentOrderId = orderId;
        table.assignedServer = serverId;
        table.seatedAt = Date.now();
        table.customerId = customerId;
        table.metadata.lastUpdated = Date.now();
        this.tables.set(tableId, table);

        // Create assignment record
        const assignment: TableAssignment = {
            tableId,
            orderId,
            customerId,
            serverId,
            assignedAt: Date.now()
        };
        this.assignments.set(orderId, assignment);

        this.emit('table.assigned', { tableId, orderId, serverId, customerId });
        console.log(`🍽️ Assigned table ${table.number} to order ${orderId}`);
        return true;
    }

    /**
     * Release table (customer leaves)
     */
    releaseTable(tableId: string): boolean {
        const table = this.tables.get(tableId);
        if (!table) return false;

        // Remove assignment if exists
        if (table.currentOrderId) {
            this.assignments.delete(table.currentOrderId);
        }

        // Update table status
        table.status = 'needs_cleaning';
        table.currentOrderId = undefined;
        table.assignedServer = undefined;
        table.seatedAt = undefined;
        table.customerId = undefined;
        table.metadata.lastUpdated = Date.now();
        this.tables.set(tableId, table);

        this.emit('table.released', { tableId, orderId: table.currentOrderId });
        console.log(`🧹 Table ${table.number} released, needs cleaning`);
        return true;
    }

    /**
     * Mark table as cleaned and available
     */
    markTableCleaned(tableId: string): boolean {
        const table = this.tables.get(tableId);
        if (!table || table.status !== 'needs_cleaning') {
            return false;
        }

        table.status = 'available';
        table.metadata.lastUpdated = Date.now();
        this.tables.set(tableId, table);

        this.emit('table.cleaned', { tableId });
        console.log(`✨ Table ${table.number} cleaned and available`);
        return true;
    }

    /**
     * Close table (maintenance/temporary closure)
     */
    closeTable(tableId: string, reason?: string): boolean {
        const table = this.tables.get(tableId);
        if (!table) return false;

        if (table.status === 'occupied') {
            // Cannot close occupied table
            return false;
        }

        table.status = 'closed';
        table.metadata.lastUpdated = Date.now();
        this.tables.set(tableId, table);

        this.emit('table.closed', { tableId, reason });
        console.log(`🔒 Table ${table.number} closed`);
        return true;
    }

    /**
     * Reopen closed table
     */
    reopenTable(tableId: string): boolean {
        const table = this.tables.get(tableId);
        if (!table || table.status !== 'closed') {
            return false;
        }

        table.status = 'available';
        table.metadata.lastUpdated = Date.now();
        this.tables.set(tableId, table);

        this.emit('table.reopened', { tableId });
        console.log(`🔓 Table ${table.number} reopened`);
        return true;
    }

    /**
     * Create reservation
     */
    createReservation(reservationData: Omit<Reservation, 'id' | 'createdAt' | 'branchId' | 'status'>): string {
        const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const reservation: Reservation = {
            id: reservationId,
            ...reservationData,
            status: 'confirmed',
            createdAt: Date.now(),
            branchId: this.branchId
        };

        this.reservations.set(reservationId, reservation);
        
        // Auto-assign table if available
        const availableTable = this.getAvailableTables(reservation.partySize)
            .find(table => table.zone === 'indoor'); // Prefer indoor tables for reservations
            
        if (availableTable) {
            // Note: Actual assignment happens when customer arrives
            console.log(`📅 Reservation ${reservationId} created for table ${availableTable.number}`);
        }

        this.emit('reservation.created', reservation);
        return reservationId;
    }

    /**
     * Get reservations for a specific time period
     */
    getReservationsForPeriod(startTime: number, endTime: number): Reservation[] {
        return Array.from(this.reservations.values()).filter(res => {
            return res.reservationTime >= startTime && res.reservationTime <= endTime;
        });
    }

    /**
     * Get upcoming reservations
     */
    getUpcomingReservations(hoursAhead: number = 24): Reservation[] {
        const now = Date.now();
        const futureTime = now + (hoursAhead * 60 * 60 * 1000);
        
        return this.getReservationsForPeriod(now, futureTime)
            .filter(res => res.status === 'confirmed')
            .sort((a, b) => a.reservationTime - b.reservationTime);
    }

    /**
     * Seat reservation (convert reservation to table assignment)
     */
    seatReservation(reservationId: string, tableId: string, orderId: string, serverId: string): boolean {
        const reservation = this.reservations.get(reservationId);
        if (!reservation || reservation.status !== 'confirmed') {
            return false;
        }

        const tableAssigned = this.assignTable(tableId, orderId, serverId, reservation.customerId);
        if (!tableAssigned) {
            return false;
        }

        // Update reservation status
        reservation.status = 'seated';
        this.reservations.set(reservationId, reservation);

        this.emit('reservation.seated', { reservationId, tableId, orderId });
        console.log(`👥 Reservation ${reservationId} seated at table ${this.getTable(tableId)?.number}`);
        return true;
    }

    /**
     * Cancel reservation
     */
    cancelReservation(reservationId: string): boolean {
        const reservation = this.reservations.get(reservationId);
        if (!reservation) return false;

        reservation.status = 'cancelled';
        this.reservations.set(reservationId, reservation);

        this.emit('reservation.cancelled', { reservationId });
        console.log(`❌ Reservation ${reservationId} cancelled`);
        return true;
    }

    /**
     * Mark reservation as no-show
     */
    markNoShow(reservationId: string): boolean {
        const reservation = this.reservations.get(reservationId);
        if (!reservation || reservation.status !== 'confirmed') {
            return false;
        }

        reservation.status = 'no_show';
        this.reservations.set(reservationId, reservation);

        this.emit('reservation.no_show', { reservationId });
        console.log(`⚠️ Reservation ${reservationId} marked as no-show`);
        return true;
    }

    /**
     * Get table utilization statistics
     */
    getTableStats(): {
        totalTables: number;
        availableTables: number;
        occupiedTables: number;
        reservedTables: number;
        closedTables: number;
        occupancyRate: number;
        avgTurnoverTime: number;
    } {
        const tables = Array.from(this.tables.values());
        const totalTables = tables.length;
        
        const availableTables = tables.filter(t => t.status === 'available').length;
        const occupiedTables = tables.filter(t => t.status === 'occupied').length;
        const reservedTables = tables.filter(t => t.status === 'reserved').length;
        const closedTables = tables.filter(t => t.status === 'closed').length;
        
        const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
        
        // Calculate average turnover time (simplified)
        const recentAssignments = Array.from(this.assignments.values())
            .filter(a => Date.now() - a.assignedAt < 24 * 60 * 60 * 1000); // Last 24 hours
        const avgTurnoverTime = recentAssignments.length > 0 ? 90 : 0; // Default 90 minutes

        return {
            totalTables,
            availableTables,
            occupiedTables,
            reservedTables,
            closedTables,
            occupancyRate,
            avgTurnoverTime
        };
    }

    /**
     * Get current table assignments
     */
    getCurrentAssignments(): TableAssignment[] {
        return Array.from(this.assignments.values());
    }

    /**
     * Transfer table to different server
     */
    transferTable(tableId: string, newServerId: string): boolean {
        const table = this.tables.get(tableId);
        if (!table || table.status !== 'occupied') {
            return false;
        }

        const oldServerId = table.assignedServer;
        table.assignedServer = newServerId;
        table.metadata.lastUpdated = Date.now();
        this.tables.set(tableId, table);

        this.emit('table.transferred', { 
            tableId, 
            oldServerId, 
            newServerId,
            orderId: table.currentOrderId
        });
        
        console.log(`🔄 Table ${table.number} transferred from ${oldServerId} to ${newServerId}`);
        return true;
    }
}

// Singleton instances per branch
const tableManagers: Map<string, TableManager> = new Map();

export function getTableManager(branchId: string): TableManager {
    if (!tableManagers.has(branchId)) {
        tableManagers.set(branchId, new TableManager(branchId));
    }
    return tableManagers.get(branchId)!;
}