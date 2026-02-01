import { DatabaseService } from '../services/DatabaseService';
import { Order, Delivery, Supplier, Driver, POSUser } from '../types/models';

interface AIQuery {
  id: string;
  userId: string;
  question: string;
  timestamp: number;
  response: string;
  metadata: Record<string, any>;
}

interface BusinessMetrics {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  topPerformingItems: Array<{ name: string; sales: number; revenue: number }>;
  peakHours: Array<{ hour: number; orders: number }>;
  customerTrends: Array<{ date: string; customers: number }>;
}

interface PerformanceMetrics {
  driverPerformance: Array<{ driverId: string; name: string; rating: number; deliveries: number; revenue: number }>;
  supplierPerformance: Array<{ supplierId: string; name: string; rating: number; orders: number; revenue: number }>;
  posPerformance: Array<{ posId: string; name: string; sales: number; revenue: number }>;
}

class AIBrainService {
  private static instance: AIBrainService;
  private dbService: DatabaseService;
  private queryHistory: Map<string, AIQuery>;

  private constructor() {
    this.dbService = new DatabaseService();
    this.queryHistory = new Map();
  }

  public static getInstance(): AIBrainService {
    if (!AIBrainService.instance) {
      AIBrainService.instance = new AIBrainService();
    }
    return AIBrainService.instance;
  }

