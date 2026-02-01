/**
 * Multi-Branch Manager - Core Architecture for Multi-Location Businesses
 * 
 * Ensures complete isolation between branches while enabling centralized management
 * Handles inventory, staff, transactions, and reporting per branch
 */

import { LocalLedger } from '@/lib/storage/LocalLedger';
import { EventEngine } from '@/lib/events/EventEngine';
import { productInventoryEngine } from './ProductInventoryEngine';

export interface BranchConfig {
    id: string;
    name: string;
    location: {
        address: string;
        city: string;
        country: string;
        coordinates?: { lat: number; lng: number };
    };
    contact: {
        phone: string;
        email: string;
    };
    settings: {
        timezone: string;
        currency: string;
        taxRate: number;
        businessHours: {
            open: string; // HH:mm
            close: string; // HH:mm
        };
    };
    features: {
        deliveryEnabled: boolean;
        dineInEnabled: boolean;
        takeawayEnabled: boolean;
        onlineOrdering: boolean;
    };
    status: 'active' | 'inactive' | 'maintenance';
    createdAt: number;
    updatedAt: number;
}

export interface BranchMetrics {
    id: string;
    salesToday: number;
    ordersToday: number;
    activeStaff: number;
    lowStockItems: number;
    pendingOrders: number;
    lastSync: number;
}

export class MultiBranchManager {
    private branches: Map<string, BranchConfig> = new Map();
    private activeBranchId: string = '';
    private ledger: LocalLedger | null = null;
    private eventEngine: EventEngine | null = null;

    constructor(ledger: LocalLedger, eventEngine: EventEngine) {
        this.ledger = ledger;
        this.eventEngine = eventEngine;
        this.initialize();
    }

    private async initialize() {
        // Load branches from local storage
        const savedBranches = localStorage.getItem('nilelink_branches');
        if (savedBranches) {
            try {
                const branches: BranchConfig[] = JSON.parse(savedBranches);
                branches.forEach(branch => {
                    this.branches.set(branch.id, branch);
                });
            } catch (error) {
                console.error('Failed to parse saved branches:', error);
            }
        }

        // Set active branch from localStorage or default
        const savedActiveBranch = localStorage.getItem('nilelink_active_branch');
        if (savedActiveBranch && this.branches.has(savedActiveBranch)) {
            this.activeBranchId = savedActiveBranch;
        } else if (this.branches.size > 0) {
            this.activeBranchId = this.branches.keys().next().value;
        }

        // Create default branch if none exist
        if (this.branches.size === 0) {
            await this.createDefaultBranch();
        }
    }

