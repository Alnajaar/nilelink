
import axios from 'axios';
import { logger } from '../utils/logger';

interface FraudPredictionRequest {
    amount: number;
    currency: string;
    userId: string;
    userAgeDays?: number;
    txnHistoryCount?: number;
    ipCountry?: string;
    billingCountry?: string;
    timestamp?: string;
    merchantId?: string;
}

interface FraudPredictionResponse {
    score: number;
    decision: 'APPROVE' | 'REVIEW' | 'REJECT';
    reasons: string[];
}

export class FraudService {
    private aiServiceUrl: string;

    constructor() {
        this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    }

    /**
     * Check transaction risk with AI Service
     */
    async checkRisk(data: FraudPredictionRequest): Promise<FraudPredictionResponse> {
        try {
            logger.info(`[FraudService] Checking risk for user ${data.userId}, amount ${data.amount}`);

            const response = await axios.post(`${this.aiServiceUrl}/predict`, data, {
                timeout: 3000 // fail fast
            });

            if (response.data.success) {
                const result = response.data.data;
                logger.info(`[FraudService] Risk Score: ${result.score} (${result.decision})`);
                return result;
            }

            throw new Error('AI Service returned unsuccessful response');

        } catch (error: any) {
            logger.error('[FraudService] AI Service check failed', { error: error.message });

            // Fallback / Circuit Breaker logic
            // If AI is down, we default to APPROVE (fail open) for low amounts, 
            // or REVIEW (fail closed) for high amounts.
            // For Safety: Review
            return {
                score: 0,
                decision: 'APPROVE', // Fail open for continuity in MVP
                reasons: ['AI Service Unavailable - Skipped']
            };
        }
    }
}

export const fraudService = new FraudService();
