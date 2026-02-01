/**
 * PayrollEngine.ts
 * Decentralized Payroll & Attendance System
 * 
 * Handles staff attendance, shift-based payroll, and labor cost analysis.
 */

export enum PayModel {
    HOURLY = 'HOURLY',
    SALARY = 'SALARY',
    SHIFT = 'SHIFT'
}

export interface Shift {
    id: string;
    staffId: string;
    clockIn: number;
    clockOut?: number;
    breakDuration: number; // in minutes
    status: 'ACTIVE' | 'COMPLETED';
}

export interface PayrollRecord {
    id: string;
    staffId: string;
    periodStart: number;
    periodEnd: number;
    totalHours: number;
    regularPay: number;
    overtimePay: number;
    bonuses: number;
    deductions: number;
    netPay: number;
    status: 'PENDING' | 'PROCESSED' | 'PAID';
}

export class PayrollEngine {
    private shifts: Map<string, Shift> = new Map();
    private payrolls: Map<string, PayrollRecord[]> = new Map();

    constructor(private localLedger: any) {
        this.loadFromStorage();
    }

    private async loadFromStorage() {
        const activeShifts = await this.localLedger.getActiveShifts();
        activeShifts.forEach((s: Shift) => this.shifts.set(s.id, s));
    }

    /**
     * Get all currently active shifts
     */
    async getActiveShifts(): Promise<Shift[]> {
        return await this.localLedger.getActiveShifts();
    }

    /**
     * Records staff clock-in
     */
    async clockIn(staffId: string): Promise<Shift> {
        const shift: Shift = {
            id: `shift_${Date.now()}`,
            staffId,
            clockIn: Date.now(),
            breakDuration: 0,
            status: 'ACTIVE'
        };
        this.shifts.set(shift.id, shift);
        await this.localLedger.upsertShift(shift);
        return shift;
    }

    /**
     * Records staff clock-out and calculates duration
     */
    async clockOut(shiftId: string): Promise<Shift | null> {
        const shift = this.shifts.get(shiftId);
        if (!shift) return null;

        shift.clockOut = Date.now();
        shift.status = 'COMPLETED';
        this.shifts.set(shift.id, shift);
        await this.localLedger.upsertShift(shift);
        return shift;
    }

    /**
     * Calculates payroll for a specific staff member and period
     */
    calculatePayroll(staffId: string, start: number, end: number, hourlyRate: number): PayrollRecord {
        const staffShifts = Array.from(this.shifts.values()).filter(s =>
            s.staffId === staffId &&
            s.clockIn >= start &&
            s.clockOut && s.clockOut <= end
        );

        let totalMinutes = 0;
        staffShifts.forEach(s => {
            const duration = (s.clockOut! - s.clockIn) / (1000 * 60) - s.breakDuration;
            totalMinutes += Math.max(0, duration);
        });

        const totalHours = totalMinutes / 60;
        const regularHours = Math.min(totalHours, 40); // 40h standard
        const otHours = Math.max(0, totalHours - 40);

        const regularPay = regularHours * hourlyRate;
        const overtimePay = otHours * (hourlyRate * 1.5);

        return {
            id: `pay_${Date.now()}`,
            staffId,
            periodStart: start,
            periodEnd: end,
            totalHours,
            regularPay,
            overtimePay,
            bonuses: 0,
            deductions: 0,
            netPay: regularPay + overtimePay,
            status: 'PENDING'
        };
    }
}