    private async createDefaultBranch(): Promise<void> {
        const defaultBranch: BranchConfig = {
            id: 'branch-main',
            name: 'Main Branch',
            location: {
                address: '123 Business Street',
                city: 'Cairo',
                country: 'Egypt'
            },
            contact: {
                phone: '+20 123 456 7890',
                email: 'info@business.com'
            },
            settings: {
                timezone: 'Africa/Cairo',
                currency: 'EGP',
                taxRate: 14,
                businessHours: {
                    open: '08:00',
                    close: '22:00'
                }
            },
            features: {
                deliveryEnabled: true,
                dineInEnabled: true,
                takeawayEnabled: true,
                onlineOrdering: true
            },
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await this.addBranch(defaultBranch);
        this.setActiveBranch('branch-main');
    }

    /**
     * Add a new branch to the system
     */
    async addBranch(config: BranchConfig): Promise<void> {
        // Validate branch ID uniqueness
        if (this.branches.has(config.id)) {
            throw new Error(`Branch with ID ${config.id} already exists`);
        }

        // Validate required fields
        if (!config.name || !config.location.address) {
            throw new Error('Branch name and address are required');
        }

        this.branches.set(config.id, {
            ...config,
            createdAt: config.createdAt || Date.now(),
            updatedAt: Date.now()
        });

        await this.saveBranches();
        
        // Initialize branch-specific data
        await this.initializeBranchData(config.id);
        
        this.eventEngine?.emit('BRANCH_CREATED', {
            branchId: config.id,
            config
        });
    }

    /**
     * Initialize branch-specific data structures
     */
    private async initializeBranchData(branchId: string): Promise<void> {
        if (!this.ledger) return;

        // Create branch-specific collections
        await this.ledger.createBranchCollections(branchId);
        
        // Initialize default inventory for branch
        await productInventoryEngine.initializeBranchInventory(branchId);
        
        console.log(`✅ Initialized data structures for branch: ${branchId}`);
    }

    /**
     * Update existing branch configuration
     */
    async updateBranch(branchId: string, updates: Partial<BranchConfig>): Promise<void> {
        const existingBranch = this.branches.get(branchId);
        if (!existingBranch) {
            throw new Error(`Branch ${branchId} not found`);
        }

        const updatedBranch: BranchConfig = {
            ...existingBranch,
            ...updates,
            updatedAt: Date.now()
        };

        this.branches.set(branchId, updatedBranch);
        await this.saveBranches();
        
        this.eventEngine?.emit('BRANCH_UPDATED', {
            branchId,
            updates
        });
    }

    /**
     * Remove a branch from the system
     */
    async removeBranch(branchId: string): Promise<void> {
        if (!this.branches.has(branchId)) {
            throw new Error(`Branch ${branchId} not found`);
        }

        // Prevent removing active branch
        if (this.activeBranchId === branchId) {
            throw new Error('Cannot remove active branch. Switch to another branch first.');
        }

        this.branches.delete(branchId);
        await this.saveBranches();
        
        // Cleanup branch data
        await this.cleanupBranchData(branchId);
        
        this.eventEngine?.emit('BRANCH_REMOVED', { branchId });
    }

    /**
     * Cleanup branch-specific data
     */
    private async cleanupBranchData(branchId: string): Promise<void> {
        if (!this.ledger) return;
        
        await this.ledger.removeBranchCollections(branchId);
        await productInventoryEngine.cleanupBranchInventory(branchId);
        
        console.log(`🗑️ Cleaned up data for branch: ${branchId}`);
    }

    /**
     * Set active branch
     */
    setActiveBranch(branchId: string): void {
        if (!this.branches.has(branchId)) {
            throw new Error(`Branch ${branchId} not found`);
        }

        this.activeBranchId = branchId;
        localStorage.setItem('nilelink_active_branch', branchId);
        
        this.eventEngine?.emit('ACTIVE_BRANCH_CHANGED', { branchId });
        
        console.log(`🏢 Switched to branch: ${branchId}`);
    }

    /**
     * Get active branch configuration
     */
    getActiveBranch(): BranchConfig | null {
        return this.branches.get(this.activeBranchId) || null;
    }

    /**
     * Get all branches
     */
    getAllBranches(): BranchConfig[] {
        return Array.from(this.branches.values());
    }

    /**
     * Get branch by ID
     */
    getBranch(branchId: string): BranchConfig | null {
        return this.branches.get(branchId) || null;
    }

    /**
     * Get branch metrics for dashboard
     */
    async getBranchMetrics(branchId: string): Promise<BranchMetrics> {
        if (!this.ledger) {
            throw new Error('Ledger not initialized');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        // Get today's transactions for this branch
        const transactions = await this.ledger.getTransactionsByDate(todayTimestamp);
        const branchTransactions = transactions.filter(tx => tx.branchId === branchId);

        const salesToday = branchTransactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
        const ordersToday = branchTransactions.length;

        // Get active staff count
        const activeStaff = await this.ledger.getActiveStaffCount(branchId);

        // Get low stock items
        const lowStockItems = await productInventoryEngine.getLowStockItems(branchId);

        // Get pending orders
        const pendingOrders = await this.ledger.getPendingOrders(branchId);

        return {
            id: branchId,
            salesToday,
            ordersToday,
            activeStaff,
            lowStockItems: lowStockItems.length,
            pendingOrders: pendingOrders.length,
            lastSync: await this.ledger.getLastSyncTime()
        };
    }

    /**
     * Check if branch is currently open
     */
    isBranchOpen(branchId: string): boolean {
        const branch = this.branches.get(branchId);
        if (!branch) return false;

        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
        
        const [openHours, openMinutes] = branch.settings.businessHours.open.split(':').map(Number);
        const [closeHours, closeMinutes] = branch.settings.businessHours.close.split(':').map(Number);
        
        const openTime = openHours * 100 + openMinutes;
        const closeTime = closeHours * 100 + closeMinutes;

        return currentTime >= openTime && currentTime <= closeTime;
    }

    /**
     * Save branches to localStorage
     */
    private async saveBranches(): Promise<void> {
        const branchesArray = Array.from(this.branches.values());
        localStorage.setItem('nilelink_branches', JSON.stringify(branchesArray));
    }

    /**
     * Export branch configuration for backup
     */
    exportBranchConfig(branchId: string): string {
        const branch = this.getBranch(branchId);
        if (!branch) {
            throw new Error(`Branch ${branchId} not found`);
        }
        
        return JSON.stringify({
            config: branch,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        }, null, 2);
    }

    /**
     * Import branch configuration
     */
    async importBranchConfig(configData: string): Promise<void> {
        try {
            const parsed = JSON.parse(configData);
            const config: BranchConfig = parsed.config;
            
            if (!config.id || !config.name) {
                throw new Error('Invalid branch configuration format');
            }

            await this.addBranch(config);
            console.log(`📥 Imported branch: ${config.name}`);
        } catch (error) {
            throw new Error(`Failed to import branch configuration: ${error}`);
        }
    }
}

// Singleton instance
let multiBranchManager: MultiBranchManager | null = null;

export function getMultiBranchManager(ledger: LocalLedger, eventEngine: EventEngine): MultiBranchManager {
    if (!multiBranchManager) {
        multiBranchManager = new MultiBranchManager(ledger, eventEngine);
    }
    return multiBranchManager;
}