import axios from 'axios';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { config } from '../config';

class AIService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    }

    /**
     * Analyze a transaction for fraud, risk, or business intelligence
     */
    async analyzeTransaction(data: any, context: any = {}) {
        try {
            const response = await axios.post(`${this.baseUrl}/analyze`, {
                data,
                context: {
                    role: context.role || 'customer',
                    environment: context.environment || 'online',
                    system_state: context.systemState || 'marketplace',
                    emotional_signals: context.emotionalSignals || [],
                    urgency_level: context.urgencyLevel || 5,
                    urgency_level: context.urgencyLevel || 5,
                    permission_level: context.permissionLevel || 1,
                    model_version: config.ai.modelVersion
                }
            }, {
                timeout: config.ai.requestTimeout
            });

            return response.data;
        } catch (error: any) {
            logger.warn('AI Service Unavailable, returning mock data:', error.message);
            // Mock response for development
            return {
                riskScore: 0.1,
                recommendation: 'APPROVE',
                fraudProbability: 0.05,
                mock: true
            };
        }
    }

    /**
     * Report the outcome of an AI-influenced decision back to the AI-service for self-learning
     */
    async reportOutcome(requestId: string, outcome: 'SUCCESS' | 'FAILURE' | 'DISPUTED', details: any = {}) {
        try {
            const response = await axios.post(`${this.baseUrl}/feedback`, {
                request_id: requestId,
                outcome,
                actual_data: details,
                timestamp: new Date().toISOString()
            });

            return response.data;
        } catch (error: any) {
            logger.warn('AI Outcome Reporting Failed:', error.message);
            // This is a non-blocking background task, we just log it
            return null;
        }
    }

    async checkHealth() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return response.data;
        } catch (error: any) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    /**
     * Path 4: Store AI results in the database for durable memory
     */
    async persistMemory(requestId: string, inputData: any, context: any, result: any, inventorySignal?: string) {
        try {
            await prisma.aIMemory.upsert({
                where: { requestId },
                create: {
                    requestId,
                    inputData: JSON.parse(JSON.stringify(inputData)),
                    context: JSON.parse(JSON.stringify(context)),
                    result: JSON.parse(JSON.stringify(result)),
                    inventorySignal,
                    timestamp: new Date()
                },
                update: {
                    result: JSON.parse(JSON.stringify(result)),
                    inventorySignal
                }
            });
        } catch (error: any) {
            logger.error('AI Persistence Error:', error.message);
        }
    }

    /**
     * Path 4: Synchronize neural model weights for reinforcement learning
     */
    async syncWeights(modelName: string, weights: any) {
        try {
            await prisma.aIModelWeight.upsert({
                where: { modelName },
                create: { modelName, weights: JSON.parse(JSON.stringify(weights)) },
                update: { weights: JSON.parse(JSON.stringify(weights)) }
            });
        } catch (error: any) {
            logger.error('AI Weight Sync Error:', error.message);
        }
    }
}

export const aiService = new AIService();
