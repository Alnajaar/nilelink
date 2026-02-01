/**
 * AI-Powered Inventory Intelligence System
 * 
 * Provides predictive analytics, automatic reorder suggestions, dead stock detection,
 * and supplier optimization for comprehensive inventory management
 */

import { EventEmitter } from 'events';

export interface InventoryPrediction {
    productId: string;
    productName: string;
    currentStock: number;
    predictedDemand: number;
    daysUntilStockout: number;
    recommendedOrderQuantity: number;
    confidence: number; // 0-100
    seasonalFactor: number; // multiplier for seasonal adjustments
    trend: 'increasing' | 'decreasing' | 'stable';
}

export interface DeadStockItem {
    productId: string;
    productName: string;
    currentStock: number;
    lastSoldDate: number;
    daysSinceLastSale: number;
    totalValue: number;
    recommendation: 'discount' | 'bundle' | 'discontinue' | 'donate';
}

export interface SupplierRecommendation {
    supplierId: string;
    supplierName: string;
    products: {
        productId: string;
        productName: string;
        price: number;
        leadTime: number; // days
        reliabilityScore: number; // 0-100
    }[];
    totalPrice: number;
    totalLeadTime: number;
    reliabilityScore: number;
    costSavings: number; // compared to current suppliers
}

export interface ReorderSuggestion {
    id: string;
    products: {
        productId: string;
        productName: string;
        currentStock: number;
        minimumStock: number;
        reorderPoint: number;
        suggestedQuantity: number;
        urgency: 'low' | 'medium' | 'high' | 'critical';
    }[];
    totalCost: number;
    supplierOptions: SupplierRecommendation[];
    createdDate: number;
    deadline: number; // when order should be placed by
}

export class AIInventoryIntelligence extends EventEmitter {
    private predictions: Map<string, InventoryPrediction> = new Map();
    private deadStockItems: DeadStockItem[] = [];
    private reorderSuggestions: ReorderSuggestion[] = [];
    private supplierData: Map<string, any> = new Map();
    private salesHistory: Map<string, any[]> = new Map();
    private lastAnalysis: number = 0;

    constructor() {
        super();
        this.initializeModels();
        this.startPeriodicAnalysis();
    }

    /**
     * Analyze current inventory and predict future demand
     */
    async analyzeInventory(inventory: any[]): Promise<InventoryPrediction[]> {
        const predictions: InventoryPrediction[] = [];
        
        for (const item of inventory) {
            const prediction = await this.predictItemDemand(item);
            predictions.push(prediction);
            this.predictions.set(item.id, prediction);
        }

        this.emit('inventory.analyzed', { itemCount: inventory.length, predictionsGenerated: predictions.length });
        return predictions;
    }

    /**
     * Generate automatic reorder suggestions
     */
    async generateReorderSuggestions(
        inventory: any[],
        budget?: number
    ): Promise<ReorderSuggestion[]> {
        // Find items that need reordering
        const itemsNeedingReorder = inventory.filter(item => 
            item.quantity <= item.minimumStock
        );

        if (itemsNeedingReorder.length === 0) {
            return [];
        }

        const suggestions: ReorderSuggestion[] = [];
        
        // Group items by supplier for optimization
        const supplierGroups = this.groupItemsBySupplier(itemsNeedingReorder);
        
        for (const [supplierId, items] of Object.entries(supplierGroups)) {
            const suggestion = await this.createReorderSuggestion(
                items as any[],
                supplierId,
                budget
            );
            
            if (suggestion) {
                suggestions.push(suggestion);
                this.reorderSuggestions.push(suggestion);
            }
        }

        // Emit event for immediate action
        if (suggestions.length > 0) {
            this.emit('reorder.suggestions.generated', {
                suggestionCount: suggestions.length,
                urgentItems: suggestions.flatMap(s => 
                    s.products.filter(p => p.urgency === 'critical' || p.urgency === 'high')
                ).length
            });
        }

        return suggestions;
    }

    /**
     * Detect dead or slow-moving stock
     */
    async detectDeadStock(inventory: any[], salesData: any[]): Promise<DeadStockItem[]> {
        const deadStock: DeadStockItem[] = [];
        const now = Date.now();
        const deadStockThreshold = 30; // days

        for (const item of inventory) {
            const lastSale = this.getLastSaleDate(item.id, salesData);
            const daysSinceLastSale = Math.floor((now - lastSale) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastSale > deadStockThreshold && item.quantity > 0) {
                const deadItem: DeadStockItem = {
                    productId: item.id,
                    productName: item.name,
                    currentStock: item.quantity,
                    lastSoldDate: lastSale,
                    daysSinceLastSale,
                    totalValue: item.quantity * item.unitPrice,
                    recommendation: this.getDeadStockRecommendation(item, daysSinceLastSale)
                };
                
                deadStock.push(deadItem);
            }
        }

        this.deadStockItems = deadStock;
        
        if (deadStock.length > 0) {
            this.emit('dead.stock.detected', {
                itemCount: deadStock.length,
                totalValue: deadStock.reduce((sum, item) => sum + item.totalValue, 0)
            });
        }

        return deadStock;
    }