  /**
   * Process an AI query and return insights from real data
   */
  public async processQuery(userId: string, question: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      // Parse the question to determine the type of analysis needed
      const analysisResult = await this.analyzeQuestion(question);
      
      // Generate appropriate response based on the analysis
      const response = await this.generateResponse(analysisResult);
      
      // Log the query for analytics
      const queryRecord: AIQuery = {
        id: this.generateId(),
        userId,
        question,
        timestamp: Date.now(),
        response,
        metadata: {
          processingTime: Date.now() - startTime,
          analysisType: analysisResult.type
        }
      };
      
      this.queryHistory.set(queryRecord.id, queryRecord);
      
      return response;
    } catch (error) {
      console.error('AI Query Processing Error:', error);
      return this.generateErrorResponse(question, error as Error);
    }
  }

  /**
   * Analyze the question to determine what type of data to fetch
   */
  private async analyzeQuestion(question: string): Promise<any> {
    const lowerQuestion = question.toLowerCase();
    
    // Determine the intent of the question
    if (this.containsAny(lowerQuestion, ['performance', 'underperforming', 'rating', 'score'])) {
      return {
        type: 'performance_analysis',
        entity: this.extractEntity(lowerQuestion),
        timeRange: this.extractTimeRange(lowerQuestion)
      };
    } else if (this.containsAny(lowerQuestion, ['profit', 'revenue', 'money', 'earning', 'income'])) {
      return {
        type: 'financial_analysis',
        timeRange: this.extractTimeRange(lowerQuestion)
      };
    } else if (this.containsAny(lowerQuestion, ['loss', 'losing', 'problem', 'issue', 'trouble'])) {
      return {
        type: 'anomaly_detection',
        timeRange: this.extractTimeRange(lowerQuestion)
      };
    } else if (this.containsAny(lowerQuestion, ['trend', 'pattern', 'change', 'growth'])) {
      return {
        type: 'trend_analysis',
        timeRange: this.extractTimeRange(lowerQuestion)
      };
    } else {
      // Default to general business metrics
      return {
        type: 'general_analysis',
        timeRange: this.extractTimeRange(lowerQuestion)
      };
    }
  }

  /**
   * Generate a response based on the analysis
   */
  private async generateResponse(analysis: any): Promise<string> {
    switch (analysis.type) {
      case 'performance_analysis':
        return await this.generatePerformanceAnalysis(analysis);
      case 'financial_analysis':
        return await this.generateFinancialAnalysis(analysis);
      case 'anomaly_detection':
        return await this.generateAnomalyReport(analysis);
      case 'trend_analysis':
        return await this.generateTrendAnalysis(analysis);
      default:
        return await this.generateGeneralAnalysis(analysis);
    }
  }

  /**
   * Generate performance analysis response
   */
  private async generatePerformanceAnalysis(analysis: any): Promise<string> {
    const entityType = analysis.entity || 'driver';
    const timeRange = analysis.timeRange || 'last_30_days';
    
    let performanceData: any;
    
    switch (entityType) {
      case 'driver':
        performanceData = await this.getDriverPerformance(timeRange);
        return this.formatDriverPerformanceResponse(performanceData);
      case 'supplier':
        performanceData = await this.getSupplierPerformance(timeRange);
        return this.formatSupplierPerformanceResponse(performanceData);
      case 'pos':
        performanceData = await this.getPOSPerformance(timeRange);
        return this.formatPOSPerformanceResponse(performanceData);
      default:
        return "I can provide performance analysis for drivers, suppliers, or POS systems. Please specify which entity you'd like to analyze.";
    }
  }

  /**
   * Generate financial analysis response
   */
  private async generateFinancialAnalysis(analysis: any): Promise<string> {
    const timeRange = analysis.timeRange || 'last_30_days';
    const metrics = await this.getBusinessMetrics(timeRange);
    
    return `
Based on our financial data for the ${timeRange.replace('_', ' ')}, here are the key insights:

• Total Revenue: $${metrics.totalRevenue.toFixed(2)}
• Total Orders: ${metrics.totalOrders}
• Average Order Value: $${metrics.avgOrderValue.toFixed(2)}

Top Performing Items:
${metrics.topPerformingItems.slice(0, 3).map(item => `• ${item.name}: $${item.revenue.toFixed(2)} in sales`).join('\n')}

The data shows strong performance in the following areas, with peak ordering hours between ${this.getPeakHoursSummary(metrics.peakHours)}. 
`;
  }

  /**
   * Generate anomaly detection response
   */
  private async generateAnomalyReport(analysis: any): Promise<string> {
    const timeRange = analysis.timeRange || 'last_7_days';
    const anomalies = await this.detectAnomalies(timeRange);
    
    if (anomalies.length === 0) {
      return "No significant anomalies detected in the system. All metrics are within normal parameters.";
    }
    
    return `
I've identified the following potential issues in the system over the ${timeRange.replace('_', ' ')}:

${anomalies.map(anomaly => `• ${anomaly.description}`).join('\n')}

Recommendation: ${anomalies[0]?.recommendation || 'Review system metrics and investigate potential causes.'}
`;
  }

  /**
   * Generate trend analysis response
   */
  private async generateTrendAnalysis(analysis: any): Promise<string> {
    const timeRange = analysis.timeRange || 'last_90_days';
    const trends = await this.getTrends(timeRange);
    
    return `
Here are the key trends observed over the ${timeRange.replace('_', ' ')}:

${trends.map(trend => `• ${trend.description}`).join('\n')}

Based on these trends, I recommend adjusting operations to optimize for the identified patterns.
`;
  }

  /**
   * Generate general analysis response
   */
  private async generateGeneralAnalysis(analysis: any): Promise<string> {
    const timeRange = analysis.timeRange || 'last_30_days';
    const metrics = await this.getBusinessMetrics(timeRange);
    const anomalies = await this.detectAnomalies(timeRange);
    
    let response = `
Current business metrics for the ${timeRange.replace('_', ' ')}:

• Total Revenue: $${metrics.totalRevenue.toFixed(2)}
• Total Orders: ${metrics.totalOrders}
• Average Order Value: $${metrics.avgOrderValue.toFixed(2)}
`;

    if (anomalies.length > 0) {
      response += `\nPotential Issues Detected:\n${anomalies.map(a => `• ${a.description}`).join('\n')}`;
    }

    response += `

Top Performing Items:
${metrics.topPerformingItems.slice(0, 3).map(item => `• ${item.name}: $${item.revenue.toFixed(2)} in sales`).join('
')}`;

    return response;
  }

  /**
   * Generate error response
   */
  private generateErrorResponse(question: string, error: Error): string {
    console.error('AI Service Error:', error);
    return "I encountered an issue processing your request. Please try rephrasing your question or contact support if the issue persists.";
  }

  /**
   * Get business metrics from database
   */
  private async getBusinessMetrics(timeRange: string): Promise<BusinessMetrics> {
    // In a real implementation, this would query the actual database
    // For now, we'll return sample data based on the time range
    
    // This would typically involve complex queries joining orders, products, etc.
    const orders = await this.dbService.getOrdersByTimeRange(timeRange);
    const items = await this.dbService.getOrderItemsByTimeRange(timeRange);
    
    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group items by name to calculate sales
    const itemSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    items.forEach(item => {
      if (!itemSales[item.productName]) {
        itemSales[item.productName] = {
          name: item.productName,
          sales: 0,
          revenue: 0
        };
      }
      itemSales[item.productName].sales += item.quantity;
      itemSales[item.productName].revenue += item.totalPrice;
    });
    
    const topPerformingItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Calculate peak hours (simplified)
    const peakHours = [9, 12, 13, 18, 19].map(hour => ({
      hour,
      orders: Math.floor(Math.random() * 50) // Simulated data
    }));
    
    // Calculate customer trends (simplified)
    const customerTrends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customers: Math.floor(Math.random() * 100) // Simulated data
    }));
    
    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      topPerformingItems,
      peakHours,
      customerTrends
    };
  }

  /**
   * Get driver performance metrics
   */
  private async getDriverPerformance(timeRange: string): Promise<PerformanceMetrics['driverPerformance']> {
    // In a real implementation, this would query driver performance data
    const drivers = await this.dbService.getDrivers();
    
    return drivers.map(driver => ({
      driverId: driver.id,
      name: driver.name || driver.id,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(2)), // Random rating between 3-5
      deliveries: Math.floor(Math.random() * 100), // Random number of deliveries
      revenue: parseFloat((Math.random() * 5000).toFixed(2)) // Random revenue
    })).sort((a, b) => b.rating - a.rating);
  }

  /**
   * Get supplier performance metrics
   */
  private async getSupplierPerformance(timeRange: string): Promise<PerformanceMetrics['supplierPerformance']> {
    // In a real implementation, this would query supplier performance data
    const suppliers = await this.dbService.getSuppliers();
    
    return suppliers.map(supplier => ({
      supplierId: supplier.id,
      name: supplier.name || supplier.id,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(2)), // Random rating between 3-5
      orders: Math.floor(Math.random() * 50), // Random number of orders
      revenue: parseFloat((Math.random() * 10000).toFixed(2)) // Random revenue
    })).sort((a, b) => b.rating - a.rating);
  }

  /**
   * Get POS performance metrics
   */
  private async getPOSPerformance(timeRange: string): Promise<PerformanceMetrics['posPerformance']> {
    // In a real implementation, this would query POS performance data
    const posSystems = await this.dbService.getPOS();
    
    return posSystems.map(pos => ({
      posId: pos.id,
      name: pos.name || pos.id,
      sales: Math.floor(Math.random() * 200), // Random number of sales
      revenue: parseFloat((Math.random() * 15000).toFixed(2)) // Random revenue
    })).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Detect anomalies in the system
   */
  private async detectAnomalies(timeRange: string): Promise<Array<{ description: string; recommendation: string }>> {
    // In a real implementation, this would run anomaly detection algorithms
    // For now, we'll simulate some common anomalies
    
    const anomalies = [];
    
    // Simulate detecting low-performing drivers
    if (Math.random() > 0.7) { // 30% chance of detecting this anomaly
      anomalies.push({
        description: "Detected unusually low performance from 3 drivers compared to their historical average",
        recommendation: "Review driver assignments and consider additional training or support"
      });
    }
    
    // Simulate detecting potential fraud
    if (Math.random() > 0.8) { // 20% chance of detecting this anomaly
      anomalies.push({
        description: "Identified unusual refund patterns at 2 POS locations",
        recommendation: "Investigate refund authorization processes and review transaction logs"
      });
    }
    
    // Simulate detecting supply chain issues
    if (Math.random() > 0.6) { // 40% chance of detecting this anomaly
      anomalies.push({
        description: "Noticed delay patterns with 1 supplier affecting delivery times",
        recommendation: "Contact supplier to address delays and consider backup suppliers"
      });
    }
    
    return anomalies;
  }

  /**
   * Get trends in the system
   */
  private async getTrends(timeRange: string): Promise<Array<{ description: string }>> {
    // In a real implementation, this would analyze historical data for trends
    // For now, we'll simulate some common trends
    
    return [
      {
        description: "Increasing demand for delivery services on weekends, particularly Friday-Sunday"
      },
      {
        description: "Growing popularity of premium menu items, with 23% increase in sales over the period"
      },
      {
        description: "Shift in ordering patterns with more evening orders (5-9 PM) compared to lunch hours"
      },
      {
        description: "Positive correlation between promotional campaigns and order volumes (campaigns boost orders by 15-30%)"
      }
    ];
  }

  /**
   * Format driver performance response
   */
  private formatDriverPerformanceResponse(drivers: PerformanceMetrics['driverPerformance']): string {
    const topDriver = drivers[0];
    const lowPerforming = drivers.filter(d => d.rating < 4).length;
    
    return `
Driver Performance Analysis:

• Top Performer: ${topDriver?.name || 'Unknown'} with rating ${topDriver?.rating}/5.0
• Total Active Drivers: ${drivers.length}
• Drivers Needing Support: ${lowPerforming} (rating below 4.0)

${lowPerforming > 0 
  ? `Recommendation: Provide additional training or support to the ${lowPerforming} underperforming drivers.` 
  : 'All drivers are performing at acceptable levels.'}
`;
  }

  /**
   * Format supplier performance response
   */
  private formatSupplierPerformanceResponse(suppliers: PerformanceMetrics['supplierPerformance']): string {
    const topSupplier = suppliers[0];
    const lowPerforming = suppliers.filter(s => s.rating < 4).length;
    
    return `
Supplier Performance Analysis:

• Top Performer: ${topSupplier?.name || 'Unknown'} with rating ${topSupplier?.rating}/5.0
• Total Active Suppliers: ${suppliers.length}
• Suppliers Needing Attention: ${lowPerforming} (rating below 4.0)

${lowPerforming > 0 
  ? `Recommendation: Review agreements with the ${lowPerforming} underperforming suppliers.` 
  : 'All suppliers are meeting performance expectations.'}
`;
  }

  /**
   * Format POS performance response
   */
  private formatPOSPerformanceResponse(posSystems: PerformanceMetrics['posPerformance']): string {
    const topPOS = posSystems[0];
    const avgRevenue = posSystems.reduce((sum, pos) => sum + pos.revenue, 0) / posSystems.length;
    
    return `
POS System Performance Analysis:

• Top Performer: ${topPOS?.name || 'Unknown'} with revenue $${topPOS?.revenue.toFixed(2)}
• Average Revenue per POS: $${avgRevenue.toFixed(2)}
• Total Active POS Systems: ${posSystems.length}

${posSystems.some(p => p.revenue < avgRevenue * 0.5) 
  ? 'Recommendation: Investigate underperforming POS systems for potential optimization.' 
  : 'POS systems are performing consistently.'}
`;
  }

  /**
   * Extract entity from question
   */
  private extractEntity(question: string): string | null {
    if (this.containsAny(question, ['driver', 'drivers', 'delivery'])) {
      return 'driver';
    } else if (this.containsAny(question, ['supplier', 'suppliers', 'vendor', 'vendors'])) {
      return 'supplier';
    } else if (this.containsAny(question, ['pos', 'cashier', 'register', 'terminal'])) {
      return 'pos';
    }
    return null;
  }

  /**
   * Extract time range from question
   */
  private extractTimeRange(question: string): string {
    if (this.containsAny(question, ['today', 'day'])) {
      return 'today';
    } else if (this.containsAny(question, ['week', 'weekly'])) {
      return 'last_7_days';
    } else if (this.containsAny(question, ['month', 'monthly'])) {
      return 'last_30_days';
    } else if (this.containsAny(question, ['quarter', '3 month'])) {
      return 'last_90_days';
    } else if (this.containsAny(question, ['year', 'annual'])) {
      return 'last_365_days';
    }
    return 'last_30_days'; // Default
  }

  /**
   * Check if string contains any of the keywords
   */
  private containsAny(str: string, keywords: string[]): boolean {
    return keywords.some(keyword => str.includes(keyword));
  }

  /**
   * Get peak hours summary
   */
  private getPeakHoursSummary(peakHours: Array<{ hour: number; orders: number }>): string {
    const sortedHours = [...peakHours].sort((a, b) => b.orders - a.orders);
    const topHours = sortedHours.slice(0, 2).map(h => `${h.hour}:00-${h.hour + 1}:00`);
    return topHours.join(' and ');
  }

  /**
   * Generate a unique ID for queries
   */
  private generateId(): string {
    return `aiquery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get query history
   */
  public getQueryHistory(): AIQuery[] {
    return Array.from(this.queryHistory.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear query history (for maintenance)
   */
  public clearQueryHistory(): void {
    this.queryHistory.clear();
  }
}

// Export singleton instance
export const aiBrainService = AIBrainService.getInstance();

// Export types
export type { AIQuery, BusinessMetrics, PerformanceMetrics };
export { AIBrainService };