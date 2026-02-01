import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { AIBusinessIntelligenceABI } from '@/lib/abis/AIBusinessIntelligence';
import { AISecurityOrchestratorABI } from '@/lib/abis/AISecurityOrchestrator';

interface AIRecommendation {
  type: 'restock' | 'pricing' | 'combo' | 'alert';
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    handler: () => void;
  };
}

interface ProductInsight {
  productId: string;
  predictedSales: number;
  confidence: number;
  restockRecommendation: {
    quantity: number;
    urgency: number;
    reasoning: string;
  };
  performanceScore: number;
}

export function useAIAssistance() {
  const { address } = useAccount();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI BI Contract interactions
  const { data: stockPrediction } = useReadContract({
    address: process.env.NEXT_PUBLIC_AI_BI_ADDRESS as `0x${string}`,
    abi: AIBusinessIntelligenceABI,
    functionName: 'predictStockNeeds',
    args: [1, 7], // productId, daysAhead
  });

  const { data: restockRecs } = useReadContract({
    address: process.env.NEXT_PUBLIC_AI_BI_ADDRESS as `0x${string}`,
    abi: AIBusinessIntelligenceABI,
    functionName: 'getRestockRecommendations',
    args: [1], // productId
  });

  const { data: salesInsights } = useReadContract({
    address: process.env.NEXT_PUBLIC_AI_BI_ADDRESS as `0x${string}`,
    abi: AIBusinessIntelligenceABI,
    functionName: 'getSalesInsights',
    args: [1], // productId
  });

  // Security monitoring
  const { data: riskProfile } = useReadContract({
    address: process.env.NEXT_PUBLIC_AI_SECURITY_ADDRESS as `0x${string}`,
    abi: AISecurityOrchestratorABI,
    functionName: 'getRiskProfile',
    args: [address],
  });

  /**
   * Analyze current transaction for AI insights
   */
  const analyzeTransaction = useCallback(async (
    items: Array<{ productId: string; quantity: number; price: number }>,
    customerAddress?: string
  ) => {
    setIsAnalyzing(true);

    try {
      const newRecommendations: AIRecommendation[] = [];

      // Analyze each item for restock needs
      for (const item of items) {
        const insights = await getProductInsights(item.productId);

        // Restock alerts
        if (insights.restockRecommendation.urgency >= 7) {
          newRecommendations.push({
            type: 'restock',
            message: `Low stock alert: ${insights.restockRecommendation.reasoning}`,
            urgency: insights.restockRecommendation.urgency >= 9 ? 'critical' : 'high',
            action: {
              label: 'Order Now',
              handler: () => handleRestockOrder(item.productId, insights.restockRecommendation.quantity)
            }
          });
        }

        // Combo suggestions
        const comboSuggestion = await generateComboSuggestion(items, item.productId);
        if (comboSuggestion) {
          newRecommendations.push({
            type: 'combo',
            message: comboSuggestion,
            urgency: 'low',
            action: {
              label: 'Add to Order',
              handler: () => addComboToOrder(comboSuggestion)
            }
          });
        }
      }

      // Customer risk analysis
      if (customerAddress && riskProfile) {
        const [riskScore, suspiciousTransactions] = riskProfile as [bigint, bigint];

        if (Number(riskScore) > 500) {
          newRecommendations.push({
            type: 'alert',
            message: `High-risk customer detected. Risk score: ${riskScore}`,
            urgency: Number(riskScore) > 700 ? 'critical' : 'high'
          });
        }
      }

      // Pricing optimization
      const pricingRec = await analyzePricingOptimization(items);
      if (pricingRec) {
        newRecommendations.push({
          type: 'pricing',
          message: pricingRec,
          urgency: 'medium'
        });
      }

      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [address, riskProfile]);

  /**
   * Get detailed product insights from AI BI
   */
  const getProductInsights = async (productId: string): Promise<ProductInsight> => {
    try {
      // This would call the AI BI contract
      const [predictedStock, confidence] = stockPrediction || [0n, 0n];
      const restockRec = restockRecs || {
        productId: 0n,
        recommendedQuantity: 0n,
        urgency: 0n,
        estimatedCost: 0n,
        expectedProfit: 0n,
        reasoning: ''
      };
      const insights = salesInsights || [0n, 0n, 0n, 0n, 0n];

      return {
        productId,
        predictedSales: Number(predictedStock),
        confidence: Number(confidence),
        restockRecommendation: {
          quantity: Number(restockRec.recommendedQuantity),
          urgency: Number(restockRec.urgency),
          reasoning: restockRec.reasoning as string
        },
        performanceScore: Number(insights[4])
      };
    } catch (error) {
      console.error('Failed to get product insights:', error);
      return {
        productId,
        predictedSales: 0,
        confidence: 0,
        restockRecommendation: { quantity: 0, urgency: 0, reasoning: '' },
        performanceScore: 0
      };
    }
  };

  /**
   * Generate combo suggestions based on purchase patterns
   */
  const generateComboSuggestion = async (
    currentItems: Array<{ productId: string; quantity: number; price: number }>,
    currentProductId: string
  ): Promise<string | null> => {
    // Simplified AI logic for combo suggestions
    const productCombos: Record<string, string[]> = {
      'coffee': ['croissant', 'muffin'],
      'burger': ['fries', 'soda'],
      'pizza': ['garlic_bread', 'soda']
    };

    const currentProduct = currentProductId.toLowerCase();
    const suggestions = productCombos[currentProduct];

    if (suggestions) {
      const missingItems = suggestions.filter(suggestion =>
        !currentItems.some(item => item.productId.toLowerCase().includes(suggestion))
      );

      if (missingItems.length > 0) {
        return `Consider adding ${missingItems[0]} to complete this combo for 15% discount!`;
      }
    }

    return null;
  };

  /**
   * Analyze pricing optimization opportunities
   */
  const analyzePricingOptimization = async (
    items: Array<{ productId: string; quantity: number; price: number }>
  ): Promise<string | null> => {
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Volume discount suggestion
    if (totalValue > 50 && items.length >= 3) {
      return 'Volume discount available: 10% off for orders over $50 with 3+ items';
    }

    // Loyalty program suggestion
    if (totalValue > 25) {
      return 'Suggest loyalty program enrollment for future discounts';
    }

    return null;
  };

  /**
   * Handle restock order (placeholder for actual implementation)
   */
  const handleRestockOrder = (productId: string, quantity: number) => {
    console.log(`Ordering ${quantity} units of product ${productId}`);
    // This would integrate with supplier ordering system
  };

  /**
   * Add combo to order (placeholder)
   */
  const addComboToOrder = (comboSuggestion: string) => {
    console.log('Adding combo to order:', comboSuggestion);
    // This would update the current order
  };

  /**
   * Get cashier assistance for error prevention
   */
  const getCashierAssistance = (currentAction: string, context: any) => {
    const assistance: AIRecommendation[] = [];

    // Common error prevention
    if (currentAction === 'payment' && context.amount > 1000) {
      assistance.push({
        type: 'alert',
        message: 'Large transaction detected. Please verify customer identity.',
        urgency: 'high'
      });
    }

    if (currentAction === 'discount' && context.discountPercent > 20) {
      assistance.push({
        type: 'alert',
        message: 'High discount applied. Manager approval may be required.',
        urgency: 'medium'
      });
    }

    return assistance;
  };

  /**
   * Get manager insights
   */
  const getManagerInsights = () => {
    // This would aggregate data from AI BI contract
    return {
      topSellingProducts: [],
      lowStockAlerts: [],
      salesPredictions: [],
      performanceMetrics: {}
    };
  };

  return {
    recommendations,
    isAnalyzing,
    analyzeTransaction,
    getProductInsights,
    getCashierAssistance,
    getManagerInsights,
    clearRecommendations: () => setRecommendations([])
  };
}
