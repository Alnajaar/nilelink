/**
 * AI Integration Tests
 * Comprehensive testing suite for AI components across all apps
 */

// Add Jest types
/// <reference types="jest" />

// Import available AI components
import { 
  aiService, 
  AIAnalysisResponse, 
  TransactionData, 
  UserContext 
} from '../services/AIService';
import { useAI } from '../hooks/useAI';

// Mock data for testing
const mockTransactionData: TransactionData = {
  amount: 150.75,
  currency: 'USDC',
  userId: 'user_12345',
  userAgeDays: 45,
  txnHistoryCount: 12,
  ipCountry: 'EG',
  billingCountry: 'EG',
  merchantId: 'merchant_67890',
  items: [
    { id: 'item_1', name: 'Coffee', price: 5.50, quantity: 2 },
    { id: 'item_2', name: 'Sandwich', price: 12.00, quantity: 1 }
  ]
};

const mockUserContext: UserContext = {
  role: 'customer',
  environment: 'online',
  system_state: 'marketplace',
  emotional_signals: ['happy', 'satisfied'],
  urgency_level: 3,
  permission_level: 2
};

describe('AI Integration Tests', () => {
  test('should initialize AI service properly', async () => {
    // Test that the AI service can be accessed
    expect(aiService).toBeDefined();
    expect(typeof aiService.analyzeTransaction).toBe('function');
    expect(typeof aiService.getHealth).toBe('function');
    expect(typeof aiService.getAgents).toBe('function');
  });

  test('should perform transaction analysis', async () => {
    const result: AIAnalysisResponse = await aiService.analyzeTransaction({
      data: mockTransactionData,
      context: mockUserContext
    });

    expect(result.success).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data?.decision).toBeDefined();
      expect(['APPROVE', 'REVIEW', 'REJECT', 'ERROR']).toContain(result.data?.decision);
      expect(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']).toContain(result.data?.risk_level);
    }
  });

  test('should handle fraud prediction', async () => {
    const result: AIAnalysisResponse = await aiService.predictFraud(mockTransactionData);
    
    expect(result.success).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data?.decision).toBeDefined();
    }
  });

  test('should create proper user context', () => {
    const context = aiService.createDefaultContext('vendor', 'pos');
    
    expect(context.role).toBe('vendor');
    expect(context.system_state).toBe('pos');
    expect(context.environment).toBe('online');
    expect(Array.isArray(context.emotional_signals)).toBe(true);
  });

  test('should handle AI hook functionality', () => {
    // Since we can't call the hook outside of a React component,
    // we'll just verify that the function exists
    expect(typeof useAI).toBe('function');
  });

  test('should handle complex transaction with multiple items', async () => {
    const complexTransaction: TransactionData = {
      ...mockTransactionData,
      amount: 500.00,
      items: [
        { id: 'item_1', name: 'Premium Coffee Beans', price: 25.00, quantity: 5 },
        { id: 'item_2', name: 'Specialty Tea', price: 18.50, quantity: 3 },
        { id: 'item_3', name: 'Pastry Assortment', price: 12.00, quantity: 10 }
      ]
    };

    const result: AIAnalysisResponse = await aiService.analyzeTransaction({
      data: complexTransaction,
      context: mockUserContext
    });

    expect(result.success).toBeDefined();
    if (result.success) {
      expect(result.data).toBeDefined();
    }
  });

  test('should handle high-risk transaction', async () => {
    const highRiskTransaction: TransactionData = {
      ...mockTransactionData,
      amount: 2500.00, // High amount
      userAgeDays: 1, // New user
      ipCountry: 'US', // Different country than billing
      billingCountry: 'EG'
    };

    const result: AIAnalysisResponse = await aiService.analyzeTransaction({
      data: highRiskTransaction,
      context: mockUserContext
    });

    expect(result.success).toBeDefined();
  });
});

// Additional tests for AI context and state management
describe('AI Context and State Management', () => {
  test('should handle AI service health checks', async () => {
    const health = await aiService.getHealth();
    
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
    expect(health.service).toBeDefined();
    expect(health.version).toBeDefined();
  });

  test('should handle AI agent retrieval', async () => {
    const agents = await aiService.getAgents();
    
    expect(agents).toBeDefined();
    expect(agents.agents).toBeDefined();
    expect(Array.isArray(agents.agents)).toBe(true);
  });

  test('should handle memory operations', async () => {
    const memory = await aiService.getMemory('customer', 'marketplace');
    
    expect(memory).toBeDefined();
    expect(memory.memory_entries).toBeDefined();
    expect(memory.learning_active).toBeDefined();
    expect(Array.isArray(memory.recent_patterns)).toBe(true);
  });

  test('should handle outcome reporting', async () => {
    const result = await aiService.reportOutcome(
      'test_request_123',
      'SUCCESS',
      { transaction_value: 150.75, fraud_detected: false }
    );
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
});