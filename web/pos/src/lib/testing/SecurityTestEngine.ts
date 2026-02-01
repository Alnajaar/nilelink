/**
 * NileLink Security Test Engine
 * 
 * A specialized utility for Phase 7: Security Testing.
 * Simulates sophisticated theft patterns and coordinated attacks
 * to verify the response of Vision, Fraud, and AI engines.
 */

import { EventEngine } from '../events/EventEngine';
import { EventType, EconomicEvent } from '../events/types';
import { SecurityOrchestrator } from '../security/SecurityOrchestrator';
import { AIFraudDetector } from '../ai/AIFraudDetector';
import { AlertManager } from '../security/AlertManager';

export interface TestScenario {
    id: string;
    name: string;
    description: string;
    threatVector: 'AI_FRAUD' | 'COORDINATED' | 'VISUAL_DISCREPANCY' | 'NETWORK_ISOLATION';
    steps: (() => Promise<void>)[];
}

export class SecurityTestEngine {
    private eventEngine: EventEngine;
    private orchestrator: SecurityOrchestrator;
    private aiDetector: AIFraudDetector;
    private alertManager: AlertManager;

    constructor(
        eventEngine: EventEngine,
        orchestrator: SecurityOrchestrator,
        aiDetector: AIFraudDetector,
        alertManager: AlertManager
    ) {
        this.eventEngine = eventEngine;
        this.orchestrator = orchestrator;
        this.aiDetector = aiDetector;
        this.alertManager = alertManager;
    }

    /**
     * Scenario: The "Sleight of Hand" (Coordinated Attack)
     * Simulates a missed scan and a high-frequency void at the same time.
     */
    async runCoordinatedAttackScenario(): Promise<void> {
        console.log('🧪 Starting Scenario: Coordinated Attack ("Sleight of Hand")');

        const transactionId = `test_tx_${Date.now()}`;
        const cashierId = 'staff_test_001';

        // 1. Emit a Visual Discrepancy (Vision Engine)
        await this.eventEngine.createEvent(
            EventType.CAMERA_TAMPER_DETECTED, // Simulating a vision flag
            'VisionEngine_Mock',
            {
                transactionId,
                details: 'Item placed in bag without barcode scan detected.'
            }
        );

        // 2. Emit a Suspicious Void (Fraud Engine)
        await this.eventEngine.createEvent(
            EventType.ORDER_MODIFIED,
            cashierId,
            {
                transactionId,
                modificationType: 'void_item',
                itemId: 'expensive_item_001',
                reason: 'Customer changed mind'
            }
        );

        // 3. Verify Orchestrator Response
        const riskProfile = this.orchestrator.getRiskProfile();
        console.log(`📊 Resulting Risk Score: ${riskProfile.totalRiskScore}`);

        if (riskProfile.isInLockdown) {
            console.log('✅ SUCCESS: System entered Global Lockdown as expected.');
        } else {
            console.error('❌ FAILURE: System failed to enter lockdown.');
        }
    }

    /**
     * Scenario: AI Behavioral Pattern Detection
     * Simulates a pattern of "Fast Voids" to trigger the ML model.
     */
    async runAIPatternScenario(): Promise<void> {
        console.log('🧪 Starting Scenario: AI Behavioral Anomaly');

        const cashierId = 'staff_ai_001';
        const sessionId = `session_${Date.now()}`;

        // Inject 5 rapid-fire voids to trigger the "SUSPICIOUS_TIMING" and "EXCESSIVE_VOIDS" patterns
        for (let i = 0; i < 5; i++) {
            const prediction = await this.aiDetector.analyzeTransaction(
                `ai_tx_${i}`,
                cashierId,
                sessionId,
                {
                    totalAmount: 100,
                    itemCount: 1,
                    paymentMethod: 'cash'
                }
            );

            console.log(`Step ${i + 1}: AI Probability: ${prediction.fraudProbability.toFixed(2)}`);

            // Artificial delay to simulate real-ish speed that's still "fast"
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const profile = this.aiDetector.getRiskProfile(cashierId);
        console.log(`📊 AI Risk Level: ${profile?.overallRisk.toFixed(2)}`);

        if ((profile?.overallRisk || 0) > 0.5) {
            console.log('✅ SUCCESS: AI Engine elevated risk profile for aberrant behavior.');
        } else {
            console.error('❌ FAILURE: AI Engine remained passive.');
        }
    }

    /**
     * Scenario: Database Hammer (Stress Test)
     * Injects 500 events rapidly to test SQLite encryption/indexing speed.
     */
    async runDatabaseStressTest(): Promise<void> {
        console.log('🧪 Starting Scenario: Database Stress Test');
        const start = performance.now();

        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(this.eventEngine.createEvent(
                EventType.ITEM_ADDED,
                'stress_test',
                { itemId: `item_${i}`, price: Math.random() * 100 }
            ));
        }

        await Promise.all(promises);
        const end = performance.now();
        console.log(`✅ SUCCESS: Processed 100 encrypted events in ${(end - start).toFixed(2)}ms.`);
    }
}
