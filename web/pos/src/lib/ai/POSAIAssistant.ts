/**
 * AI Assistant for POS Operations
 * 
 * Provides intelligent assistance for cashiers, managers, and staff
 * with real operational use cases like pricing detection, combo suggestions,
 * stock warnings, and business insights
 */

import { EventEmitter } from 'events';

export interface AIRecommendation {
    id: string;
    type: 'PRICING_ERROR' | 'COMBO_SUGGESTION' | 'STOCK_WARNING' | 'INSIGHT' | 'FRAUD_ALERT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    confidence: number; // 0-100
    action?: string;
    data?: any;
    timestamp: number;
}

export interface DailyInsight {
    date: string;
    peakHours: { hour: number; sales: number }[];
    popularItems: { name: string; count: number; revenue: number }[];
    slowItems: { name: string; count: number }[];
    revenue: number;
    transactionCount: number;
    avgTransactionValue: number;
    trends: string[];
}

export interface FraudPattern {
    patternId: string;
    description: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    frequency: number;
    lastDetected: number;
}

export class POSAIAssistant extends EventEmitter {
    private recommendations: AIRecommendation[] = [];
    private dailyInsights: Map<string, DailyInsight> = new Map();
    private fraudPatterns: FraudPattern[] = [];
    private learningData: any = {};
    private isEnabled: boolean = true;

    constructor() {
        super();
        this.initializeLearningModels();
        this.startPeriodicAnalysis();
    }

    /**
     * Analyze current transaction for pricing errors
     */
    analyzePricing(items: any[], total: number): AIRecommendation | null {
        if (!this.isEnabled) return null;

        // Check for common pricing mistakes
        const recommendations: AIRecommendation[] = [];

        items.forEach((item, index) => {
            // Check if item price seems unusually high/low
            if (item.unitPrice > 1000) {
                recommendations.push({
                    id: `pricing_high_${Date.now()}_${index}`,
                    type: 'PRICING_ERROR',
                    priority: 'HIGH',
                    message: `High price alert: ${item.name} priced at $${item.unitPrice}`,
                    confidence: 85,
                    action: 'VERIFY_PRICE',
                    data: { item, suggestedPrice: this.getSuggestedPrice(item) },
                    timestamp: Date.now()
                });
            }

            // Check for missing modifiers that usually cost extra
            const missingModifiers = this.checkMissingModifiers(item);
            if (missingModifiers.length > 0) {
                recommendations.push({
                    id: `modifiers_missing_${Date.now()}_${index}`,
                    type: 'PRICING_ERROR',
                    priority: 'MEDIUM',
                    message: `Consider suggesting: ${missingModifiers.join(', ')}`,
                    confidence: 70,
                    action: 'SUGGEST_MODIFIERS',
                    data: { item, missingModifiers },
                    timestamp: Date.now()
                });
            }
        });

        // Check for discount opportunities
        const discountOpportunity = this.checkDiscountOpportunities(items, total);
        if (discountOpportunity) {
            recommendations.push(discountOpportunity);
        }

        // Return highest priority recommendation
        if (recommendations.length > 0) {
            const highestPriority = recommendations.reduce((prev, current) => 
                this.getPriorityScore(current.priority) > this.getPriorityScore(prev.priority) ? current : prev
            );
            
            this.addRecommendation(highestPriority);
            return highestPriority;
        }

        return null;
    }

    /**
     * Suggest combo deals based on current items
     */
    suggestCombos(items: any[]): AIRecommendation | null {
        if (!this.isEnabled) return null;

        const itemNames = items.map(item => item.name.toLowerCase());
        const combos = this.findProfitableCombos(itemNames);

        if (combos.length > 0) {
            const bestCombo = combos[0]; // Highest profit combo
            
            const recommendation: AIRecommendation = {
                id: `combo_suggestion_${Date.now()}`,
                type: 'COMBO_SUGGESTION',
                priority: 'MEDIUM',
                message: `Suggest combo deal: ${bestCombo.items.join(' + ')} for $${bestCombo.price} (save $${bestCombo.savings})`,
                confidence: 80,
                action: 'SUGGEST_COMBO',
                data: bestCombo,
                timestamp: Date.now()
            };

            this.addRecommendation(recommendation);
            return recommendation;
        }

        return null;
    }

    /**
     * Check inventory levels and warn about low stock
     */
    checkInventoryLevels(inventory: any[]): AIRecommendation[] {
        if (!this.isEnabled) return [];

        const warnings: AIRecommendation[] = [];
        const lowStockItems = inventory.filter(item => item.quantity <= item.minimumStock || item.quantity <= 5);

        lowStockItems.forEach(item => {
            const priority = item.quantity === 0 ? 'CRITICAL' : item.quantity <= 2 ? 'HIGH' : 'MEDIUM';
            
            const warning: AIRecommendation = {
                id: `stock_warning_${item.id}_${Date.now()}`,
                type: 'STOCK_WARNING',
                priority,
                message: `${item.name}: Only ${item.quantity} left in stock`,
                confidence: 95,
                action: item.quantity === 0 ? 'REORDER_IMMEDIATELY' : 'PLAN_REORDER',
                data: { 
                    item, 
                    daysUntilOutOfStock: this.calculateDaysUntilOutOfStock(item)
                },
                timestamp: Date.now()
            };

            warnings.push(warning);
            this.addRecommendation(warning);
        });

        return warnings;
    }

