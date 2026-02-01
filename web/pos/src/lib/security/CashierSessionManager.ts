/**
 * NileLink Cashier Session Manager
 *
 * Manages cashier sessions with isolation, permissions, and security controls:
 * - Unique session IDs per cashier login
 * - Transaction ownership binding to sessions
 * - Role-based permission enforcement
 * - Session timeout and auto-logout mechanisms
 * - Concurrent session limits
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import {
    EventType,
    CashierSessionStartedEvent,
    CashierSessionEndedEvent
} from '../events/types';
import { StaffMember } from '../staff/StaffEngine';
import { POS_ROLE } from '../../utils/permissions';
import { v4 as uuidv4 } from 'uuid';

export interface CashierSession {
    sessionId: string;
    cashierId: string;
    cashierName: string;
    stationId: string;
    role: POS_ROLE;
    permissions: string[];
    startTime: number;
    lastActivity: number;
    isActive: boolean;
    transactionCount: number;
    totalRevenue: number;
    openingBalance?: number;
    currentBalance?: number;
    sessionLimits: SessionLimits;
}

export interface SessionLimits {
    maxTransactionsPerHour: number;
    maxDiscountPercentage: number;
    maxVoidAmount: number;
    maxRefundAmount: number;
    requireSupervisorFor: string[];
}

export interface PermissionCheck {
    allowed: boolean;
    reason?: string;
    requiresSupervisor?: boolean;
}

export class CashierSessionManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private activeSessions = new Map<string, CashierSession>();
    private sessionTimeouts = new Map<string, NodeJS.Timeout>();

    // Configuration
    private readonly SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours
    private readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
    private readonly MAX_CONCURRENT_SESSIONS_PER_CASHIER = 1;

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.initializeFromEvents();
        this.startSessionMonitor();
    }

    /**
     * Initialize from existing session events
     */
    private async initializeFromEvents(): Promise<void> {
        try {
            const events = await this.ledger.getAllEvents();

            // Find active sessions that haven't been ended
            const startedSessions = new Set<string>();
            const endedSessions = new Set<string>();

            for (const event of events) {
                if (event.type === EventType.CASHIER_SESSION_STARTED) {
                    startedSessions.add(event.payload.sessionId);
                } else if (event.type === EventType.CASHIER_SESSION_ENDED) {
                    endedSessions.add(event.payload.sessionId);
                }
            }

            // Any started session without an end event is still active
            for (const sessionId of startedSessions) {
                if (!endedSessions.has(sessionId)) {
                    // Note: In a real implementation, we'd need to reconstruct session state
                    // For now, we'll mark these as ended to avoid stale sessions
                    console.warn(`Found dangling session ${sessionId}, marking as ended`);
                    await this.endSession(sessionId, 'system');
                }
            }

            console.log('✅ Cashier Session Manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Cashier Session Manager:', error);
        }
    }

    /**
     * Start monitoring sessions for timeouts
     */
    private startSessionMonitor(): void {
        setInterval(() => {
            this.checkSessionTimeouts();
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    /**
     * Start a new cashier session
     */
    async startSession(
        cashier: StaffMember,
        stationId: string,
        openingBalance?: number
    ): Promise<{ session: CashierSession; allowed: boolean; reason?: string }> {
        // Check for existing active sessions for this cashier
        const existingSessions = Array.from(this.activeSessions.values())
            .filter(s => s.cashierId === cashier.id && s.isActive);

        if (existingSessions.length >= this.MAX_CONCURRENT_SESSIONS_PER_CASHIER) {
            return {
                session: null as any,
                allowed: false,
                reason: `Cashier already has ${existingSessions.length} active session(s)`
            };
        }

        // Create session
        const sessionId = uuidv4();
        const session: CashierSession = {
            sessionId,
            cashierId: cashier.id,
            cashierName: cashier.username,
            stationId,
            role: cashier.roles[0], // Primary role
            permissions: cashier.permissions,
            startTime: Date.now(),
            lastActivity: Date.now(),
            isActive: true,
            transactionCount: 0,
            totalRevenue: 0,
            openingBalance,
            currentBalance: openingBalance,
            sessionLimits: this.getSessionLimits(cashier.roles[0]),
        };

        this.activeSessions.set(sessionId, session);

        // Set session timeout
        this.setSessionTimeout(sessionId);

        // Create event
        await this.eventEngine.createEvent<CashierSessionStartedEvent>(
            EventType.CASHIER_SESSION_STARTED,
            cashier.id,
            {
                sessionId,
                cashierId: cashier.id,
                cashierName: cashier.username,
                stationId,
                startTime: session.startTime,
                permissions: session.permissions,
                openingBalance,
            }
        );

        return { session, allowed: true };
    }

    /**
     * End a cashier session
     */
    async endSession(
        sessionId: string,
        endedBy: string,
        closingBalance?: number
    ): Promise<boolean> {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive) {
            return false;
        }

        session.isActive = false;
        session.currentBalance = closingBalance;

        // Clear timeout
        const timeout = this.sessionTimeouts.get(sessionId);
        if (timeout) {
            clearTimeout(timeout);
            this.sessionTimeouts.delete(sessionId);
        }

        // Create end event
        await this.eventEngine.createEvent<CashierSessionEndedEvent>(
            EventType.CASHIER_SESSION_ENDED,
            endedBy,
            {
                sessionId,
                cashierId: session.cashierId,
                endTime: Date.now(),
                duration: Date.now() - session.startTime,
                transactionsProcessed: session.transactionCount,
                totalRevenue: session.totalRevenue,
                closingBalance,
            }
        );

        this.activeSessions.delete(sessionId);
        return true;
    }

    /**
     * Update session activity
     */
    updateActivity(sessionId: string): void {
        const session = this.activeSessions.get(sessionId);
        if (session && session.isActive) {
            session.lastActivity = Date.now();
            this.resetSessionTimeout(sessionId);
        }
    }

    /**
     * Check permissions for an action
     */
    checkPermission(
        sessionId: string,
        permission: string,
        context?: { amount?: number; transactionId?: string }
    ): PermissionCheck {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive) {
            return { allowed: false, reason: 'Invalid or inactive session' };
        }

        // Check if cashier has the required permission
        if (!session.permissions.includes(permission)) {
            return { allowed: false, reason: 'Insufficient permissions' };
        }

        // Check session limits
        const limitCheck = this.checkSessionLimits(session, permission, context);
        if (!limitCheck.allowed) {
            return limitCheck;
        }

        return { allowed: true };
    }

    /**
     * Record transaction in session
     */
    recordTransaction(sessionId: string, amount: number): void {
        const session = this.activeSessions.get(sessionId);
        if (session && session.isActive) {
            session.transactionCount++;
            session.totalRevenue += amount;
            session.lastActivity = Date.now();
        }
    }

    /**
     * Bind transaction to session
     */
    bindTransactionToSession(sessionId: string, transactionId: string): boolean {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive) {
            return false;
        }

        // In a real implementation, this would store the binding
        // For now, we just validate the session exists
        return true;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): CashierSession | undefined {
        return this.activeSessions.get(sessionId);
    }

    /**
     * Get all active sessions
     */
    getActiveSessions(): CashierSession[] {
        return Array.from(this.activeSessions.values()).filter(s => s.isActive);
    }

    /**
     * Get sessions for a specific cashier
     */
    getCashierSessions(cashierId: string): CashierSession[] {
        return Array.from(this.activeSessions.values())
            .filter(s => s.cashierId === cashierId);
    }

    /**
     * Force logout inactive sessions
     */
    forceLogoutInactive(): number {
        let count = 0;
        const now = Date.now();

        for (const [sessionId, session] of this.activeSessions) {
            if (session.isActive && (now - session.lastActivity) > this.ACTIVITY_TIMEOUT) {
                this.endSession(sessionId, 'system');
                count++;
            }
        }

        return count;
    }

    /**
     * Get session limits based on role
     */
    private getSessionLimits(role: POS_ROLE): SessionLimits {
        switch (role) {
            case POS_ROLE.MANAGER:
                return {
                    maxTransactionsPerHour: 200,
                    maxDiscountPercentage: 50,
                    maxVoidAmount: 10000,
                    maxRefundAmount: 50000,
                    requireSupervisorFor: [],
                };

            case POS_ROLE.CASHIER:
            default:
                return {
                    maxTransactionsPerHour: 100,
                    maxDiscountPercentage: 10,
                    maxVoidAmount: 1000,
                    maxRefundAmount: 5000,
                    requireSupervisorFor: ['void', 'refund', 'large_discount'],
                };
        }
    }

    /**
     * Check session limits for an action
     */
    private checkSessionLimits(
        session: CashierSession,
        permission: string,
        context?: { amount?: number; transactionId?: string }
    ): PermissionCheck {
        const limits = session.sessionLimits;
        const amount = context?.amount || 0;

        switch (permission) {
            case 'PROCESS_DISCOUNT':
                if (amount > limits.maxDiscountPercentage) {
                    return {
                        allowed: false,
                        reason: `Discount exceeds limit of ${limits.maxDiscountPercentage}%`,
                        requiresSupervisor: true
                    };
                }
                break;

            case 'PROCESS_VOID':
                if (amount > limits.maxVoidAmount) {
                    return {
                        allowed: false,
                        reason: `Void amount exceeds limit of ${limits.maxVoidAmount}`,
                        requiresSupervisor: true
                    };
                }
                break;

            case 'PROCESS_REFUND':
                if (amount > limits.maxRefundAmount) {
                    return {
                        allowed: false,
                        reason: `Refund amount exceeds limit of ${limits.maxRefundAmount}`,
                        requiresSupervisor: true
                    };
                }
                break;
        }

        return { allowed: true };
    }

    /**
     * Set session timeout
     */
    private setSessionTimeout(sessionId: string): void {
        const timeout = setTimeout(async () => {
            await this.endSession(sessionId, 'system');
        }, this.SESSION_TIMEOUT);

        this.sessionTimeouts.set(sessionId, timeout);
    }

    /**
     * Reset session timeout
     */
    private resetSessionTimeout(sessionId: string): void {
        const existingTimeout = this.sessionTimeouts.get(sessionId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        this.setSessionTimeout(sessionId);
    }

    /**
     * Check for session timeouts
     */
    private checkSessionTimeouts(): void {
        const now = Date.now();

        for (const [sessionId, session] of this.activeSessions) {
            if (session.isActive) {
                // Check activity timeout
                if ((now - session.lastActivity) > this.ACTIVITY_TIMEOUT) {
                    console.warn(`Session ${sessionId} timed out due to inactivity`);
                    this.endSession(sessionId, 'system');
                }
                // Check absolute session timeout
                else if ((now - session.startTime) > this.SESSION_TIMEOUT) {
                    console.warn(`Session ${sessionId} reached maximum duration`);
                    this.endSession(sessionId, 'system');
                }
            }
        }
    }

    /**
     * Validate session ownership of transaction
     */
    validateTransactionOwnership(sessionId: string, transactionId: string): boolean {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive) {
            return false;
        }

        // In a real implementation, this would check a transaction-to-session mapping
        // For now, we assume the session is valid for any transaction it attempts
        return true;
    }

    /**
     * Get session statistics
     */
    getSessionStats(): {
        activeSessions: number;
        totalSessionsToday: number;
        averageSessionDuration: number;
    } {
        const activeSessions = this.getActiveSessions();
        const now = Date.now();
        const todayStart = new Date(now).setHours(0, 0, 0, 0);

        // This is a simplified implementation
        // In reality, you'd query the event history
        return {
            activeSessions: activeSessions.length,
            totalSessionsToday: activeSessions.filter(s => s.startTime >= todayStart).length,
            averageSessionDuration: activeSessions.reduce((sum, s) => sum + (now - s.startTime), 0) / activeSessions.length || 0,
        };
    }
}