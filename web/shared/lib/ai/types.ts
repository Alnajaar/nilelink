// AI Types for NileLink Decentralized AI

export interface TransactionData {
    amount: number;
    currency: string;
    userId: string;
    userAgeDays: number;
    txnHistoryCount: number;
    ipCountry: string;
    billingCountry: string;
    timestamp?: string;
    merchantId?: string;
    items?: any[];
}

export interface UserContext {
    role: string; // customer, vendor, admin, investor
    environment: string; // online/offline/stable/crisis
    system_state: string; // POS/Marketplace/Wallet/Delivery/etc.
    emotional_signals: string[]; // stress, confusion, urgency, etc.
    urgency_level: number; // 1-10 scale
    permission_level: number; // 0-5 scale (Observer to Guardian)
}

export interface FeedbackRequest {
    request_id: string;
    outcome: string; // SUCCESS, FAILURE, DISPUTED
    actual_data: any;
    timestamp?: string;
}

export interface AnalyzeRequest {
    data: TransactionData;
    context: UserContext;
}

export enum AgentRole {
    STRATEGY = "strategy",
    RISK = "risk",
    FINANCE = "finance",
    OPERATIONS = "operations",
    SECURITY = "security",
    UX = "ux",
    INVENTORY = "inventory",
    RESILIENCE = "resilience",
    MARKET = "market",
    COMPLIANCE = "compliance",
    BEHAVIOR = "behavior"
}

export enum PermissionLevel {
    OBSERVER = 0,      // Read-only insights
    ASSISTANT = 1,     // Guidance and recommendations
    OPERATOR = 2,      // Create drafts and prepare actions
    EXECUTOR = 3,      // Execute approved workflows
    STRATEGIST = 4,    // Business restructuring
    GUARDIAN = 5      // System-level overrides
}

export interface ContextData {
    user_role: string;
    environment: string;  // online/offline/stable/crisis
    system_state: string;  // POS/Marketplace/Wallet/etc.
    emotional_signals: string[];
    urgency_level: number;  // 1-10
}

export interface FutureSimulation {
    scenario: string;  // best/most_likely/worst
    risk_exposure: number;
    cost_of_delay: number;
    irreversible_consequences: string[];
    recommendation: string;
}

export interface AgentResponse {
    agent: AgentRole;
    confidence: number;
    insights: string[];
    concerns: string[];
    recommendation: string;
}

export interface DecisionResult {
    decision: string;
    risk_level: string;
    concerns: string[];
    recommendations: string[];
    negotiation_log: string[];
    agent_insights: { [key: string]: any };
    inventory_signal: string;
    context: ContextData;
    future_simulations?: FutureSimulation[];
}

export interface AIPredictionResponse {
    success: boolean;
    request_id?: string;
    timestamp: string;
    environment: string;
    latency_ms: number;
    prediction: {
        primary_result: string;
        confidence_score: number;
        explanation: string;
    };
    model: {
        name: string;
        version: string;
        type: string;
    };
    safety: {
        warnings: string[];
        fallback_applied: boolean;
    };
    data: DecisionResult;
}