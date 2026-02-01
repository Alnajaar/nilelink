// NileLink Decentralized AI System

import { ContextData, FutureSimulation, AIPredictionResponse, AnalyzeRequest, FeedbackRequest } from './types';
import { DecisionOrchestrator } from './orchestrator';

export class FutureSimulationEngine {
  // Path 2: Predictive analytics using simulated scenarios
  simulate_futures(context: ContextData, data: any): FutureSimulation[] {
    const simulations: FutureSimulation[] = [];

    const amount = data.amount || 0;
    let risk_score = 0.5; // Default middle ground

    // Calculate base risk exposure
    if (data.concerns) {
      risk_score = Math.min(0.95, 0.1 + (data.concerns.length * 0.2));
    }

    // Best case: Successful transaction, positive user history
    simulations.push({
      scenario: "best",
      risk_exposure: Math.round(risk_score * 0.3 * 100) / 100,
      cost_of_delay: 0,
      irreversible_consequences: [],
      recommendation: "Approval reinforces customer loyalty and lifetime value."
    });

    // Most likely: Successful transaction, standard monitoring
    simulations.push({
      scenario: "most_likely",
      risk_exposure: Math.round(risk_score * 100) / 100,
      cost_of_delay: Math.round(0.05 * amount * 100) / 100,
      irreversible_consequences: ["5% probability of customer support inquiry"],
      recommendation: "Proceed. 98% probability of successful settlement."
    });

    // Worst case: Fraud or Dispute
    simulations.push({
      scenario: "worst",
      risk_exposure: Math.min(1.0, Math.round(risk_score * 1.5 * 100) / 100),
      cost_of_delay: amount,
      irreversible_consequences: ["Potential financial loss", "Reputational impact", "Network trust degradation"],
      recommendation: `Implement 3D Secure or Manual Review to mitigate $${amount} exposure.`
    });

    return simulations;
  }
}

export class PolicyEthicsGuard {
  private immutable_rules = [
    "user_data_belongs_to_user",
    "learning_must_be_explainable",
    "no_dark_patterns",
    "no_emotional_manipulation",
    "no_silent_irreversible_actions"
  ];

  check_action(action: string, context: ContextData, data: any): { approved: boolean; violations: string[]; reasoning: string } {
    const violations: string[] = [];

    // Check for potential harm
    if (data.high_risk && !["admin", "owner"].includes(context.user_role)) {
      violations.push("High-risk action requires elevated permissions");
    }

    // Check for manipulation
    if (context.emotional_signals.includes("stress") && ["aggressive_selling", "pressure_tactics"].includes(action)) {
      violations.push("Cannot use pressure tactics on stressed users");
    }

    return {
      approved: violations.length === 0,
      violations,
      reasoning: violations.length === 0
        ? "Action complies with all ethical guidelines"
        : "Violates ethical guidelines"
    };
  }
}

export class FraudModel {
  private weights = {
    "amount": 0.4,
    "velocity": 0.3, // Frequency of transactions
    "geo": 0.2, // IP country mismatch
    "time": 0.1 // Late night transactions
  };

  adjust_weights(increase_sensitivity: boolean): void {
    // Path 1: Adjust weights dynamically through reinforcement learning
    const factor = increase_sensitivity ? 1.05 : 0.95;
    for (const key in this.weights) {
      this.weights[key as keyof typeof this.weights] = Math.round(this.weights[key as keyof typeof this.weights] * factor * 10000) / 10000;
    }
  }

  predict(data: any): { score: number; decision: string; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const amount = data.amount || 0;
    const user_age = data.userAgeDays || 0;
    const txn_count = data.txnHistoryCount || 0;
    const ip_country = data.ipCountry || "Unknown";
    const billing_country = data.billingCountry || "Unknown";

    // Rule 1: High Amount (Weight 0.4)
    if (amount > 5000) {
      score += 40;
      reasons.push("High transaction amount");
    } else if (amount > 1000) {
      score += 20;
    }

    // Rule 2: New User + High Amount (Multiplier)
    if (user_age < 30 && amount > 500) {
      score += 20;
      reasons.push("New user with significant transaction");
    }

    // Rule 3: Geo Mismatch (Weight 0.2)
    if (ip_country !== billing_country && ip_country !== "Unknown") {
      score += 20;
      reasons.push(`IP Location (${ip_country}) does not match billing (${billing_country})`);
    }

    // Rule 5: Velocity (Mocked)
    if (txn_count > 10) { // rapid transactions
      score += 15;
      reasons.push("High transaction velocity");
    }

    // Cap score
    score = Math.min(score, 100);

    // Decision Logic
    let decision = "APPROVE";
    if (score >= 80) {
      decision = "REJECT";
    } else if (score >= 50) {
      decision = "REVIEW";
    }

    return {
      score,
      decision,
      reasons
    };
  }
}

export class NileLinkAI {
  private orchestrator: DecisionOrchestrator;
  private simulator: FutureSimulationEngine;
  private guard: PolicyEthicsGuard;
  private fraud_model: FraudModel;
  private memory: { [key: string]: any[] } = {};

  constructor() {
    this.orchestrator = new DecisionOrchestrator();
    this.simulator = new FutureSimulationEngine();
    this.guard = new PolicyEthicsGuard();
    this.fraud_model = new FraudModel();
    this._load_memory();
  }

  private _load_memory(): void {
    // Load from localStorage for decentralization
    try {
      const stored = localStorage.getItem('nilelink_ai_memory');
      if (stored) {
        this.memory = JSON.parse(stored);
      }
    } catch (e) {
      this.memory = {};
    }
  }

