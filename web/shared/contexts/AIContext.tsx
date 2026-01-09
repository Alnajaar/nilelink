"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  aiService,
  AIAnalysisResponse,
  AIAnalysisRequest,
  TransactionData,
  UserContext,
  AIMemoryEntry
} from '../services/AIService';

export interface AIState {
  isInitialized: boolean;
  serviceHealth: { status: string; service: string; version: string } | null;
  isAnalyzing: boolean;
  activeAnalyses: Map<string, AIAnalysisResponse>;
  analysisHistory: AIAnalysisResponse[];
  error: string | null;
  agents: { agents: string[]; description: string } | null;
  memoryStats: { [key: string]: AIMemoryEntry };
  settings: {
    autoAnalysis: boolean;
    realTimeMonitoring: boolean;
    notificationsEnabled: boolean;
    cacheEnabled: boolean;
  };
}

interface AIContextType {
  ai: AIState;

  // Core AI functions
  analyzeTransaction: (request: AIAnalysisRequest) => Promise<AIAnalysisResponse>;
  predictFraud: (transaction: TransactionData) => Promise<AIAnalysisResponse>;

  // Memory management
  getMemory: (userRole: string, systemState: string) => Promise<AIMemoryEntry>;
  clearMemory: (userRole: string, systemState: string) => Promise<{ status: string; message: string }>;

  // Settings
  updateSettings: (settings: Partial<AIState['settings']>) => void;

  // Utility functions
  formatTransactionForAI: (amount: number, userId: string, additionalData?: Partial<TransactionData>) => TransactionData;
  createDefaultContext: (role?: UserContext['role'], systemState?: UserContext['system_state']) => UserContext;

  // Analysis management
  clearAnalysisHistory: () => void;
  getActiveAnalysis: (id: string) => AIAnalysisResponse | null;
  cancelAnalysis: (id: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [ai, setAI] = useState<AIState>({
    isInitialized: false,
    serviceHealth: null,
    isAnalyzing: false,
    activeAnalyses: new Map(),
    analysisHistory: [],
    error: null,
    agents: null,
    memoryStats: {},
    settings: {
      autoAnalysis: true,
      realTimeMonitoring: false,
      notificationsEnabled: true,
      cacheEnabled: true,
    },
  });

  // Initialize AI service on mount
  useEffect(() => {
    const initializeAI = async () => {
      try {
        // Check service health
        const health = await aiService.getHealth();
        const agents = await aiService.getAgents();

        setAI(prev => ({
          ...prev,
          isInitialized: true,
          serviceHealth: health,
          agents,
        }));

        console.log('AI service initialized:', { health, agents });
      } catch (error) {
        console.error('AI service initialization failed:', error);
        setAI(prev => ({
          ...prev,
          isInitialized: true,
          error: 'AI service unavailable',
          serviceHealth: { status: 'unhealthy', service: 'ai-service', version: 'unknown' },
        }));
      }
    };

    initializeAI();
  }, []);

  // Analyze transaction
  const analyzeTransaction = useCallback(async (
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> => {
    const analysisId = `${request.data.userId}_${Date.now()}`;

    setAI(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const result = await aiService.analyzeTransaction(request);

      setAI(prev => {
        const newActiveAnalyses = new Map(prev.activeAnalyses);
        newActiveAnalyses.set(analysisId, result);

        return {
          ...prev,
          isAnalyzing: false,
          activeAnalyses: newActiveAnalyses,
          analysisHistory: [result, ...prev.analysisHistory.slice(0, 49)], // Keep last 50
        };
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';

      setAI(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Legacy fraud prediction
  const predictFraud = useCallback(async (
    transaction: TransactionData
  ): Promise<AIAnalysisResponse> => {
    return await analyzeTransaction({
      data: transaction,
      context: aiService.createDefaultContext('customer', 'marketplace'),
    });
  }, [analyzeTransaction]);

  // Get AI memory
  const getMemory = useCallback(async (
    userRole: string,
    systemState: string
  ): Promise<AIMemoryEntry> => {
    try {
      const memory = await aiService.getMemory(userRole, systemState);

      setAI(prev => ({
        ...prev,
        memoryStats: {
          ...prev.memoryStats,
          [`${userRole}_${systemState}`]: memory,
        },
      }));

      return memory;
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
    userRole: string,
    systemState: string
  ) => {
    try {
      const result = await aiService.clearMemory(userRole, systemState);

      setAI(prev => {
        const newMemoryStats = { ...prev.memoryStats };
        delete newMemoryStats[`${userRole}_${systemState}`];

        return {
          ...prev,
          memoryStats: newMemoryStats,
        };
      });

      return result;
    } catch (error) {
      console.error('Failed to clear AI memory:', error);
      return { status: 'error', message: 'Failed to clear memory' };
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AIState['settings']>) => {
    setAI(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));

    // Persist settings to localStorage
    try {
      const currentSettings = { ...ai.settings, ...newSettings };
      localStorage.setItem('aiSettings', JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    }
  }, [ai.settings]);

  // Load settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('aiSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setAI(prev => ({
          ...prev,
          settings: { ...prev.settings, ...parsedSettings },
        }));
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  }, []);

  // Utility functions
  const formatTransactionForAI = useCallback((
    amount: number,
    userId: string,
    additionalData?: Partial<TransactionData>
  ): TransactionData => {
    return aiService.formatTransactionForAI(amount, userId, additionalData);
  }, []);

  const createDefaultContext = useCallback((
    role?: UserContext['role'],
    systemState?: UserContext['system_state']
  ): UserContext => {
    return aiService.createDefaultContext(role, systemState);
  }, []);

  // Analysis management
  const clearAnalysisHistory = useCallback(() => {
    setAI(prev => ({
      ...prev,
      analysisHistory: [],
      activeAnalyses: new Map(),
    }));
  }, []);

  const getActiveAnalysis = useCallback((id: string) => {
    return ai.activeAnalyses.get(id) || null;
  }, [ai.activeAnalyses]);

  const cancelAnalysis = useCallback((id: string) => {
    setAI(prev => {
      const newActiveAnalyses = new Map(prev.activeAnalyses);
      newActiveAnalyses.delete(id);
      return {
        ...prev,
        activeAnalyses: newActiveAnalyses,
      };
    });
  }, []);

  return (
    <AIContext.Provider
      value={{
        ai,

        // Core functions
        analyzeTransaction,
        predictFraud,

        // Memory management
        getMemory,
        clearMemory,

        // Settings
        updateSettings,

        // Utilities
        formatTransactionForAI,
        createDefaultContext,

        // Analysis management
        clearAnalysisHistory,
        getActiveAnalysis,
        cancelAnalysis,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within AIProvider');
  }
  return context;
};