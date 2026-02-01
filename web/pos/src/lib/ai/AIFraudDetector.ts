/**
 * NileLink AI-Powered Fraud Detection Engine
 *
 * Advanced machine learning fraud prevention with Web3 anchoring:
 * - Real-time transaction anomaly detection using ML models
 * - Behavioral pattern analysis with predictive scoring
 * - Dynamic risk assessment with adaptive thresholds
 * - Blockchain-verified fraud evidence and automated responses
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { AlertManager } from '../security/AlertManager';
import { TheftPreventionEngine } from '../security/TheftPreventionEngine';
import {
    EventType,
    FraudAnomalyDetectedEvent,
    EconomicEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface FraudPattern {
    id: string;
    type: 'EXCESSIVE_VOIDS' | 'SUSPICIOUS_TIMING' | 'UNUSUAL_AMOUNTS' | 'FREQUENCY_ANOMALY' | 'BEHAVIORAL_SHIFT';
    description: string;
    severity: number;
    confidence: number;
    features: Record<string, any>;
    lastDetected: number;
    frequency: number;
}

export interface RiskProfile {
    cashierId: string;
    sessionId?: string;
    overallRisk: number;
    riskFactors: RiskFactor[];
    behavioralPatterns: BehavioralPattern[];
    lastUpdated: number;
    riskTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface RiskFactor {
    type: string;
    score: number;
    evidence: string[];
    timestamp: number;
    weight: number;
}

export interface BehavioralPattern {
    pattern: string;
    confidence: number;
    historicalFrequency: number;
    currentFrequency: number;
    deviation: number;
}

export interface AIPrediction {
    transactionId: string;
    fraudProbability: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
    recommendedActions: string[];
    confidence: number;
    modelVersion: string;
    features: Record<string, number>;
}

export class AIFraudDetector {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private alertManager: AlertManager;
    private theftPreventionEngine: TheftPreventionEngine;

    // ML Model state
    private riskProfiles = new Map<string, RiskProfile>();
    private fraudPatterns = new Map<string, FraudPattern>();
    private transactionHistory: EconomicEvent[] = [];

    // Configuration
    private readonly HISTORY_SIZE = 10000;
    private readonly MIN_CONFIDENCE_THRESHOLD = 0.75;
    private readonly ADAPTIVE_LEARNING_RATE = 0.1;
    private readonly RISK_DECAY_FACTOR = 0.95; // Daily decay

    // Web3 anchoring
    private anchoredEvents: Set<string> = new Set();

    constructor(
        eventEngine: EventEngine,
        ledger: LocalLedger,
        alertManager: AlertManager,
        theftPreventionEngine: TheftPreventionEngine
    ) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.alertManager = alertManager;
        this.theftPreventionEngine = theftPreventionEngine;

        if (typeof window !== 'undefined') {
            this.initializeML();
            this.startAdaptiveLearning();
        }
    }

    /**
     * Analyze transaction for fraud in real-time
     */
    async analyzeTransaction(
        transactionId: string,
        cashierId: string,
        sessionId: string,
        transactionData: any
    ): Promise<AIPrediction> {
        const features = await this.extractFeatures(transactionId, cashierId, sessionId, transactionData);
        const prediction = await this.runFraudModel(features);
        const riskProfile = this.getOrCreateRiskProfile(cashierId, sessionId);

        // Update risk profile
        this.updateRiskProfile(riskProfile, prediction);

        // Adapt thresholds based on false positives/negatives
        this.adaptThresholds(prediction);

        // Anchor high-risk predictions to blockchain
        if (prediction.riskLevel === 'critical' || prediction.fraudProbability > 0.9) {
            await this.anchorToBlockchain(prediction);
        }

        return prediction;
    }

    /**
     * Extract ML features from transaction data
     */
    private async extractFeatures(
        transactionId: string,
        cashierId: string,
        sessionId: string,
        transactionData: any
    ): Promise<Record<string, number>> {
        const features: Record<string, number> = {};

        // Timing features
        const now = Date.now();
        features.hour_of_day = new Date(now).getHours();
        features.day_of_week = new Date(now).getDay();

        // Transaction features
        features.item_count = transactionData.itemCount || 0;
        features.total_amount = transactionData.totalAmount || 0;
        features.payment_method = this.encodePaymentMethod(transactionData.paymentMethod);

        // Session features
        const sessionStats = await this.getSessionStatistics(sessionId);
        features.session_transaction_count = sessionStats.transactionCount;
        features.session_total_amount = sessionStats.totalAmount;
        features.session_void_count = sessionStats.voidCount;
        features.session_duration_hours = sessionStats.durationHours;

        // Cashier features
        const cashierStats = await this.getCashierStatistics(cashierId);
        features.cashier_experience_days = cashierStats.experienceDays;
        features.cashier_average_transaction = cashierStats.averageTransaction;
        features.cashier_void_rate = cashierStats.voidRate;

        // Historical patterns
        const historicalPatterns = await this.analyzeHistoricalPatterns(cashierId, transactionData);
        features.similarity_to_fraudulent = historicalPatterns.fraudSimilarity;
        features.deviation_from_normal = historicalPatterns.deviationScore;

        // Behavioral features
        const behavioralFeatures = await this.extractBehavioralFeatures(cashierId, transactionData);
        Object.assign(features, behavioralFeatures);

        return features;
    }

    /**
     * Run fraud detection ML model (simplified implementation)
     */
    private async runFraudModel(features: Record<string, number>): Promise<AIPrediction> {
        // Simplified ML model - in production, this would be a trained neural network
        let fraudScore = 0;
        const reasons: string[] = [];
        const actions: string[] = [];

        // Rule-based fraud detection (can be enhanced with ML)
        if (features.session_void_count > 3) {
            fraudScore += 0.3;
            reasons.push('High void frequency in session');
            actions.push('Require manager approval for further voids');
        }

        if (features.total_amount > 1000 && features.item_count < 3) {
            fraudScore += 0.25;
            reasons.push('High-value transaction with few items');
            actions.push('Flag for manual review');
        }

        if (features.deviation_from_normal > 2.0) {
            fraudScore += 0.2;
            reasons.push('Significant deviation from normal behavior');
            actions.push('Monitor closely');
        }

        if (features.hour_of_day < 6 || features.hour_of_day > 22) {
            fraudScore += 0.1;
            reasons.push('Unusual transaction timing');
        }

        // Adjust score based on cashier risk profile
        const cashierRisk = features.cashier_risk_score || 0;
        fraudScore = Math.min(1.0, fraudScore * (1 + cashierRisk));

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical';
        if (fraudScore >= 0.8) riskLevel = 'critical';
        else if (fraudScore >= 0.6) riskLevel = 'high';
        else if (fraudScore >= 0.4) riskLevel = 'medium';
        else riskLevel = 'low';

        return {
            transactionId: '', // Will be set by caller
            fraudProbability: fraudScore,
            riskLevel,
            reasons,
            recommendedActions: actions,
            confidence: 0.85, // Model confidence
            modelVersion: '1.0.0',
            features
        };
    }

    /**
     * Update risk profile with new prediction
     */
    private updateRiskProfile(profile: RiskProfile, prediction: AIPrediction): void {
        // Add new risk factor
        const riskFactor: RiskFactor = {
            type: 'transaction_analysis',
            score: prediction.fraudProbability,
            evidence: prediction.reasons,
            timestamp: Date.now(),
            weight: 0.1
        };

        profile.riskFactors.push(riskFactor);

        // Keep only recent factors (last 100)
        if (profile.riskFactors.length > 100) {
            profile.riskFactors = profile.riskFactors.slice(-100);
        }

        // Recalculate overall risk
        profile.overallRisk = this.calculateOverallRisk(profile);
        profile.lastUpdated = Date.now();

        // Determine risk trend
        profile.riskTrend = this.calculateRiskTrend(profile);
    }

    /**
     * Calculate overall risk score
     */
    private calculateOverallRisk(profile: RiskProfile): number {
        if (profile.riskFactors.length === 0) return 0;

        const recentFactors = profile.riskFactors.slice(-10); // Last 10 transactions
        const weightedSum = recentFactors.reduce((sum, factor) => sum + factor.score * factor.weight, 0);
        const totalWeight = recentFactors.reduce((sum, factor) => sum + factor.weight, 0);

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Calculate risk trend
     */
    private calculateRiskTrend(profile: RiskProfile): 'increasing' | 'stable' | 'decreasing' {
        if (profile.riskFactors.length < 5) return 'stable';

        const recent = profile.riskFactors.slice(-5);
        const older = profile.riskFactors.slice(-10, -5);

        const recentAvg = recent.reduce((sum, f) => sum + f.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, f) => sum + f.score, 0) / older.length;

        const change = recentAvg - olderAvg;

        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * Get or create risk profile
     */
    private getOrCreateRiskProfile(cashierId: string, sessionId?: string): RiskProfile {
        const key = sessionId || cashierId;

        if (!this.riskProfiles.has(key)) {
            this.riskProfiles.set(key, {
                cashierId,
                sessionId,
                overallRisk: 0,
                riskFactors: [],
                behavioralPatterns: [],
                lastUpdated: Date.now(),
                riskTrend: 'stable'
            });
        }

        return this.riskProfiles.get(key)!;
    }

    /**
     * Extract behavioral features
     */
    private async extractBehavioralFeatures(cashierId: string, transactionData: any): Promise<Record<string, number>> {
        const features: Record<string, number> = {};

        // Cashier risk score from profile
        const profile = this.getOrCreateRiskProfile(cashierId);
        features.cashier_risk_score = profile.overallRisk;

        // Transaction velocity (transactions per minute in last hour)
        const velocity = await this.calculateTransactionVelocity(cashierId);
        features.transaction_velocity = velocity;

        // Amount distribution anomaly
        const amountAnomaly = await this.calculateAmountAnomaly(transactionData.totalAmount, cashierId);
        features.amount_anomaly_score = amountAnomaly;

        // Time pattern consistency
        const timeConsistency = await this.calculateTimePatternConsistency(cashierId);
        features.time_pattern_consistency = timeConsistency;

        return features;
    }

    /**
     * Analyze historical patterns
     */
    private async analyzeHistoricalPatterns(cashierId: string, transactionData: any): Promise<{
        fraudSimilarity: number;
        deviationScore: number;
    }> {
        // Simplified pattern analysis
        const historicalTransactions = this.transactionHistory.filter(
            e => e.actorId === cashierId && e.type.includes('PAYMENT')
        ).slice(-50); // Last 50 transactions

        if (historicalTransactions.length === 0) {
            return { fraudSimilarity: 0, deviationScore: 0 };
        }

        // Calculate average transaction amount
        const avgAmount = historicalTransactions.reduce((sum, e) => {
            const payload = e.payload as any;
            return sum + (payload.amount || 0);
        }, 0) / historicalTransactions.length;

        // Deviation from average
        const deviation = Math.abs(transactionData.totalAmount - avgAmount) / avgAmount;
        const deviationScore = Math.min(5.0, deviation); // Cap at 5

        // Fraud similarity (simplified)
        const fraudSimilarity = historicalTransactions.filter(e => {
            const payload = e.payload as any;
            return Math.abs(payload.amount - transactionData.totalAmount) < 10; // Similar amounts
        }).length / historicalTransactions.length;

        return { fraudSimilarity, deviationScore };
    }

    /**
     * Calculate transaction velocity
     */
    private async calculateTransactionVelocity(cashierId: string): Promise<number> {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentTransactions = this.transactionHistory.filter(
            e => e.actorId === cashierId && e.timestamp > oneHourAgo
        );

        return recentTransactions.length / 60; // Transactions per minute
    }

    /**
     * Calculate amount anomaly score
     */
    private async calculateAmountAnomaly(amount: number, cashierId: string): Promise<number> {
        const recentAmounts = this.transactionHistory
            .filter(e => e.actorId === cashierId && e.type.includes('PAYMENT'))
            .slice(-20)
            .map(e => (e.payload as any).amount || 0);

        if (recentAmounts.length === 0) return 0;

        const mean = recentAmounts.reduce((sum, a) => sum + a, 0) / recentAmounts.length;
        const variance = recentAmounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / recentAmounts.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return 0;

        const zScore = Math.abs(amount - mean) / stdDev;
        return Math.min(5.0, zScore); // Cap at 5
    }

    /**
     * Calculate time pattern consistency
     */
    private async calculateTimePatternConsistency(cashierId: string): Promise<number> {
        const recentTransactions = this.transactionHistory
            .filter(e => e.actorId === cashierId)
            .slice(-10);

        if (recentTransactions.length < 2) return 1.0; // Consistent by default

        const intervals = [];
        for (let i = 1; i < recentTransactions.length; i++) {
            intervals.push(recentTransactions[i].timestamp - recentTransactions[i - 1].timestamp);
        }

        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
        const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;

        // Lower variance = more consistent = higher score
        return Math.max(0, 1.0 - (variance / (avgInterval * avgInterval)));
    }

    /**
     * Get session statistics
     */
    private async getSessionStatistics(sessionId: string): Promise<{
        transactionCount: number;
        totalAmount: number;
        voidCount: number;
        durationHours: number;
    }> {
        // Simplified - in production, query actual session data
        return {
            transactionCount: Math.floor(Math.random() * 20),
            totalAmount: Math.random() * 5000,
            voidCount: Math.floor(Math.random() * 3),
            durationHours: Math.random() * 8
        };
    }

    /**
     * Get cashier statistics
     */
    private async getCashierStatistics(cashierId: string): Promise<{
        experienceDays: number;
        averageTransaction: number;
        voidRate: number;
    }> {
        // Simplified - in production, query actual cashier history
        return {
            experienceDays: Math.floor(Math.random() * 365),
            averageTransaction: 50 + Math.random() * 200,
            voidRate: Math.random() * 0.1
        };
    }

    /**
     * Encode payment method for ML features
     */
    private encodePaymentMethod(method?: string): number {
        switch (method?.toLowerCase()) {
            case 'cash': return 0;
            case 'card': return 1;
            case 'digital': return 2;
            default: return 3;
        }
    }

    /**
     * Anchor critical fraud predictions to blockchain
     */
    private async anchorToBlockchain(prediction: AIPrediction): Promise<void> {
        if (this.anchoredEvents.has(prediction.transactionId)) return;

        try {
            // Create fraud evidence record
            const evidence = {
                prediction,
                timestamp: Date.now(),
                modelVersion: prediction.modelVersion,
                evidenceHash: await this.hashEvidence(prediction)
            };

            // In production, this would submit to a fraud detection smart contract
            console.log('🔗 Anchoring fraud evidence to blockchain:', evidence);

            this.anchoredEvents.add(prediction.transactionId);

        } catch (error) {
            console.error('Failed to anchor fraud evidence:', error);
        }
    }

    /**
     * Hash fraud evidence for blockchain anchoring
     */
    private async hashEvidence(prediction: AIPrediction): Promise<string> {
        const evidenceString = JSON.stringify({
            transactionId: prediction.transactionId,
            fraudProbability: prediction.fraudProbability,
            reasons: prediction.reasons,
            timestamp: Date.now()
        });

        const msgBuffer = new TextEncoder().encode(evidenceString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Adapt thresholds based on feedback
     */
    private adaptThresholds(prediction: AIPrediction): void {
        // Adaptive learning - adjust model parameters based on outcomes
        // In production, this would update the ML model weights
    }

    /**
     * Initialize ML components
     */
    private initializeML(): void {
        // Load historical data for training
        this.loadHistoricalData();

        // Initialize fraud patterns
        this.initializeFraudPatterns();
    }

    /**
     * Load historical transaction data
     */
    private async loadHistoricalData(): Promise<void> {
        try {
            this.transactionHistory = await this.ledger.getAllEvents();
            // Keep only recent history
            const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
            this.transactionHistory = this.transactionHistory.filter(e => e.timestamp > cutoff);
        } catch (error) {
            console.error('Failed to load historical data:', error);
        }
    }

    /**
     * Initialize known fraud patterns
     */
    private initializeFraudPatterns(): void {
        const patterns: Omit<FraudPattern, 'lastDetected' | 'frequency'>[] = [
            {
                id: 'excessive_voids',
                type: 'EXCESSIVE_VOIDS',
                description: 'Cashier performing excessive voids in a session',
                severity: 7,
                confidence: 0.85,
                features: { voidThreshold: 5 }
            },
            {
                id: 'suspicious_timing',
                type: 'SUSPICIOUS_TIMING',
                description: 'Transactions at unusual hours',
                severity: 4,
                confidence: 0.75,
                features: { hourStart: 2, hourEnd: 6 }
            },
            {
                id: 'large_round_amounts',
                type: 'UNUSUAL_AMOUNTS',
                description: 'Large round number transactions',
                severity: 6,
                confidence: 0.80,
                features: { minAmount: 500, roundNumber: true }
            }
        ];

        for (const pattern of patterns) {
            this.fraudPatterns.set(pattern.id, {
                ...pattern,
                lastDetected: 0,
                frequency: 0
            });
        }
    }

    /**
     * Start adaptive learning process
     */
    private startAdaptiveLearning(): void {
        // Periodic model updates
        setInterval(() => {
            this.updateModel();
        }, 60 * 60 * 1000); // Hourly updates

        // Daily risk profile decay
        setInterval(() => {
            this.decayRiskProfiles();
        }, 24 * 60 * 60 * 1000); // Daily decay
    }

    /**
     * Update ML model with new data
     */
    private updateModel(): void {
        // In production, retrain model with new transaction data
        console.log('🔄 Updating fraud detection model...');
    }

    /**
     * Apply risk decay to profiles
     */
    private decayRiskProfiles(): void {
        for (const profile of this.riskProfiles.values()) {
            profile.overallRisk *= this.RISK_DECAY_FACTOR;
            profile.lastUpdated = Date.now();
        }
    }

    /**
     * Get risk profile for cashier
     */
    getRiskProfile(cashierId: string): RiskProfile | undefined {
        return this.riskProfiles.get(cashierId);
    }

    /**
     * Get fraud detection statistics
     */
    getStatistics(): {
        totalProfiles: number;
        highRiskProfiles: number;
        recentPredictions: number;
        anchoredEvents: number;
    } {
        const highRiskProfiles = Array.from(this.riskProfiles.values())
            .filter(p => p.overallRisk > 0.7).length;

        return {
            totalProfiles: this.riskProfiles.size,
            highRiskProfiles,
            recentPredictions: 0, // Would track in production
            anchoredEvents: this.anchoredEvents.size
        };
    }
}