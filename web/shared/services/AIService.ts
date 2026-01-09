/**
 * NileLink AI Service Client
 * Provides integration with the AI decision intelligence system
 */

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
  items?: any[]; // Added for supply chain velocity analysis
}

export interface UserContext {
  role: 'customer' | 'vendor' | 'admin' | 'investor';
  environment: 'online' | 'offline' | 'stable' | 'crisis';
  system_state: 'marketplace' | 'pos' | 'wallet' | 'delivery';
  emotional_signals: string[];
  urgency_level: number;
  permission_level: number;
}

export interface AIAnalysisRequest {
  data: TransactionData;
  context: UserContext;
}

export interface AIAnalysisResponse {
  success: boolean;
  request_id: string;
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
  data: {
    decision: 'APPROVE' | 'REVIEW' | 'REJECT' | 'ERROR';
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    concerns: string[];
    recommendations: string[];
    negotiation_log?: string[];
    agent_insights?: Record<string, any>;
    future_simulations?: Array<{
      scenario: string;
      risk_exposure: number;
      cost_of_delay: number;
      irreversible_consequences: string[];
      recommendation: string;
    }>;
  };
  inventory_signal?: 'STABLE' | 'RESTOCK_REQUIRED';
  error?: string;
}

export interface AIMemoryEntry {
  memory_entries: number;
  recent_patterns: Array<{
    timestamp: string;
    context: any;
    data: any;
    result: any;
  }>;
  learning_active: boolean;
}

class AIService {
  private baseUrl: string;

  constructor() {
    // In production, this would come from environment variables
    this.baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Analyze a transaction using AI decision intelligence
   */
  async analyzeTransaction(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error',
      };
    }
  }

  /**
   * Legacy fraud prediction endpoint (backward compatibility)
   */
  async predictFraud(transaction: TransactionData): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI prediction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error',
      };
    }
  }

  /**
   * Report the outcome of an AI-influenced decision back to the AI-service for self-learning
   */
  async reportOutcome(requestId: string, outcome: 'SUCCESS' | 'FAILURE' | 'DISPUTED', details: any = {}): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          outcome,
          actual_data: details,
          timestamp: new Date().toISOString()
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to report AI outcome:', error);
      return false;
    }
  }

  /**
   * Get AI service health status
   */
  async getHealth(): Promise<{ status: string; service: string; version: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI health check failed:', error);
      return {
        status: 'unhealthy',
        service: 'ai-service',
        version: 'unknown',
      };
    }
  }

  /**
   * Get information about active AI agents
   */
  async getAgents(): Promise<{ agents: string[]; description: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`);

      if (!response.ok) {
        throw new Error(`Agents info failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI agents info failed:', error);
      return {
        agents: [],
        description: 'Unable to load AI agents information',
      };
    }
  }

  /**
   * Get AI learning memory for specific context
   */
  async getMemory(
    userRole: string,
    systemState: string
  ): Promise<AIMemoryEntry> {
    try {
      const response = await fetch(
        `${this.baseUrl}/memory/${encodeURIComponent(userRole)}/${encodeURIComponent(systemState)}`
      );

      if (!response.ok) {
        throw new Error(`Memory retrieval failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI memory retrieval failed:', error);
      return {
        memory_entries: 0,
        recent_patterns: [],
        learning_active: false,
      };
    }
  }

  /**
   * Clear AI learning memory for specific context
   */
  async clearMemory(userRole: string, systemState: string): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/memory/clear/${encodeURIComponent(userRole)}/${encodeURIComponent(systemState)}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Memory clear failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI memory clear failed:', error);
      return {
        status: 'error',
        message: 'Failed to clear AI memory',
      };
    }
  }

  /**
   * Create default user context for common scenarios
   */
  createDefaultContext(
    role: UserContext['role'] = 'customer',
    systemState: UserContext['system_state'] = 'marketplace'
  ): UserContext {
    return {
      role,
      environment: 'online',
      system_state: systemState,
      emotional_signals: [],
      urgency_level: 5,
      permission_level: 1,
    };
  }

  /**
   * Format transaction data for AI analysis
   */
  formatTransactionForAI(
    amount: number,
    userId: string,
    additionalData: Partial<TransactionData> = {}
  ): TransactionData {
    return {
      amount,
      currency: 'USD',
      userId,
      userAgeDays: 0,
      txnHistoryCount: 0,
      ipCountry: 'Unknown',
      billingCountry: 'Unknown',
      timestamp: new Date().toISOString(),
      ...additionalData,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;