    /**
     * Get optimal supplier recommendations
     */
    async getSupplierRecommendations(
        products: any[],
        preferences?: {
            maxLeadTime?: number;
            minReliability?: number;
            budget?: number;
        }
    ): Promise<SupplierRecommendation[]> {
        const recommendations: SupplierRecommendation[] = [];
        
        // Get supplier data for requested products
        const availableSuppliers = await this.getAvailableSuppliers(products);
        
        // Score and rank suppliers
        const scoredSuppliers = availableSuppliers.map(supplier => 
            this.scoreSupplier(supplier, products, preferences)
        ).sort((a, b) => b.reliabilityScore - a.reliabilityScore);

        return scoredSuppliers.slice(0, 5); // Top 5 recommendations
    }

    /**
     * Get inventory health score
     */
    getInventoryHealth(inventory: any[]): {
        overallScore: number;
        stockoutRisk: number;
        overstockItems: number;
        deadStockItems: number;
        recommendations: string[];
    } {
        let totalScore = 0;
        let stockoutRiskItems = 0;
        let overstockItems = 0;
        const recommendations: string[] = [];

        for (const item of inventory) {
            const prediction = this.predictions.get(item.id);
            
            // Calculate item health score (0-100)
            let itemScore = 100;
            
            // Penalize for low stock
            if (item.quantity <= item.minimumStock) {
                itemScore -= 40;
                stockoutRiskItems++;
            } else if (item.quantity <= item.minimumStock * 2) {
                itemScore -= 20;
            }
            
            // Penalize for overstock
            const maxReasonableStock = (prediction?.predictedDemand || 0) * 2;
            if (item.quantity > maxReasonableStock) {
                itemScore -= 15;
                overstockItems++;
            }
            
            // Penalize for dead stock
            const isDeadStock = this.deadStockItems.some(ds => ds.productId === item.id);
            if (isDeadStock) {
                itemScore -= 30;
            }
            
            totalScore += itemScore;
        }

        const overallScore = inventory.length > 0 ? Math.round(totalScore / inventory.length) : 100;
        const stockoutRisk = inventory.length > 0 ? Math.round((stockoutRiskItems / inventory.length) * 100) : 0;

        // Generate recommendations based on health issues
        if (stockoutRiskItems > 0) {
            recommendations.push(`Review ${stockoutRiskItems} items at risk of stockout`);
        }
        
        if (overstockItems > 0) {
            recommendations.push(`Optimize ${overstockItems} overstocked items`);
        }
        
        if (this.deadStockItems.length > 0) {
            recommendations.push(`Address ${this.deadStockItems.length} dead stock items`);
        }

        if (overallScore < 70) {
            recommendations.push('Consider implementing automated reorder triggers');
        }

        return {
            overallScore,
            stockoutRisk,
            overstockItems,
            deadStockItems: this.deadStockItems.length,
            recommendations
        };
    }

    /**
     * Get pending reorder suggestions
     */
    getPendingReorders(): ReorderSuggestion[] {
        const now = Date.now();
        return this.reorderSuggestions.filter(suggestion => 
            suggestion.deadline > now && !suggestion.products.every(p => p.urgency === 'low')
        );
    }

    /**
     * Approve and execute reorder suggestion
     */
    async approveReorder(suggestionId: string): Promise<boolean> {
        const suggestion = this.reorderSuggestions.find(s => s.id === suggestionId);
        if (!suggestion) return false;

        try {
            // In a real implementation, this would:
            // 1. Send purchase order to supplier
            // 2. Update inventory system
            // 3. Create procurement records
            // 4. Set delivery expectations
            
            this.emit('reorder.approved', {
                suggestionId,
                productCount: suggestion.products.length,
                totalCost: suggestion.totalCost
            });

            // Remove from pending suggestions
            this.reorderSuggestions = this.reorderSuggestions.filter(s => s.id !== suggestionId);
            
            return true;
        } catch (error) {
            console.error('Failed to approve reorder:', error);
            return false;
        }
    }

