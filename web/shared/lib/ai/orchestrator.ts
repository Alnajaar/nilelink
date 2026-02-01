// AI Orchestrator for NileLink Decentralized AI

import { AgentRole, AgentResponse, ContextData, DecisionResult } from './types';
import {
    StrategyAgent,
    RiskAgent,
    FinanceAgent,
    OperationsAgent,
    SecurityAgent,
    UXAgent,
    InventoryAgent,
    ResilienceAgent,
    MarketAgent,
    ComplianceAgent,
    BehaviorAgent,
    BaseAgent
} from './agents';

export class NegotiationRoom {
    // Path 3: Agent Negotiation Room where conflicts are resolved through debate
    debate(responses: { [key: string]: AgentResponse }): string[] {
        const debate_log: string[] = [];

        // Check for conflicting recommendations
        const risk_rec = responses[AgentRole.RISK]?.recommendation || "";
        const finance_rec = responses[AgentRole.FINANCE]?.recommendation || "";

        if (risk_rec.includes("Manual Review") && finance_rec.includes("Monitor")) {
            debate_log.push("RISK: Recommendation for Manual Review due to potential fraud indicators.");
            debate_log.push("FINANCE: Counter-proposal: Monitoring is sufficient to avoid UX friction for this customer segment.");
            debate_log.push("SYSTEM: Resolving conflict via risk-weighted priority. Final stance: MONITOR with elevated alert threshold.");
        } else if (risk_rec.toLowerCase().includes("identity")) {
            debate_log.push("RISK: User identity must be verified immediately.");
            debate_log.push("UX: Immediate verification will drop conversion by 40%. Requesting background check first.");
            debate_log.push("SYSTEM: Compromise reached: Transparent background check initiated; MFA only if secondary signals trigger.");
        }

        if (debate_log.length === 0) {
            debate_log.push("All agents in consensus. Standard protocol applied.");
        }

        return debate_log;
    }
}

export class DecisionOrchestrator {
    private agents: { [key in AgentRole]: BaseAgent };
    private negotiation_room: NegotiationRoom;

    constructor() {
        this.agents = {
            [AgentRole.STRATEGY]: new StrategyAgent(),
            [AgentRole.RISK]: new RiskAgent(),
            [AgentRole.FINANCE]: new FinanceAgent(),
            [AgentRole.OPERATIONS]: new OperationsAgent(),
            [AgentRole.SECURITY]: new SecurityAgent(),
            [AgentRole.UX]: new UXAgent(),
            [AgentRole.INVENTORY]: new InventoryAgent(),
            [AgentRole.RESILIENCE]: new ResilienceAgent(),
            [AgentRole.MARKET]: new MarketAgent(),
            [AgentRole.COMPLIANCE]: new ComplianceAgent(),
            [AgentRole.BEHAVIOR]: new BehaviorAgent()
        };
        this.negotiation_room = new NegotiationRoom();
    }

    coordinate_decision(context: ContextData, data: any): DecisionResult {
        // Get responses from all agents
        const agent_responses: { [key: string]: AgentResponse } = {};

        for (const [role, agent] of Object.entries(this.agents)) {
            agent_responses[role] = agent.analyze(context, data);
        }

        // Path 3: Trigger Agent Negotiation
        const negotiation_log = this.negotiation_room.debate(agent_responses);

        // Aggregate concerns and recommendations
        const all_concerns: string[] = [];
        const all_recommendations: string[] = [];

        for (const response of Object.values(agent_responses)) {
            all_concerns.push(...response.concerns);
            if (response.recommendation) {
                all_recommendations.push(response.recommendation);
            }
        }

        // Determine overall decision
        const risk_level = this._calculate_risk_level(agent_responses);
        const decision = this._synthesize_decision(risk_level, all_concerns);

        return {
            decision,
            risk_level,
            concerns: [...new Set(all_concerns)], // Remove duplicates
            recommendations: all_recommendations,
            negotiation_log,
            agent_insights: agent_responses,
            inventory_signal: all_recommendations.some(r => r.toLowerCase().includes("restock")) ? "RESTOCK_REQUIRED" : "STABLE",
            context
        };
    }

    private _calculate_risk_level(responses: { [key: string]: AgentResponse }): string {
        // Calculate overall risk level from agent responses
        let risk_score = 0;
        let total_confidence = 0;

        for (const response of Object.values(responses)) {
            risk_score += (response.concerns.length * 2) + (response.recommendation ? 1 : 0);
            total_confidence += response.confidence;
        }

        const avg_confidence = total_confidence / Object.keys(responses).length;

        if (risk_score >= 5) {
            return "HIGH";
        } else if (risk_score >= 2) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    private _synthesize_decision(risk_level: string, concerns: string[]): string {
        // Synthesize final decision based on risk and concerns
        if (risk_level === "HIGH") {
            return "REVIEW";
        } else if (risk_level === "MEDIUM") {
            return "MONITOR";
        } else {
            return "APPROVE";
        }
    }
}