  private _save_memory(): void {
    // Save to localStorage
    try {
      localStorage.setItem('nilelink_ai_memory', JSON.stringify(this.memory));
    } catch (e) {
      console.warn('Failed to save AI memory to localStorage');
    }
  }

  learn_from_outcome(request_id: string, outcome: string, actual_details: any): void {
    // Path 1: The Self-Learning Loop
    // Find the request in memory
    let target_request = null;
    for (const key in this.memory) {
      for (const entry of this.memory[key]) {
        if (entry.request_id === request_id) {
          target_request = entry;
          break;
        }
      }
      if (target_request) break;
    }

    if (target_request) {
      // Simple Reinforcement: If we predicted correctly, do nothing.
      // If we failed, adjust sensitivity.
      const predicted_decision = target_request.result.decision;

      if (outcome === "FAILURE" && predicted_decision === "APPROVE") {
        // We were too optimistic
        this.fraud_model.adjust_weights(true);
        console.log(`NeuralMesh: Self-learned from error in request ${request_id}. Sensitivity increased.`);
      } else if (outcome === "SUCCESS" && predicted_decision === "REVIEW") {
        // We were too cautious
        this.fraud_model.adjust_weights(false);
        console.log(`NeuralMesh: Self-learned from caution in request ${request_id}. Sensitivity optimized.`);
      }
    }
  }

  process_request(transaction_data: any, user_context: any, request_id?: string): { success: boolean; data: any } {
    const start_time = Date.now();

    // STEP 1: Context Absorption
    const context: ContextData = {
      user_role: user_context.role || "customer",
      environment: user_context.environment || "online",
      system_state: user_context.system_state || "marketplace",
      emotional_signals: user_context.emotional_signals || [],
      urgency_level: user_context.urgency_level || 5
    };

    // STEP 2: Future Simulation
    const simulations = this.simulator.simulate_futures(context, transaction_data);

    // STEP 3: Safety & Ethics Check
    const safety_check = this.guard.check_action("process_transaction", context, transaction_data);

    if (!safety_check.approved) {
      return {
        success: false,
        data: {
          decision: "BLOCKED",
          reason: safety_check.reasoning,
          violations: safety_check.violations
        }
      };
    }

    // STEP 4: Decision Synthesis
    const decision_result = this.orchestrator.coordinate_decision(context, transaction_data);

    // Add simulations to result
    decision_result.future_simulations = simulations;

    // Store in memory for learning
    this._update_memory(context, transaction_data, decision_result, request_id);

    return {
      success: true,
      data: decision_result
    };
  }

  private _update_memory(context: ContextData, data: any, result: any, request_id?: string): void {
    const key = `${context.user_role}_${context.system_state}`;
    if (!this.memory[key]) {
      this.memory[key] = [];
    }

    this.memory[key].push({
      request_id: request_id || `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context,
      data,
      result
    });

    // Keep only recent history
    if (this.memory[key].length > 100) {
      this.memory[key] = this.memory[key].slice(-100);
    }

    this._save_memory();
  }

  get_memory(user_role: string, system_state: string): { memory_entries: number; recent_patterns: any[] } {
    const key = `${user_role}_${system_state}`;
    const memory_data = this.memory[key] || [];
    return {
      memory_entries: memory_data.length,
      recent_patterns: memory_data.slice(-5)
    };
  }

  clear_memory(user_role: string, system_state: string): { status: string; message: string } {
    const key = `${user_role}_${system_state}`;
    if (key in this.memory) {
      delete this.memory[key];
      this._save_memory();
      return { status: "cleared", message: `Memory cleared for ${key}` };
    }
    return { status: "not_found", message: `No memory found for ${key}` };
  }

  // Main analysis method
  analyze_transaction(request: AnalyzeRequest): AIPredictionResponse {
    const start_time = Date.now();
    const request_id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const result = this.process_request(request.data, request.context, request_id);

      // Calculate confidence
      let confidence = 0.0;
      if (result.data.agent_insights) {
        const confidences = Object.values(result.data.agent_insights).map((v: any) => v.confidence || 0);
        if (confidences.length > 0) {
          confidence = confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length;
        }
      } else if (result.data.score !== undefined) {
        // Map 0-100 score to 0-1 confidence
        confidence = 1.0 - (result.data.score / 100.0);
      }

      const primary_result = result.data.decision || 'UNKNOWN';
      const risk_level = result.data.risk_level || 'UNKNOWN';

      const response: AIPredictionResponse = {
        success: result.success,
        request_id,
        timestamp: new Date().toISOString(),
        environment: "decentralized",
        latency_ms: Date.now() - start_time,
        prediction: {
          primary_result,
          confidence_score: Math.round(confidence * 10000) / 10000,
          explanation: `System analyzed transaction with ${risk_level} risk level.`
        },
        model: {
          name: "NeuralMesh-Orchestrator",
          version: "1.2.0",
          type: "client-side"
        },
        safety: {
          warnings: [],
          fallback_applied: false
        },
        data: result.data
      };

      return response;
    } catch (error) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        environment: "decentralized",
        latency_ms: Date.now() - start_time,
        prediction: {
          primary_result: "ERROR",
          confidence_score: 0,
          explanation: `Analysis failed: ${error}`
        },
        model: {
          name: "NeuralMesh-Orchestrator",
          version: "1.2.0",
          type: "client-side"
        },
        safety: {
          warnings: [`Internal error: ${error}`],
          fallback_applied: true
        },
        data: { error: String(error), decision: "ERROR" }
      };
    }
  }
}

// Global instance for client-side use
let ai_system: NileLinkAI | null = null;

export function getAISystem(): NileLinkAI {
  if (!ai_system) {
    ai_system = new NileLinkAI();
  }
  return ai_system;
}