    /**
     * Get AI insights and recommendations summary
     */
    getInsights(): {
        predictionsCount: number;
        deadStockCount: number;
        pendingReorders: number;
        healthScore: number;
        nextAnalysis: number;
        recommendations: string[];
    } {
        // This would aggregate insights from all analyses
        return {
            predictionsCount: this.predictions.size,
            deadStockCount: this.deadStockItems.length,
            pendingReorders: this.getPendingReorders().length,
            healthScore: 85, // This should come from getInventoryHealth
            nextAnalysis: this.lastAnalysis + (24 * 60 * 60 * 1000), // 24 hours from last
            recommendations: [
                'Run full inventory analysis',
                'Review supplier performance',
                'Optimize reorder points'
            ]
        };
    }

    // Private helper methods
    private async predictItemDemand(item: any): Promise<InventoryPrediction> {
        // In a real implementation, this would use ML models
        // For now, using simplified heuristics
        
        const historicalData = this.salesHistory.get(item.id) || [];
        const avgDailySales = this.calculateAverageDailySales(historicalData);
        const seasonalFactor = this.calculateSeasonalFactor(item.id);
        const trend = this.calculateTrend(historicalData);
        
        const predictedDemand = Math.round(avgDailySales * seasonalFactor * 7); // Weekly prediction
        const daysUntilStockout = Math.floor(item.quantity / avgDailySales);
        const recommendedOrderQuantity = Math.max(
            predictedDemand - item.quantity,
            item.minimumStock * 2
        );

        return {
            productId: item.id,
            productName: item.name,
            currentStock: item.quantity,
            predictedDemand,
            daysUntilStockout: isNaN(daysUntilStockout) ? 999 : daysUntilStockout,
            recommendedOrderQuantity: Math.max(0, recommendedOrderQuantity),
            confidence: this.calculateConfidence(historicalData.length),
            seasonalFactor,
            trend
        };
    }

    private calculateAverageDailySales(history: any[]): number {
        if (history.length === 0) return 1;
        
        const totalSales = history.reduce((sum, record) => sum + record.quantity, 0);
        const dateRange = this.getDateRange(history);
        
        return dateRange > 0 ? totalSales / dateRange : 1;
    }

    private calculateSeasonalFactor(productId: string): number {
        const month = new Date().getMonth();
        
        // Simple seasonal patterns - would be more sophisticated in production
        const seasonalPatterns: Record<string, number[]> = {
            'winter_items': [1.2, 1.1, 1.0, 0.8, 0.7, 0.6, 0.7, 0.8, 1.0, 1.1, 1.3, 1.4],
            'summer_items': [0.7, 0.8, 1.0, 1.2, 1.4, 1.5, 1.4, 1.3, 1.1, 0.9, 0.8, 0.7]
        };

        // Default to 1.0 if no specific pattern
        return seasonalPatterns[productId]?.[month] || 1.0;
    }

