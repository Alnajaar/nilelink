/**
 * Cash Engine - Cash Tracking with Responsibility Chain
 * 
 * Treats cash as first-class citizen with event-based tracking
 * Full responsibility chain, reconciliation, and variance detection
 */

import { EventEngine } from '../events/EventEngine';
import { EventType, CashHandoverEvent, CashReconciliationEvent } from '../events/types';
import { printerService } from '../../services/PrinterService';
import { LocalLedger } from '../storage/LocalLedger';

export interface CashBalance {
    staffId: string;
    staffName: string;
    currentBalance: number;
    currency: 'EGP' | 'USD';
    lastUpdated: number;
    responsibility: 'cashier' | 'manager' | 'none';
}

export interface DenominationCount {
    denomination: number;  // e.g., 200, 100, 50, 20, 10, 5, 1, 0.5
    count: number;
    total: number;
}

export interface CashReconciliation {
    shiftId: string;
    staffId: string;
    expectedBalance: number;
    actualBalance: number;
    variance: number;
    variancePercent: number;
    denominationBreakdown: DenominationCount[];
    timestamp: number;
    status: 'balanced' | 'over' | 'short';
    notes?: string;
}

export class CashEngine {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private cashBalances: Map<string, CashBalance> = new Map();
    private denominationValues = [200, 100, 50, 20, 10, 5, 1, 0.5, 0.25];

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.hydrateBalances();
    }

    private async hydrateBalances() {
        try {
            const balances = await this.ledger.getAllStaffCashBalances();
            balances.forEach(b => {
                this.cashBalances.set(b.staffId, {
                    ...b,
                    staffName: '', // Resolving name would require StaffEngine or lookup
                    responsibility: 'cashier',
                    lastUpdated: b.lastUpdated
                });
            });
        } catch (err) {
            console.error('Failed to hydrate cash balances:', err);
        }
    }

    /**
     * Record cash sale collection
     */
    async recordCashSale(
        orderId: string,
        amount: number,
        currency: 'EGP' | 'USD',
        cashierId: string,
        amountTendered: number
    ): Promise<void> {
        const changeGiven = amountTendered - amount;

        await this.eventEngine.createEvent(
            EventType.PAYMENT_COLLECTED_CASH,
            cashierId,
            {
                orderId,
                amount,
                currency,
                amountTendered,
                changeGiven,
                cashierId,
            }
        );

        // Update cashier's balance
        await this.updateStaffBalance(cashierId, amount, currency);

        // Automatically open cash drawer for cash payments
        try {
            await printerService.openCashDrawer();
            console.log('💰 Cash drawer opened for cash payment', { orderId, amount });

            // Multi-sensory feedback (Phase 13)
            if (typeof window !== 'undefined' && (window as any).triggerNileLinkHaptic) {
                (window as any).triggerNileLinkHaptic('SUCCESS');
            }
        } catch (error) {
            console.warn('⚠️ Failed to open cash drawer', { error, orderId });
            // Don't fail the payment if drawer opening fails - just log the warning
        }
    }

    /**
     * Hand over cash between staff members
     */
    async handoverCash(
        amount: number,
        currency: 'EGP' | 'USD',
        fromStaffId: string,
        toStaffId: string,
        reason: 'shift-change' | 'bank-deposit' | 'manager-collection',
        expectedAmount: number,
        actualAmount: number
    ): Promise<CashHandoverEvent> {
        const variance = actualAmount - expectedAmount;

        const event = await this.eventEngine.createEvent<CashHandoverEvent>(
            EventType.CASH_HANDOVER,
            fromStaffId,
            {
                amount: actualAmount,
                currency,
                fromStaffId,
                toStaffId,
                reason,
                expectedAmount,
                actualAmount,
                variance,
            }
        );

        // Update balances
        await this.updateStaffBalance(fromStaffId, -actualAmount, currency);
        await this.updateStaffBalance(toStaffId, actualAmount, currency);

        return event;
    }

    /**
     * Perform shift reconciliation
     */
    async reconcileShift(
        shiftId: string,
        staffId: string,
        expectedBalance: number,
        denominationBreakdown: DenominationCount[],
        notes?: string
    ): Promise<CashReconciliation> {
        const actualBalance = denominationBreakdown.reduce((sum, d) => sum + d.total, 0);
        const variance = actualBalance - expectedBalance;
        const variancePercent = expectedBalance > 0 ? (variance / expectedBalance) * 100 : 0;

        let status: 'balanced' | 'over' | 'short' = 'balanced';
        if (variance > 0.01) status = 'over';
        else if (variance < -0.01) status = 'short';

        const reconciliation: CashReconciliation = {
            shiftId,
            staffId,
            expectedBalance,
            actualBalance,
            variance,
            variancePercent,
            denominationBreakdown,
            timestamp: Date.now(),
            status,
            notes,
        };

        // Create reconciliation event
        await this.eventEngine.createEvent<CashReconciliationEvent>(
            EventType.CASH_RECONCILIATION,
            staffId,
            {
                shiftId,
                staffId,
                expectedBalance,
                actualBalance,
                variance,
                denominationBreakdown,
                notes,
            }
        );

        // Reset staff balance after reconciliation
        await this.resetStaffBalance(staffId);

        return reconciliation;
    }

    /**
     * Open cash drawer for shift
     */
    async openDrawer(
        staffId: string,
        openingBalance: number,
        currency: 'EGP' | 'USD'
    ): Promise<void> {
        await this.eventEngine.createEvent(
            EventType.CASH_DRAWER_OPENED,
            staffId,
            {
                staffId,
                openingBalance,
                currency,
                timestamp: Date.now(),
            }
        );

        await this.updateStaffBalance(staffId, openingBalance, currency);

        // Also trigger physical cash drawer opening
        try {
            await printerService.openCashDrawer();
            console.log('💰 Cash drawer opened for shift start', { staffId, openingBalance });
        } catch (error) {
            console.warn('⚠️ Failed to open cash drawer for shift', { error, staffId });
        }
    }

    /**
     * Manually open cash drawer (for change, access, etc.)
     */
    async openCashDrawer(reason?: string): Promise<void> {
        try {
            await printerService.openCashDrawer();
            console.log('💰 Cash drawer manually opened', { reason });
        } catch (error) {
            console.error('❌ Failed to open cash drawer manually', { error, reason });
            throw error;
        }
    }

    /**
     * Close cash drawer for shift
     */
    async closeDrawer(
        staffId: string,
        closingBalance: number,
        currency: 'EGP' | 'USD'
    ): Promise<void> {
        await this.eventEngine.createEvent(
            EventType.CASH_DRAWER_CLOSED,
            staffId,
            {
                staffId,
                closingBalance,
                currency,
                timestamp: Date.now(),
            }
        );
    }

    /**
     * Update staff cash balance
     */
    private async updateStaffBalance(
        staffId: string,
        amount: number,
        currency: 'EGP' | 'USD'
    ): Promise<void> {
        const balance = this.cashBalances.get(staffId) || {
            staffId,
            staffName: '',
            currentBalance: 0,
            currency,
            lastUpdated: Date.now(),
            responsibility: 'cashier',
        };

        balance.currentBalance += amount;
        balance.lastUpdated = Date.now();

        this.cashBalances.set(staffId, balance);

        // Persist to ledger (Phase 10)
        await this.ledger.upsertStaffCashBalance(staffId, balance.currentBalance, currency);
    }

    /**
     * Reset staff balance after reconciliation
     */
    private async resetStaffBalance(staffId: string): Promise<void> {
        const balance = this.cashBalances.get(staffId);
        if (balance) {
            balance.currentBalance = 0;
            balance.lastUpdated = Date.now();
            this.cashBalances.set(staffId, balance);

            // Persist reset to ledger
            await this.ledger.upsertStaffCashBalance(staffId, 0, balance.currency);
        }
    }

    /**
     * Get current balance for staff member
     */
    getStaffBalance(staffId: string): CashBalance | null {
        return this.cashBalances.get(staffId) || null;
    }

    /**
     * Get all active cash balances
     */
    getAllBalances(): CashBalance[] {
        return Array.from(this.cashBalances.values()).filter(b => b.currentBalance > 0);
    }

    /**
     * Calculate denomination breakdown from total
     */
    calculateDenominationBreakdown(total: number): DenominationCount[] {
        const breakdown: DenominationCount[] = [];
        let remaining = Math.round(total * 100) / 100; // Round to 2 decimals

        for (const denom of this.denominationValues) {
            if (remaining >= denom) {
                const count = Math.floor(remaining / denom);
                breakdown.push({
                    denomination: denom,
                    count,
                    total: count * denom,
                });
                remaining = Math.round((remaining - (count * denom)) * 100) / 100;
            }
        }

        return breakdown;
    }

    /**
     * Analyze cash variance trends
     */
    analyzeCashVariance(reconciliations: CashReconciliation[]): {
        totalVariance: number;
        averageVariance: number;
        overCount: number;
        shortCount: number;
        balancedCount: number;
        worstVariance: number;
        bestVariance: number;
    } {
        if (reconciliations.length === 0) {
            return {
                totalVariance: 0,
                averageVariance: 0,
                overCount: 0,
                shortCount: 0,
                balancedCount: 0,
                worstVariance: 0,
                bestVariance: 0,
            };
        }

        const totalVariance = reconciliations.reduce((sum, r) => sum + r.variance, 0);
        const overCount = reconciliations.filter(r => r.status === 'over').length;
        const shortCount = reconciliations.filter(r => r.status === 'short').length;
        const balancedCount = reconciliations.filter(r => r.status === 'balanced').length;

        const variances = reconciliations.map(r => r.variance);
        const worstVariance = Math.min(...variances);
        const bestVariance = Math.max(...variances);

        return {
            totalVariance,
            averageVariance: totalVariance / reconciliations.length,
            overCount,
            shortCount,
            balancedCount,
            worstVariance,
            bestVariance,
        };
    }

    /**
     * Get staff cash handling performance
     */
    getStaffPerformance(staffId: string, reconciliations: CashReconciliation[]): {
        totalShifts: number;
        accuracyPercent: number;
        averageVariance: number;
        rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    } {
        const staffReconciliations = reconciliations.filter(r => r.staffId === staffId);

        if (staffReconciliations.length === 0) {
            return {
                totalShifts: 0,
                accuracyPercent: 100,
                averageVariance: 0,
                rating: 'excellent',
            };
        }

        const balancedCount = staffReconciliations.filter(r => r.status === 'balanced').length;
        const accuracyPercent = (balancedCount / staffReconciliations.length) * 100;
        const averageVariance = staffReconciliations.reduce((sum, r) => sum + Math.abs(r.variance), 0) / staffReconciliations.length;

        let rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
        if (accuracyPercent >= 95) rating = 'excellent';
        else if (accuracyPercent >= 85) rating = 'good';
        else if (accuracyPercent >= 70) rating = 'needs-improvement';
        else rating = 'poor';

        return {
            totalShifts: staffReconciliations.length,
            accuracyPercent,
            averageVariance,
            rating,
        };
    }
}
