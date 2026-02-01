/**
 * NileLink Scale & Weight Manager
 * 
 * Handles weighing operations for produce and bulk items.
 * Ensures weight-based theft prevention by cross-referencing Vision and POS scans.
 */

import { EventEngine } from '../events/EventEngine';
import { IWeightScaleHAL } from './hal/HAL';
import { AlertManager } from '../security/AlertManager';
import { EventType } from '../events/types';

export interface ScaleStatus {
    isOnline: boolean;
    currentWeight: number;
    isStable: boolean;
    unit: 'kg' | 'lb';
}

export class ScaleManager {
    private eventEngine: EventEngine;
    private hal: IWeightScaleHAL;
    private alertManager: AlertManager;
    private lastStableWeight: number = 0;

    constructor(
        eventEngine: EventEngine,
        hal: IWeightScaleHAL,
        alertManager: AlertManager
    ) {
        this.eventEngine = eventEngine;
        this.hal = hal;
        this.alertManager = alertManager;
    }

    /**
     * Get current weight from hardware
     */
    async getCurrentWeight(): Promise<number> {
        try {
            const weight = await this.hal.getWeight();
            console.log(`[Scale] Current weight: ${weight}kg`);
            return weight;
        } catch (error) {
            console.error('Scale read error:', error);
            await this.alertManager.createAlert(
                'medium',
                'hardware',
                'Scale Read Error',
                'Failed to read weight from hardware scale.',
                { error: String(error) },
                'ScaleManager'
            );
            return 0;
        }
    }

    /**
     * Perform Tare operation
     */
    async tare(): Promise<void> {
        await this.hal.tareScale();
        await this.eventEngine.createEvent(
            EventType.SYSTEM_STATE_CHANGED,
            'ScaleManager',
            { action: 'tare', timestamp: Date.now() }
        );
    }

    /**
     * Zero the scale
     */
    async zero(): Promise<void> {
        await this.hal.zeroScale();
    }

    /**
     * Verify weight for a specific product
     * (Called during Checkout to ensure the item in the bagging area matches the scan)
     */
    async verifyWeight(expectedWeight: number, tolerance: number = 0.05): Promise<boolean> {
        const actualWeight = await this.getCurrentWeight();
        const difference = Math.abs(actualWeight - expectedWeight);

        if (difference > tolerance) {
            await this.alertManager.createAlert(
                'high',
                'theft',
                'Weight Discrepancy Detected',
                `Expected ${expectedWeight}kg but found ${actualWeight}kg.`,
                { expected: expectedWeight, actual: actualWeight, difference },
                'ScaleManager'
            );
            return false;
        }

        return true;
    }
}
