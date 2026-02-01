// Pricing Engine
// Advanced pricing system with dynamic pricing, promotions, regional pricing, and AI-assisted price optimization

import { eventBus, createEvent } from './EventBus';

export enum PricingStrategy {
  FIXED = 'fixed',           // Standard fixed price
  DYNAMIC = 'dynamic',        // Price changes based on conditions
  COST_PLUS = 'cost_plus',    // Cost plus markup
  COMPETITIVE = 'competitive', // Match competitor pricing
  PSYCHOLOGICAL = 'psychological', // Psychological pricing (9.99 vs 10.00)
  TIME_BASED = 'time_based',   // Different prices at different times
  VOLUME_BASED = 'volume_based', // Quantity discounts
  LOYALTY_BASED = 'loyalty_based' // Loyalty program pricing
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  BUY_X_GET_Y = 'buy_x_get_y',
  BUNDLE = 'bundle',
  COUPON = 'coupon',
  LOYALTY_POINTS = 'loyalty_points',
  EMPLOYEE = 'employee',
  SENIOR = 'senior',
  STUDENT = 'student'
}

export enum PromotionType {
  FLASH_SALE = 'flash_sale',
  CLEARANCE = 'clearance',
  SEASONAL = 'seasonal',
  BUNDLE_DEAL = 'bundle_deal',
  LOYALTY_REWARD = 'loyalty_reward',
  FIRST_TIME_CUSTOMER = 'first_time_customer',
  REFERRAL = 'referral'
}

export interface PriceRule {
  id: string;
  name: string;
  description: string;
  strategy: PricingStrategy;
  conditions: PriceCondition[];
  adjustments: PriceAdjustment[];
  priority: number;
  active: boolean;
  startDate?: number;
  endDate?: number;
  productIds?: string[];
  categoryIds?: string[];
  customerSegments?: string[];
  regions?: string[];
  metadata: Record<string, any>;
}

export interface PriceCondition {
  type: 'time' | 'quantity' | 'customer' | 'location' | 'inventory' | 'competition';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'contains';
  value: any;
  metadata?: Record<string, any>;
}

export interface PriceAdjustment {
  type: 'multiply' | 'add' | 'subtract' | 'set' | 'discount';
  value: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  description: string;
  rules: PromotionRule[];
  rewards: PromotionReward[];
  active: boolean;
  startDate: number;
  endDate: number;
  usageLimit?: number;
  usageCount: number;
  priority: number;
  productIds?: string[];
  categoryIds?: string[];
  customerSegments?: string[];
  regions?: string[];
  metadata: Record<string, any>;
}

export interface PromotionRule {
  type: 'minimum_purchase' | 'minimum_quantity' | 'specific_products' | 'customer_type' | 'time_window';
  value: any;
  metadata?: Record<string, any>;
}

export interface PromotionReward {
  type: 'percentage_discount' | 'fixed_discount' | 'free_item' | 'loyalty_points' | 'free_shipping';
  value: any;
  description: string;
  metadata?: Record<string, any>;
}

export interface PricingContext {
  productId: string;
  variantId?: string;
  customerId?: string;
  customerSegment?: string;
  quantity: number;
  location: {
    country: string;
    region: string;
    city: string;
    storeId: string;
  };
  timestamp: number;
  loyaltyPoints?: number;
  purchaseHistory?: any[];
  currentCart?: any[];
  metadata?: Record<string, any>;
}

export interface PricingResult {
  originalPrice: number;
  finalPrice: number;
  discounts: AppliedDiscount[];
  promotions: AppliedPromotion[];
  taxes: TaxCalculation[];
  breakdown: PriceBreakdown;
  metadata: Record<string, any>;
}