    /**
     * Generate daily business insights
     */
    generateDailyInsights(transactions: any[], date: string = new Date().toISOString().split('T')[0]): DailyInsight {
        const existingInsight = this.dailyInsights.get(date);
        if (existingInsight) {
            return existingInsight;
        }

        // Analyze transactions for the day
        const insight: DailyInsight = {
            date,
            peakHours: this.analyzePeakHours(transactions),
            popularItems: this.analyzePopularItems(transactions),
            slowItems: this.analyzeSlowItems(transactions),
            revenue: transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0),
            transactionCount: transactions.length,
            avgTransactionValue: transactions.length > 0 
                ? transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0) / transactions.length
                : 0,
            trends: this.identifyTrends(transactions)
        };

        this.dailyInsights.set(date, insight);
        this.emit('daily.insights.generated', insight);

        return insight;
    }

    /**
     * Detect potential fraud patterns
     */
    detectFraudPatterns(transactions: any[]): FraudPattern[] {
        const patterns: FraudPattern[] = [];
        
        // Check for suspicious return patterns
        const returns = transactions.filter(tx => tx.type === 'RETURN');
        if (returns.length > transactions.length * 0.3) { // More than 30% returns
            patterns.push({
                patternId: 'high_return_rate',
                description: 'Unusually high return rate detected',
                riskLevel: 'HIGH',
                frequency: returns.length,
                lastDetected: Date.now()
            });
        }

        // Check for round number transactions (potential testing)
        const roundNumbers = transactions.filter(tx => 
            tx.totalAmount % 10 === 0 || tx.totalAmount % 5 === 0
        );
        if (roundNumbers.length > transactions.length * 0.5) {
            patterns.push({
                patternId: 'round_number_transactions',
                description: 'High percentage of round number transactions',
                riskLevel: 'MEDIUM',
                frequency: roundNumbers.length,
                lastDetected: Date.now()
            });
        }

        // Update fraud patterns
        patterns.forEach(pattern => {
            const existing = this.fraudPatterns.find(p => p.patternId === pattern.patternId);
            if (existing) {
                existing.frequency += pattern.frequency;
                existing.lastDetected = pattern.lastDetected;
            } else {
                this.fraudPatterns.push(pattern);
            }
        });

        if (patterns.length > 0) {
            this.emit('fraud.patterns.detected', patterns);
        }

        return patterns;
    }

    /**
     * Get all active recommendations
     */
    getRecommendations(filter?: {
        type?: AIRecommendation['type'];
        priority?: AIRecommendation['priority'];
        limit?: number;
    }): AIRecommendation[] {
        let recommendations = [...this.recommendations];

        if (filter?.type) {
            recommendations = recommendations.filter(r => r.type === filter.type);
        }

        if (filter?.priority) {
            recommendations = recommendations.filter(r => r.priority === filter.priority);
        }

        // Sort by priority and recency
        recommendations.sort((a, b) => {
            const priorityDiff = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority);
            if (priorityDiff !== 0) return priorityDiff;
            return b.timestamp - a.timestamp;
        });

        if (filter?.limit) {
            recommendations = recommendations.slice(0, filter.limit);
        }

        return recommendations;
    }

    /**
     * Dismiss a recommendation
     */
    dismissRecommendation(recommendationId: string): boolean {
        const index = this.recommendations.findIndex(r => r.id === recommendationId);
        if (index !== -1) {
            const dismissed = this.recommendations.splice(index, 1)[0];
            this.emit('recommendation.dismissed', dismissed);
            return true;
        }
        return false;
    }

    /**
     * Enable/disable AI assistant
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        this.emit('ai.assistant.toggled', { enabled });
    }

    /**
     * Get AI assistant status
     */
    getStatus(): {
        isEnabled: boolean;
        recommendationCount: number;
        activePatterns: number;
        dailyInsightsCount: number;
    } {
        return {
            isEnabled: this.isEnabled,
            recommendationCount: this.recommendations.length,
            activePatterns: this.fraudPatterns.length,
            dailyInsightsCount: this.dailyInsights.size
        };
    }

    // Private helper methods
    private addRecommendation(recommendation: AIRecommendation): void {
        this.recommendations.push(recommendation);
        this.emit('recommendation.generated', recommendation);
        
        // Limit stored recommendations
        if (this.recommendations.length > 100) {
            this.recommendations = this.recommendations.slice(-50);
        }
    }

    private getPriorityScore(priority: AIRecommendation['priority']): number {
        const scores: Record<AIRecommendation['priority'], number> = {
            'CRITICAL': 4,
            'HIGH': 3,
            'MEDIUM': 2,
            'LOW': 1
        };
        return scores[priority] || 0;
    }

    private initializeLearningModels(): void {
        // Initialize with baseline data
        this.learningData = {
            itemPrices: new Map(),
            comboPerformance: new Map(),
            seasonalTrends: new Map()
        };
    }

    private checkMissingModifiers(item: any): string[] {
        const commonModifiers = ['extra cheese', 'guacamole', 'bacon', 'avocado'];
        const itemName = item.name.toLowerCase();
        
        // Simple heuristic - certain items commonly have profitable add-ons
        if (itemName.includes('burger')) {
            return ['extra cheese', 'bacon'];
        } else if (itemName.includes('sandwich')) {
            return ['avocado', 'extra cheese'];
        } else if (itemName.includes('taco') || itemName.includes('burrito')) {
            return ['guacamole', 'extra meat'];
        }
        
        return [];
    }

    private checkDiscountOpportunities(items: any[], total: number): AIRecommendation | null {
        // Check for bulk discounts
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (itemCount >= 5) {
            const discountAmount = total * 0.1; // 10% bulk discount
            return {
                id: `bulk_discount_${Date.now()}`,
                type: 'PRICING_ERROR',
                priority: 'MEDIUM',
                message: `Offer bulk discount: 10% off ($${discountAmount.toFixed(2)} savings)`,
                confidence: 75,
                action: 'APPLY_DISCOUNT',
                data: { discountPercent: 10, discountAmount },
                timestamp: Date.now()
            };
        }
        
        return null;
    }

    private findProfitableCombos(itemNames: string[]): any[] {
        // Simplified combo logic - in reality this would use ML models
        const combos = [
            {
                items: ['burger', 'fries', 'drink'],
                price: 12.99,
                individualPrice: 15.97,
                savings: 2.98
            },
            {
                items: ['sandwich', 'soup'],
                price: 8.99,
                individualPrice: 10.98,
                savings: 1.99
            }
        ];

        return combos.filter(combo => 
            combo.items.every(comboItem => 
                itemNames.some(itemName => itemName.includes(comboItem))
            )
        );
    }

    private getSuggestedPrice(item: any): number {
        // In reality, this would use historical data and market analysis
        const basePrice = item.unitPrice || 10;
        return Math.round(basePrice * 0.9 * 100) / 100; // 10% lower suggestion
    }

    private calculateDaysUntilOutOfStock(item: any): number {
        // Simplified calculation - would use actual sales velocity in production
        const dailySales = item.dailyAverageSales || 1;
        return Math.ceil(item.quantity / dailySales);
    }

    private analyzePeakHours(transactions: any[]): DailyInsight['peakHours'] {
        const hourlySales = new Map<number, { count: number; revenue: number }>();
        
        transactions.forEach(tx => {
            const hour = new Date(tx.createdAt).getHours();
            const current = hourlySales.get(hour) || { count: 0, revenue: 0 };
            hourlySales.set(hour, {
                count: current.count + 1,
                revenue: current.revenue + (tx.totalAmount || 0)
            });
        });

        return Array.from(hourlySales.entries())
            .map(([hour, data]) => ({ hour, sales: data.revenue }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);
    }

    private analyzePopularItems(transactions: any[]): DailyInsight['popularItems'] {
        const itemSales = new Map<string, { count: number; revenue: number; name: string }>();
        
        transactions.forEach(tx => {
            tx.items?.forEach((item: any) => {
                const current = itemSales.get(item.productId) || { 
                    count: 0, 
                    revenue: 0, 
                    name: item.name 
                };
                itemSales.set(item.productId, {
                    count: current.count + item.quantity,
                    revenue: current.revenue + (item.quantity * item.unitPrice),
                    name: item.name
                });
            });
        });

        return Array.from(itemSales.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }

    private analyzeSlowItems(transactions: any[]): DailyInsight['slowItems'] {
        // This would compare against historical averages
        // Simplified implementation
        return [];
    }

    private identifyTrends(transactions: any[]): string[] {
        const trends: string[] = [];
        
        // Check for increasing/decreasing sales
        const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
        const avgTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;
        
        if (avgTransaction > 25) {
            trends.push('Higher than average transaction values');
        }
        
        if (transactions.length > 50) {
            trends.push('Busy day with high volume');
        }

        return trends;
    }

    private startPeriodicAnalysis(): void {
        // Run daily analysis
        setInterval(() => {
            // This would trigger end-of-day analysis
            console.log('🤖 Running daily AI analysis...');
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }
}

// Singleton instance
let posAIAssistant: POSAIAssistant | null = null;

export function getPOSAIAssistant(): POSAIAssistant {
    if (!posAIAssistant) {
        posAIAssistant = new POSAIAssistant();
    }
    return posAIAssistant;
}