    private calculateTrend(history: any[]): InventoryPrediction['trend'] {
        if (history.length < 2) return 'stable';
        
        // Simple trend calculation - compare first half vs second half
        const midpoint = Math.floor(history.length / 2);
        const firstHalf = history.slice(0, midpoint);
        const secondHalf = history.slice(midpoint);
        
        const firstAvg = firstHalf.reduce((sum, r) => sum + r.quantity, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.quantity, 0) / secondHalf.length;
        
        const change = (secondAvg - firstAvg) / firstAvg;
        
        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    private calculateConfidence(dataPoints: number): number {
        // More data points = higher confidence
        if (dataPoints >= 30) return 90;
        if (dataPoints >= 15) return 75;
        if (dataPoints >= 7) return 60;
        return 40;
    }

    private getDateRange(history: any[]): number {
        if (history.length < 2) return 1;
        
        const dates = history.map(record => new Date(record.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        
        return Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;
    }

    private getLastSaleDate(productId: string, salesData: any[]): number {
        const productSales = salesData.filter(sale => 
            sale.items?.some((item: any) => item.productId === productId)
        );
        
        if (productSales.length === 0) return 0;
        
        const latestSale = productSales.reduce((latest, sale) => 
            sale.createdAt > latest.createdAt ? sale : latest
        );
        
        return new Date(latestSale.createdAt).getTime();
    }

    private getDeadStockRecommendation(item: any, daysSinceLastSale: number): DeadStockItem['recommendation'] {
        if (daysSinceLastSale > 90) {
            return 'discontinue'; // Very old stock
        } else if (daysSinceLastSale > 60) {
            return 'discount'; // Try to move with discount
        } else if (item.category === 'seasonal') {
            return 'bundle'; // Bundle with complementary items
        } else {
            return 'donate'; // Consider donation for goodwill
        }
    }

    private groupItemsBySupplier(items: any[]): Record<string, any[]> {
        // In real implementation, this would use actual supplier data
        const groups: Record<string, any[]> = {
            'primary_supplier': [],
            'backup_supplier': [],
            'specialty_supplier': []
        };

        items.forEach(item => {
            // Simple grouping logic - would be more sophisticated
            if (item.category === 'groceries') {
                groups['primary_supplier'].push(item);
            } else if (item.category === 'specialty') {
                groups['specialty_supplier'].push(item);
            } else {
                groups['backup_supplier'].push(item);
            }
        });

        return groups;
    }

    private async createReorderSuggestion(
        items: any[],
        supplierId: string,
        budget?: number
    ): Promise<ReorderSuggestion | null> {
        const products = items.map(item => {
            const prediction = this.predictions.get(item.id);
            return {
                productId: item.id,
                productName: item.name,
                currentStock: item.quantity,
                minimumStock: item.minimumStock,
                reorderPoint: item.minimumStock * 2,
                suggestedQuantity: prediction?.recommendedOrderQuantity || item.minimumStock * 3,
                urgency: this.calculateUrgency(item, prediction)
            };
        });

        // Calculate total cost
        const totalCost = products.reduce((sum, product) => 
            sum + (product.suggestedQuantity * 10), // Simplified pricing
            0
        );

        // Check budget constraint
        if (budget && totalCost > budget) {
            // Adjust quantities to fit budget
            const adjustmentFactor = budget / totalCost;
            products.forEach(product => {
                product.suggestedQuantity = Math.floor(product.suggestedQuantity * adjustmentFactor);
            });
        }

        const suggestion: ReorderSuggestion = {
            id: `reorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            products,
            totalCost,
            supplierOptions: [], // Would be populated with actual supplier data
            createdDate: Date.now(),
            deadline: Date.now() + (2 * 24 * 60 * 60 * 1000) // 2 days from now
        };

        return suggestion;
    }

    private calculateUrgency(item: any, prediction?: InventoryPrediction): ReorderSuggestion['products'][0]['urgency'] {
        if (item.quantity === 0) return 'critical';
        if (item.quantity <= item.minimumStock) return 'high';
        if (prediction && prediction.daysUntilStockout < 7) return 'medium';
        return 'low';
    }

    private async getAvailableSuppliers(products: any[]): Promise<any[]> {
        // In real implementation, this would query supplier database
        return [
            { id: 'supplier_1', name: 'Primary Distributor', reliability: 95 },
            { id: 'supplier_2', name: 'Backup Supplier', reliability: 85 },
            { id: 'supplier_3', name: 'Specialty Goods', reliability: 90 }
        ];
    }

    private scoreSupplier(supplier: any, products: any[], preferences?: any): SupplierRecommendation {
        // Simplified scoring - would be more complex in production
        const productScores = products.map(product => ({
            productId: product.id,
            productName: product.name,
            price: 10, // Simplified
            leadTime: 3, // days
            reliabilityScore: supplier.reliability
        }));

        const totalCost = productScores.reduce((sum, p) => sum + (p.price * 10), 0); // 10 units per product
        const avgLeadTime = productScores.reduce((sum, p) => sum + p.leadTime, 0) / productScores.length;
        const avgReliability = productScores.reduce((sum, p) => sum + p.reliabilityScore, 0) / productScores.length;

        return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            products: productScores,
            totalPrice: totalCost,
            totalLeadTime: Math.round(avgLeadTime),
            reliabilityScore: Math.round(avgReliability),
            costSavings: 0 // Would compare to current suppliers
        };
    }

    private initializeModels(): void {
        // Initialize ML models and data structures
        console.log('🤖 AI Inventory Intelligence initialized');
    }

    private startPeriodicAnalysis(): void {
        // Run analysis daily
        setInterval(async () => {
            this.lastAnalysis = Date.now();
            this.emit('periodic.analysis.started');
            
            // This would trigger full inventory analysis
            console.log('🤖 Running periodic inventory analysis...');
            
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }
}

// Singleton instance
let aiInventoryIntelligence: AIInventoryIntelligence | null = null;

export function getAIInventoryIntelligence(): AIInventoryIntelligence {
    if (!aiInventoryIntelligence) {
        aiInventoryIntelligence = new AIInventoryIntelligence();
    }
    return aiInventoryIntelligence;
}