// Security Agent Manager - Frontend AI Security Orchestrator
import { DecisionOrchestrator } from './orchestrator';
import { AgentRole, ContextData, DecisionResult, TransactionData } from './types';
import { eventBus, createEvent, EventTypes } from '../EventBus';

export enum SecurityThreatLevel {
    STABLE = 'STABLE',
    ELEVATED = 'ELEVATED',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
    EMERGENCY = 'EMERGENCY'
}

export interface SecurityAnalysisResult extends DecisionResult {
    threat_level: SecurityThreatLevel;
    recommended_action: string;
    is_blocked: boolean;
}

export class SecurityAgentManager {
    private orchestrator: DecisionOrchestrator;
    private currentThreatLevel: SecurityThreatLevel = SecurityThreatLevel.STABLE;

    constructor() {
        this.orchestrator = new DecisionOrchestrator();
    }

    /**
     * Analyze a transaction for potential security risks
     */
    async analyzeTransaction(txn: TransactionData, context: ContextData): Promise<SecurityAnalysisResult> {
        console.log('SecurityAgentManager: Analyzing transaction...', txn.userId);

        // Run multi-agent analysis
        const decisionResult = this.orchestrator.coordinate_decision(context, txn);

        // Map decision result to security threat level
        const threatLevel = this._mapRiskToThreatLevel(decisionResult.risk_level);
        const isBlocked = decisionResult.decision === 'DENY' || (threatLevel === SecurityThreatLevel.CRITICAL && decisionResult.confidence > 0.9);

        const result: SecurityAnalysisResult = {
            ...decisionResult,
            threat_level: threatLevel,
            recommended_action: decisionResult.recommendations[0] || 'Monitor',
            is_blocked: isBlocked
        };

        // Update current threat level
        this.currentThreatLevel = threatLevel;

        // Publish security event
        await eventBus.publish(createEvent(EventTypes.SECURITY_THREAT_DETECTED, {
            threatLevel,
            decision: result.decision,
            concerns: result.concerns,
            txnId: txn.userId, // Using userId as a placeholder for txnId if not available
            isBlocked
        }, {
            source: 'SecurityAgentManager',
            priority: isBlocked ? 'critical' : 'high'
        }));

        return result;
    }

    /**
     * Get current system threat level
     */
    getThreatLevel(): SecurityThreatLevel {
        return this.currentThreatLevel;
    }

    /**
     * Map internal risk levels to security threat levels
     */
    private _mapRiskToThreatLevel(riskLevel: string): SecurityThreatLevel {
        switch (riskLevel) {
            case 'HIGH':
                return SecurityThreatLevel.HIGH;
            case 'MEDIUM':
                return SecurityThreatLevel.ELEVATED;
            case 'LOW':
                return SecurityThreatLevel.STABLE;
            default:
                return SecurityThreatLevel.STABLE;
        }
    }
}

// Export singleton
export const securityAgentManager = new SecurityAgentManager();
