/**
 * AI Integration Hooks for NileLink
 * Provides React hooks for AI-powered features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  aiService,
  AIAnalysisResponse,
  AIAnalysisRequest,
  TransactionData,
  UserContext,
  AIMemoryEntry
} from '../services/AIService';

interface UseAIOptions {
  autoAnalyze?: boolean;
  cacheResults?: boolean;
  onAnalysisComplete?: (result: AIAnalysisResponse) => void;
  onError?: (error: string) => void;
}

interface UseAIState {
  isAnalyzing: boolean;
  lastAnalysis: AIAnalysisResponse | null;
  analysisHistory: AIAnalysisResponse[];
  error: string | null;
  serviceHealth: { status: string; service: string; version: string } | null;
}

/**
 * Main AI hook for general AI operations
 */
export function useAI(options: UseAIOptions = {}) {
  const {
    autoAnalyze = false,
    cacheResults = true,
    onAnalysisComplete,
    onError
  } = options;

  const [state, setState] = useState<UseAIState>({
    isAnalyzing: false,
    lastAnalysis: null,
    analysisHistory: [],
    error: null,
    serviceHealth: null,
  });

  const cacheRef = useRef<Map<string, AIAnalysisResponse>>(new Map());

  // Check AI service health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await aiService.getHealth();
        setState(prev => ({ ...prev, serviceHealth: health }));
      } catch (error) {
        console.error('AI service health check failed:', error);
        setState(prev => ({
          ...prev,
          serviceHealth: { status: 'unhealthy', service: 'ai-service', version: 'unknown' }
        }));
      }
    };

    checkHealth();
  }, []);

  // Analyze transaction with AI
  const analyzeTransaction = useCallback(async (
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const result = await aiService.analyzeTransaction(request);

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        lastAnalysis: result,
        analysisHistory: [...prev.analysisHistory.slice(-9), result], // Keep last 10
        error: result.success ? null : result.error || 'Analysis failed',
      }));

      if (result.success && cacheResults) {
        // Simple cache key based on transaction data
        const cacheKey = `${request.data.userId}_${request.data.amount}_${Date.now()}`;
        cacheRef.current.set(cacheKey, result);
      }

      onAnalysisComplete?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
      }));

      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [cacheResults, onAnalysisComplete, onError]);

  // Legacy fraud prediction
  const predictFraud = useCallback(async (
    transaction: TransactionData
  ): Promise<AIAnalysisResponse> => {
    return await analyzeTransaction({
      data: transaction,
      context: aiService.createDefaultContext('customer', 'marketplace'),
    });
  }, [analyzeTransaction]);

  // Get AI agents information
  const getAgents = useCallback(async () => {
    try {
      return await aiService.getAgents();
    } catch (error) {
      console.error('Failed to get AI agents:', error);
      return { agents: [], description: 'Failed to load agents' };
    }
  }, []);

  // Get AI memory for current context
  const getMemory = useCallback(async (
    userRole: string = 'customer',
    systemState: string = 'marketplace'
  ): Promise<AIMemoryEntry> => {
    try {
      return await aiService.getMemory(userRole, systemState);
    } catch (error) {
      console.error('Failed to get AI memory:', error);
      return {
        memory_entries: 0,
        recent_patterns: [],
        learning_active: false,
      };
    }
  }, []);

  // Clear AI memory
  const clearMemory = useCallback(async (
    userRole: string = 'customer',
    systemState: string = 'marketplace'
  ) => {
    try {
      return await aiService.clearMemory(userRole, systemState);
    } catch (error) {
      console.error('Failed to clear AI memory:', error);
      return { status: 'error', message: 'Failed to clear memory' };
    }
  }, []);

  // Get cached result
  const getCachedAnalysis = useCallback((cacheKey: string) => {
    return cacheRef.current.get(cacheKey) || null;
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    lastAnalysis: state.lastAnalysis,
    analysisHistory: state.analysisHistory,
    error: state.error,
    serviceHealth: state.serviceHealth,

    // Actions
    analyzeTransaction,
    predictFraud,
    getAgents,
    getMemory,
    clearMemory,
    getCachedAnalysis,
    clearCache,
  };
}

/**
 * Hook for transaction analysis with automatic context detection
 */
export function useTransactionAnalysis(options: UseAIOptions = {}) {
  const ai = useAI(options);

  const analyzeTransaction = useCallback(async (
    transaction: TransactionData,
    context?: Partial<UserContext>
  ) => {
    const defaultContext = aiService.createDefaultContext();
    const analysisContext: UserContext = {
      ...defaultContext,
      ...context,
    };

    return await ai.analyzeTransaction({
      data: transaction,
      context: analysisContext,
    });
  }, [ai.analyzeTransaction]);

  return {
    ...ai,
    analyzeTransaction,
  };
}

/**
 * Hook for AI confidence indicators
 */
export function useAIConfidence() {
  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-error';
  }, []);

  const getConfidenceLabel = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  }, []);

  const getRiskBadgeVariant = useCallback((riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'neutral';
    }
  }, []);

  return {
    getConfidenceColor,
    getConfidenceLabel,
    getRiskBadgeVariant,
  };
}