import { useState, useCallback, useEffect } from 'react';
import { aiService, AIAnalysisResponse, TransactionData, UserContext } from '../services/AIService';

interface UseIntelligenceOptions {
    autoAnalyze?: boolean;
    pollInterval?: number;
}

export function useIntelligence(options: UseIntelligenceOptions = {}) {
    const [data, setData] = useState<AIAnalysisResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = useCallback(async (txnData: TransactionData, context?: Partial<UserContext>) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const finalContext = aiService.createDefaultContext(context?.role, context?.system_state);
            const result = await aiService.analyzeTransaction({
                data: txnData,
                context: { ...finalContext, ...context }
            });
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const reportOutcome = useCallback(async (requestId: string, outcome: 'SUCCESS' | 'FAILURE' | 'DISPUTED', details: any = {}) => {
        return await aiService.reportOutcome(requestId, outcome, details);
    }, []);

    // Mock data for initial HUD state in dashboard if no analysis has run
    const getPlaceholderData = useCallback((): AIAnalysisResponse => {
        return {
            success: true,
            request_id: 'initial-boot-001',
            timestamp: new Date().toISOString(),
            environment: 'development',
            latency_ms: 0,
            prediction: {
                primary_result: 'STANDBY',
                confidence_score: 1.0,
                explanation: 'Neural Mesh is synchronized and awaiting signal.'
            },
            model: {
                name: 'NeuralMesh-Orchestrator',
                version: '1.2.0',
                type: 'hybrid'
            },
            safety: {
                warnings: [],
                fallback_applied: false
            },
            data: {
                decision: 'APPROVE',
                risk_level: 'LOW',
                concerns: [],
                recommendations: ['Monitor initial patterns'],
                negotiation_log: [
                    'SYSTEM: Protocol initialized.',
                    'STRATEGY: Monitoring market stability.',
                    'RISK: Security perimeter active.'
                ],
                future_simulations: [
                    { scenario: 'best', risk_exposure: 0.05, cost_of_delay: 0, irreversible_consequences: [], recommendation: 'System optimization.' },
                    { scenario: 'most_likely', risk_exposure: 0.1, cost_of_delay: 10, irreversible_consequences: [], recommendation: 'Maintain standard monitoring.' },
                    { scenario: 'worst', risk_exposure: 0.4, cost_of_delay: 50, irreversible_consequences: ['Latency spikes'], recommendation: 'Engage secondary cache.' }
                ]
            }
        };
    }, []);

    return {
        data: data || getPlaceholderData(),
        isAnalyzing,
        error,
        analyze,
        reportOutcome
    };
}
