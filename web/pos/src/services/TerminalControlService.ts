/**
 * NileLink Terminal Control Service
 * Handles terminal-level security: IP whitelisting, license validation,
 * and business-type locking. Ensures a terminal only runs authorized software.
 */

import { auditLogger, AuditLevel } from '@/shared/services/AuditLogger';

export interface TerminalSnapshot {
    isAuthorized: boolean;
    authorizedRoles: string[];
    allowedIpRanges: string[];
    businessType: 'RESTAURANT' | 'SUPERMARKET' | 'COFFEE_SHOP' | 'GENERAL';
    licenseExpiry: number;
}

class TerminalControlService {
    private static instance: TerminalControlService;

    // Default mock configuration - In production, this comes from a Secure Config API
    private config: TerminalSnapshot = {
        isAuthorized: true,
        authorizedRoles: ['ADMIN', 'OWNER', 'MANAGER', 'CASHIER'],
        allowedIpRanges: ['*'], // Allow all by default for now
        businessType: 'RESTAURANT', // Default to restaurant
        licenseExpiry: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    private constructor() { }

    public static getInstance(): TerminalControlService {
        if (!TerminalControlService.instance) {
            TerminalControlService.instance = new TerminalControlService();
        }
        return TerminalControlService.instance;
    }

    /**
     * Perform deep terminal validation
     */
    public async validateTerminal(): Promise<{ valid: boolean; reason?: string }> {
        // 1. License Check
        if (Date.now() > this.config.licenseExpiry) {
            this.handleSecurityViolation('LICENSE_EXPIRED');
            return { valid: false, reason: 'Terminal license has expired.' };
        }

        // 2. IP Restriction Check
        const currentIp = await this.getCurrentIp();
        if (this.config.allowedIpRanges[0] !== '*' && !this.config.allowedIpRanges.includes(currentIp)) {
            this.handleSecurityViolation('IP_NOT_AUTHORIZED', { ip: currentIp });
            return { valid: false, reason: `Terminal IP ${currentIp} is not authorized for this branch.` };
        }

        return { valid: true };
    }

    private async getCurrentIp(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (e) {
            return '127.0.0.1'; // Fallback
        }
    }

    private handleSecurityViolation(code: string, details: any = {}) {
        auditLogger.log(
            AuditLevel.SECURITY,
            `TERMINAL_SECURITY_VIOLATION`,
            { code, ...details },
            { id: 'system', name: 'Terminal Control', role: 'SYSTEM' }
        ).catch(console.error);
    }

    public getTerminalSettings(): TerminalSnapshot {
        return { ...this.config };
    }

    public isRoleAuthorized(role: string): boolean {
        return this.config.authorizedRoles.includes(role);
    }
}

export const terminalControl = TerminalControlService.getInstance();
