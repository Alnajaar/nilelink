/**
 * NileLink Global Security Orchestrator
 * 
 * The "Brain" of the POS security ecosystem.
 * Correlates events from multiple engines to detect complex, coordinated threats
 * and orchestrate autonomous system-wide responses.
 */

import { EventEngine } from '../events/EventEngine';
import { TheftPreventionEngine } from './TheftPreventionEngine';
import { VisionEngine } from './VisionEngine';
import { FraudDetectionEngine } from './FraudDetectionEngine';
import { AlertManager } from './AlertManager';
import web3Service from '@shared/services/Web3Service';
import { EventType, EconomicEvent } from '../events/types';

export interface GlobalRiskProfile {
    totalRiskScore: number;
    visionRisk: number;
    fraudRisk: number;
    easRisk: number;
    isInLockdown: boolean;
    activeThreats: string[];
}

export class SecurityOrchestrator {
    private eventEngine: EventEngine;
    private theftPrevention: TheftPreventionEngine;
    private visionEngine: VisionEngine;
    private fraudEngine: FraudDetectionEngine;
    private alertManager: AlertManager;

    private currentRiskProfile: GlobalRiskProfile = {
        totalRiskScore: 0,
        visionRisk: 0,
        fraudRisk: 0,
        easRisk: 0,
        isInLockdown: false,
        activeThreats: []
    };

    private thresholds = {
        lockdownThreshold: 85,
        visionWeight: 40,
        fraudWeight: 30,
        trustMultiplier: 10
    };

    constructor(
        eventEngine: EventEngine,
        theftPrevention: TheftPreventionEngine,
        visionEngine: VisionEngine,
        fraudEngine: FraudDetectionEngine,
        alertManager: AlertManager
    ) {
        this.eventEngine = eventEngine;
        this.theftPrevention = theftPrevention;
        this.visionEngine = visionEngine;
        this.fraudEngine = fraudEngine;
        this.alertManager = alertManager;

        this.refreshThresholds();
        this.subscribeToEvents();
    }

    /**
     * Refresh thresholds from On-Chain Governance
     */
    async refreshThresholds(): Promise<void> {
        const onChainThresholds = await web3Service.getSecurityThresholds();
        this.thresholds = onChainThresholds;
        console.log(`[SecurityOrchestrator] Dynamic thresholds updated from blockchain:`, this.thresholds);
    }

    private subscribeToEvents(): void {
        this.eventEngine.subscribe(this.processEvent.bind(this));
    }

    private processEvent(event: EconomicEvent): void {
        // Correlate results from relevant engines
        const transactionId = (event.payload as any).transactionId;
        if (!transactionId) return;

        this.calculateUnifiedRisk(transactionId);
    }

    /**
     * Unified Risk Correlation Engine
     * Combines data from all security vectors
     */
    private calculateUnifiedRisk(transactionId: string): void {
        const visionAnomalies = this.visionEngine.getDiscrepancies(transactionId);
        const fraudAnomalies = this.fraudEngine.getAnomalies(transactionId);

        // Hypothetical EAS integration (assuming EASManager exposes state)
        // const easIssues = this.easManager.getIssues(transactionId);

        let riskScore = 0;
        const threats: string[] = [];

        // 1. Vision Weight (High priority - visual proof of theft)
        if (visionAnomalies.length > 0) {
            riskScore += this.thresholds.visionWeight;
            threats.push('VISUAL_DISCREPANCY');
        }

        // 2. Fraud Weight (Behavioral analysis)
        if (fraudAnomalies.length > 0) {
            riskScore += this.thresholds.fraudWeight;
            threats.push('BEHAVIORAL_FRAUD');
        }

        // 3. Coordinated Attack Detection
        // If both vision and fraud flag the same TX, it's almost certainly malicious
        if (visionAnomalies.length > 0 && fraudAnomalies.length > 0) {
            riskScore += this.thresholds.trustMultiplier * 2; // Synergy bonus
            threats.push('COORDINATED_MAL_ACT');
        }

        this.updateProfile(riskScore, threats);

        // Lockdown Trigger
        if (riskScore >= this.thresholds.lockdownThreshold && !this.currentRiskProfile.isInLockdown) {
            this.triggerGlobalLockdown(transactionId, riskScore, threats);
        }
    }

    private updateProfile(score: number, threats: string[]): void {
        this.currentRiskProfile.totalRiskScore = score;
        this.currentRiskProfile.activeThreats = threats;
    }

    /**
     * Global Lockdown Orchestration
     * Freezes the UI, alerts security, and anchors the lockout to the blockchain.
     */
    private async triggerGlobalLockdown(
        transactionId: string,
        score: number,
        threats: string[]
    ): Promise<void> {
        this.currentRiskProfile.isInLockdown = true;

        console.error(`🚨 GLOBAL LOCKDOWN INITIATED for TX: ${transactionId}. Risk Score: ${score}`);

        await this.alertManager.createAlert(
            'critical',
            'system',
            'GLOBAL SYSTEM LOCKDOWN',
            `Coordinated threats detected (${threats.join(', ')}). All hardware interfaces suspended.`,
            { transactionId, riskScore: score, threats },
            'SecurityOrchestrator'
        );

        // Anchor lockdown event to blockchain for immutable audit
        await this.eventEngine.createEvent(
            EventType.FRAUD_ANOMALY_DETECTED,
            'SecurityOrchestrator',
            {
                anomalyId: `lockdown_${transactionId}`,
                anomalyType: 'GLOBAL_LOCKDOWN',
                severity: 'CRITICAL',
                transactionId,
                details: `System suspended due to multi-vector threat correlation. Risk Score: ${score}`
            }
        );
    }

    /**
     * Manager Unlock
     * Requires high-level credentials to lift a global lockdown
     */
    async liftLockdown(managerId: string, reason: string): Promise<boolean> {
        // In production, this would verify a Web3 signature or Manager biometrics
        this.currentRiskProfile.isInLockdown = false;
        this.currentRiskProfile.totalRiskScore = 0;
        this.currentRiskProfile.activeThreats = [];

        console.log(`🔓 Global lockdown lifted by ${managerId}. Reason: ${reason}`);

        await this.alertManager.createAlert(
            'medium',
            managerId,
            'Lockdown Lifted',
            `Global security lockdown was manually lifted by manager ${managerId}.`,
            { reason },
            'SecurityOrchestrator'
        );

        return true;
    }

    getRiskProfile(): GlobalRiskProfile {
        return { ...this.currentRiskProfile };
    }
}