export interface AppliedDiscount {
  id: string;
  name: string;
  type: DiscountType;
  amount: number;
  percentage?: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  type: PromotionType;
  savings: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface TaxCalculation {
  jurisdiction: string;
  rate: number;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface PriceBreakdown {
  subtotal: number;
  discounts: number;
  promotions: number;
  taxes: number;
  total: number;
}

class PricingEngine {
  private priceRules: Map<string, PriceRule> = new Map();
  private promotions: Map<string, Promotion> = new Map();
  private taxRules: Map<string, any> = new Map(); // Will be expanded in TaxEngine
  private regionalPricing: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for product updates
    eventBus.subscribe('PRODUCT_UPDATED', (event) => {
      // Update pricing rules if needed
      this.updatePricingForProduct(event.payload.product);
    });

    // Listen for promotion events
    eventBus.subscribe('PROMOTION_CREATED', (event) => {
      this.promotions.set(event.payload.promotion.id, event.payload.promotion);
    });

    eventBus.subscribe('PROMOTION_UPDATED', (event) => {
      this.promotions.set(event.payload.promotion.id, event.payload.promotion);
    });

    eventBus.subscribe('PROMOTION_DELETED', (event) => {
      this.promotions.delete(event.payload.promotionId);
    });
  }

  /**
   * Create a new price rule
   */
  async createPriceRule(rule: Omit<PriceRule, 'id'>): Promise<PriceRule> {
    const priceRule: PriceRule = {
      id: `price_rule_${Date.now()}_${Math.random()}`,
      ...rule
    };

    this.priceRules.set(priceRule.id, priceRule);

    await eventBus.publish(createEvent('PRICE_RULE_CREATED', {
      rule: priceRule
    }, {
      source: 'PricingEngine'
    }));

    return priceRule;
  }

  /**
   * Calculate price for a product in given context
   */
  async calculatePrice(
    basePrice: number,
    context: PricingContext
  ): Promise<PricingResult> {
    const appliedDiscounts: AppliedDiscount[] = [];
    const appliedPromotions: AppliedPromotion[] = [];
    let currentPrice = basePrice;

    // Apply pricing rules
    for (const rule of this.priceRules.values()) {
      if (!rule.active) continue;
      if (!this.ruleMatchesContext(rule, context)) continue;

      currentPrice = this.applyPriceAdjustments(currentPrice, rule.adjustments);

      // Track applied discounts
      for (const adjustment of rule.adjustments) {
        if (adjustment.type === 'discount' || adjustment.type === 'multiply') {
          appliedDiscounts.push({
            id: rule.id,
            name: rule.name,
            type: this.mapAdjustmentToDiscountType(adjustment.type),
            amount: basePrice - currentPrice,
            description: adjustment.description
          });
        }
      }
    }

    // Apply promotions
    const promotionSavings = await this.applyPromotions(currentPrice, context, appliedPromotions);
    currentPrice -= promotionSavings;

    // Calculate taxes (placeholder - will be handled by TaxEngine)
    const taxes = await this.calculateTaxes(currentPrice, context);

    // Calculate final breakdown
    const subtotal = currentPrice;
    const totalDiscounts = appliedDiscounts.reduce((sum, d) => sum + d.amount, 0);
    const totalPromotions = appliedPromotions.reduce((sum, p) => sum + p.savings, 0);
    const totalTaxes = taxes.reduce((sum, t) => sum + t.amount, 0);

    const result: PricingResult = {
      originalPrice: basePrice,
      finalPrice: subtotal + totalTaxes,
      discounts: appliedDiscounts,
      promotions: appliedPromotions,
      taxes,
      breakdown: {
        subtotal,
        discounts: totalDiscounts,
        promotions: totalPromotions,
        taxes: totalTaxes,
        total: subtotal + totalTaxes
      },
      metadata: {
        rulesApplied: appliedDiscounts.length,
        promotionsApplied: appliedPromotions.length,
        taxesApplied: taxes.length
      }
    };

    return result;
  }

  /**
   * Create a new promotion
   */
  async createPromotion(promotion: Omit<Promotion, 'id' | 'usageCount'>): Promise<Promotion> {
    const newPromotion: Promotion = {
      id: `promotion_${Date.now()}_${Math.random()}`,
      usageCount: 0,
      ...promotion
    };

    this.promotions.set(newPromotion.id, newPromotion);

    await eventBus.publish(createEvent('PROMOTION_CREATED', {
      promotion: newPromotion
    }, {
      source: 'PricingEngine'
    }));

    return newPromotion;
  }

  /**
   * Check if price rule matches context
   */
  private ruleMatchesContext(rule: PriceRule, context: PricingContext): boolean {
    // Check date range
    const now = context.timestamp;
    if (rule.startDate && now < rule.startDate) return false;
    if (rule.endDate && now > rule.endDate) return false;

    // Check product filters
    if (rule.productIds && !rule.productIds.includes(context.productId)) return false;

    // Check customer segments
    if (rule.customerSegments && context.customerSegment &&
        !rule.customerSegments.includes(context.customerSegment)) return false;

    // Check regions
    if (rule.regions && !rule.regions.includes(context.location.country)) return false;

    // Check conditions
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, context)) return false;
    }

    return true;
  }

  /**
   * Evaluate a price condition
   */
  private evaluateCondition(condition: PriceCondition, context: PricingContext): boolean {
    const { type, operator, value } = condition;

    switch (type) {
      case 'time':
        const hour = new Date(context.timestamp).getHours();
        return this.evaluateOperator(hour, operator, value);

      case 'quantity':
        return this.evaluateOperator(context.quantity, operator, value);

      case 'customer':
        return this.evaluateOperator(context.customerSegment, operator, value);

      case 'location':
        return this.evaluateOperator(context.location.country, operator, value);

      default:
        return true;
    }
  }

  /**
   * Evaluate comparison operator
   */
  private evaluateOperator(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals': return actual === expected;
      case 'greater_than': return actual > expected;
      case 'less_than': return actual < expected;
      case 'between': return actual >= expected[0] && actual <= expected[1];
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'contains': return String(actual).includes(String(expected));
      default: return false;
    }
  }

  /**
   * Apply price adjustments
   */
  private applyPriceAdjustments(price: number, adjustments: PriceAdjustment[]): number {
    let adjustedPrice = price;

    for (const adjustment of adjustments) {
      switch (adjustment.type) {
        case 'multiply':
          adjustedPrice *= adjustment.value;
          break;
        case 'add':
          adjustedPrice += adjustment.value;
          break;
        case 'subtract':
          adjustedPrice -= adjustment.value;
          break;
        case 'set':
          adjustedPrice = adjustment.value;
          break;
        case 'discount':
          adjustedPrice -= adjustment.value;
          break;
      }
    }

    return Math.max(0, adjustedPrice); // Ensure price doesn't go negative
  }

  /**
   * Apply promotions to price
   */
  private async applyPromotions(
    price: number,
    context: PricingContext,
    appliedPromotions: AppliedPromotion[]
  ): Promise<number> {
    let totalSavings = 0;

    for (const promotion of this.promotions.values()) {
      if (!promotion.active) continue;
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) continue;

      const now = context.timestamp;
      if (now < promotion.startDate || now > promotion.endDate) continue;

      if (this.promotionMatchesContext(promotion, context)) {
        const savings = this.calculatePromotionSavings(price, promotion, context);

        if (savings > 0) {
          appliedPromotions.push({
            id: promotion.id,
            name: promotion.name,
            type: promotion.type,
            savings,
            description: promotion.description
          });

          totalSavings += savings;
          promotion.usageCount++;
        }
      }
    }

    return totalSavings;
  }

  /**
   * Check if promotion matches context
   */
  private promotionMatchesContext(promotion: Promotion, context: PricingContext): boolean {
    // Check product filters
    if (promotion.productIds && !promotion.productIds.includes(context.productId)) return false;

    // Check customer segments
    if (promotion.customerSegments && context.customerSegment &&
        !promotion.customerSegments.includes(context.customerSegment)) return false;

    // Check regions
    if (promotion.regions && !promotion.regions.includes(context.location.country)) return false;

    // Check rules
    for (const rule of promotion.rules) {
      if (!this.evaluatePromotionRule(rule, context)) return false;
    }

    return true;
  }

  /**
   * Evaluate promotion rule
   */
  private evaluatePromotionRule(rule: PromotionRule, context: PricingContext): boolean {
    switch (rule.type) {
      case 'minimum_purchase':
        // This would need cart context
        return true;
      case 'minimum_quantity':
        return context.quantity >= rule.value;
      case 'specific_products':
        return rule.value.includes(context.productId);
      case 'customer_type':
        return context.customerSegment === rule.value;
      case 'time_window':
        const hour = new Date(context.timestamp).getHours();
        return hour >= rule.value.start && hour <= rule.value.end;
      default:
        return true;
    }
  }

  /**
   * Calculate promotion savings
   */
  private calculatePromotionSavings(price: number, promotion: Promotion, context: PricingContext): number {
    let savings = 0;

    for (const reward of promotion.rewards) {
      switch (reward.type) {
        case 'percentage_discount':
          savings += price * (reward.value / 100);
          break;
        case 'fixed_discount':
          savings += reward.value;
          break;
        case 'free_item':
          // Would need more complex logic for free items
          break;
        case 'loyalty_points':
          // Points are handled separately
          break;
      }
    }

    return savings;
  }

  /**
   * Calculate taxes (placeholder for TaxEngine integration)
   */
  private async calculateTaxes(price: number, context: PricingContext): Promise<TaxCalculation[]> {
    // Placeholder - will be replaced by TaxEngine
    const taxRate = 0.08; // 8% tax
    return [{
      jurisdiction: context.location.country,
      rate: taxRate,
      amount: price * taxRate,
      description: 'Sales Tax'
    }];
  }

  /**
   * Map adjustment type to discount type
   */
  private mapAdjustmentToDiscountType(adjustmentType: string): DiscountType {
    switch (adjustmentType) {
      case 'multiply':
      case 'discount':
        return DiscountType.PERCENTAGE;
      case 'subtract':
        return DiscountType.FIXED;
      default:
        return DiscountType.FIXED;
    }
  }

  /**
   * Update pricing for product
   */
  private async updatePricingForProduct(product: any): Promise<void> {
    // Update any cached pricing rules
    console.log('PricingEngine: Updated pricing for product', product.id);
  }

  /**
   * Get all active promotions
   */
  getActivePromotions(): Promotion[] {
    const now = Date.now();
    return Array.from(this.promotions.values()).filter(p =>
      p.active && now >= p.startDate && now <= p.endDate
    );
  }

  /**
   * Get price rules for product
   */
  getPriceRulesForProduct(productId: string): PriceRule[] {
    return Array.from(this.priceRules.values()).filter(rule =>
      !rule.productIds || rule.productIds.includes(productId)
    );
  }

  /**
   * Initialize the engine
   */
  initialize(): void {
    this.isInitialized = true;
    console.log('PricingEngine: Initialized');
  }

  /**
   * Shutdown the engine
   */
  shutdown(): void {
    this.isInitialized = false;
    console.log('PricingEngine: Shutdown');
  }
}

// Global pricing engine instance
export const pricingEngine = new PricingEngine();