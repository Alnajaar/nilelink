/**
 * Staff Engine - Mission Critical Staff Lifecycle & Security
 * 
 * Handles staff registration, PIN verification, and permission mapping.
 * Connects to LocalLedger for immutable staff directory persistence.
 */

import { LocalLedger } from '../storage/LocalLedger';
import { POS_ROLE, PERMISSION, ROLE_PERMISSIONS } from '../../utils/permissions';
import { v4 as uuidv4 } from 'uuid';

export interface StaffMember {
    id: string;
    uniqueCode: string; // 8-digit readable ID
    username: string;
    phone: string;
    pinHash: string;
    roles: POS_ROLE[];
    permissions: PERMISSION[];
    profileImage?: string;
    branchId: string;
    status: 'active' | 'suspended' | 'deleted';
    createdAt: number;
}

export class StaffEngine {
    private ledger: LocalLedger;

    constructor(ledger: LocalLedger) {
        this.ledger = ledger;
    }

    /**
     * Hash PIN for storage
     * In a real browser env, we'd use SubtleCrypto.
     * For this protocol, we'll use a simple deterministic hash for simulation.
     */
    private async hashPin(pin: string): Promise<string> {
        const msgUint8 = new TextEncoder().encode(pin + "nilelink_salt");
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Create a new staff member with unique 8-digit code
     */
    async createStaff(data: {
        username: string;
        phone: string;
        pin: string;
        roles: POS_ROLE[];
        permissions?: PERMISSION[];
        branchId: string;
    }): Promise<StaffMember> {
        const id = uuidv4();
        const uniqueCode = Math.floor(10000000 + Math.random() * 90000000).toString();
        const pinHash = await this.hashPin(data.pin);

        // Auto-assign permissions based on roles if not specifically provided
        const inheritedPermissions = data.permissions ||
            Array.from(new Set(data.roles.flatMap(role => ROLE_PERMISSIONS[role] || [])));

        const staff: StaffMember = {
            id,
            uniqueCode,
            username: data.username,
            phone: data.phone,
            pinHash,
            roles: data.roles,
            permissions: inheritedPermissions,
            branchId: data.branchId,
            status: 'active',
            createdAt: Date.now(),
        };

        await this.ledger.upsertStaff(staff);
        return staff;
    }

    /**
     * Verify PIN and return staff member if valid
     */
    async verifyPin(uniqueCode: string, pin: string): Promise<StaffMember | null> {
        const staff = await this.ledger.getStaffByUniqueCode(uniqueCode);
        if (!staff || staff.status !== 'active') return null;

        const hashedInput = await this.hashPin(pin);
        if (hashedInput === staff.pinHash) {
            return staff;
        }

        return null;
    }

    /**
     * Seed initial admin if no staff exists
     */
    async seedDefaultAdmin(branchId: string): Promise<void> {
        const all = await this.ledger.getAllStaff();
        if (all.length === 0) {
            await this.createStaff({
                username: 'System Admin',
                phone: '+201000000000',
                pin: '123456',
                roles: [POS_ROLE.SUPER_ADMIN],
                branchId
            });
            console.log('🛡️ Default Admin seeded for branch:', branchId);
        }
    }

    /**
     * Get all staff for management
     */
    async listStaff(): Promise<StaffMember[]> {
        return await this.ledger.getAllStaff();
    }

    /**
     * Update staff details or permissions
     */
    async updateStaff(id: string, updates: Partial<StaffMember>): Promise<void> {
        const current = await this.ledger.getStaffById(id);
        if (!current) throw new Error('Staff not found');

        const updated = { ...current, ...updates, updatedAt: Date.now() };
        await this.ledger.upsertStaff(updated);
    }
}
