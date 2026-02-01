// Tax Engine
// Multi-country tax calculation system with complex rules, jurisdictions, and compliance

import { eventBus, createEvent } from './EventBus';

export enum TaxType {
  SALES_TAX = 'sales_tax',
  VAT = 'vat',                    // Value Added Tax
  GST = 'gst',                    // Goods and Services Tax
  HST = 'hst',                    // Harmonized Sales Tax
  PST = 'pst',                    // Provincial Sales Tax
  QST = 'qst',                    // Quebec Sales Tax
  EXCISE = 'excise',              // Excise tax (alcohol, tobacco, fuel)
  LUXURY = 'luxury',              // Luxury tax
  ENVIRONMENTAL = 'environmental', // Environmental tax
  IMPORT = 'import',              // Import duties
  CUSTOM = 'custom'               // Custom tax types
}

export enum TaxCalculationMethod {
  INCLUSIVE = 'inclusive',        // Tax included in price
  EXCLUSIVE = 'exclusive',        // Tax added to price
  COMPOUND = 'compound',          // Tax on tax
  CASCADE = 'cascade'             // Cascading tax rates
}

export enum TaxJurisdiction {
  FEDERAL = 'federal',
  STATE = 'state',
  PROVINCE = 'province',
  COUNTY = 'county',
  CITY = 'city',
  SPECIAL = 'special'             // Special economic zones, etc.
}

export interface TaxRule {
  id: string;
  name: string;
  description: string;
  country: string;
  jurisdiction: TaxJurisdiction;
  region?: string;                // State, province, etc.
  locality?: string;              // City, county, etc.
  taxType: TaxType;
  rate: number;                   // Tax rate as decimal (0.08 for 8%)
  calculationMethod: TaxCalculationMethod;
  categories: string[];           // Product categories this applies to
  exemptions: TaxExemption[];
  thresholds: TaxThreshold[];
  active: boolean;
  startDate?: number;
  endDate?: number;
  metadata: Record<string, any>;
}

export interface TaxExemption {
  type: 'product' | 'customer' | 'location' | 'amount' | 'custom';
  value: any;
  description: string;
  metadata?: Record<string, any>;
}

export interface TaxThreshold {
  type: 'amount' | 'quantity' | 'weight' | 'volume';
  min?: number;
  max?: number;
  rate: number;                   // Different rate for this threshold
  description: string;
  metadata?: Record<string, any>;
}

export interface TaxCalculationContext {
  productId: string;
  category: string;
  customerId?: string;
  customerType?: string;
  location: {
    country: string;
    region: string;
    locality: string;
    postalCode?: string;
  };
  transactionType: 'sale' | 'refund' | 'exchange';
  amount: number;
  quantity: number;
  weight?: number;
  volume?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TaxCalculationResult {
  totalTax: number;
  breakdown: TaxBreakdown[];
  exemptions: TaxExemptionResult[];
  jurisdiction: string;
  metadata: Record<string, any>;
}

export interface TaxBreakdown {
  ruleId: string;
  ruleName: string;
  taxType: TaxType;
  jurisdiction: TaxJurisdiction;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface TaxExemptionResult {
  exemption: TaxExemption;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface TaxReportingData {
  period: {
    start: number;
    end: number;
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  jurisdiction: string;
  totals: {
    taxableSales: number;
    taxCollected: number;
    exemptions: number;
    refunds: number;
  };
  breakdown: TaxBreakdown[];
  compliance: {
    filingRequired: boolean;
    dueDate: number;
    status: 'pending' | 'filed' | 'overdue';
  };
  metadata: Record<string, any>;
}

class TaxEngine {
  private taxRules: Map<string, TaxRule> = new Map();
  private countryRules: Map<string, TaxRule[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeDefaultTaxRules();
    this.initializeEventListeners();
  }

  /**
   * Initialize default tax rules for major countries
   */
  private initializeDefaultTaxRules(): void {
    // US Sales Tax Rules
    this.createTaxRule({
      name: 'US Federal Sales Tax',
      description: 'Standard US sales tax',
      country: 'US',
      jurisdiction: TaxJurisdiction.FEDERAL,
      taxType: TaxType.SALES_TAX,
      rate: 0.0, // No federal sales tax
      calculationMethod: TaxCalculationMethod.EXCLUSIVE,
      categories: ['all'],
      exemptions: [],
      thresholds: [],
      active: true,
      metadata: { standard: true }
    });

    // California State Tax
    this.createTaxRule({
      name: 'California State Sales Tax',
      description: 'California state sales tax',
      country: 'US',
      jurisdiction: TaxJurisdiction.STATE,
      region: 'CA',
      taxType: TaxType.SALES_TAX,
      rate: 0.0625, // 6.25%
      calculationMethod: TaxCalculationMethod.EXCLUSIVE,
      categories: ['all'],
      exemptions: [
        {
          type: 'product',
          value: ['food', 'medicine', 'clothing_under_$100'],
          description: 'Basic necessities exemption'
        }
      ],
      thresholds: [],
      active: true,
      metadata: { standard: true }
    });

    // EU VAT Rules
    this.createTaxRule({
      name: 'EU Standard VAT',
      description: 'European Union standard VAT rate',
      country: 'EU',
      jurisdiction: TaxJurisdiction.FEDERAL,
      taxType: TaxType.VAT,
      rate: 0.20, // 20%
      calculationMethod: TaxCalculationMethod.INCLUSIVE,
      categories: ['all'],
      exemptions: [
        {
          type: 'product',
          value: ['books', 'food', 'medicine'],
          description: 'Reduced rate items'
        }
      ],
      thresholds: [],
      active: true,
      metadata: { standard: true }
    });

    // UK VAT
    this.createTaxRule({
      name: 'UK Standard VAT',
      description: 'United Kingdom VAT',
      country: 'GB',
      jurisdiction: TaxJurisdiction.FEDERAL,
      taxType: TaxType.VAT,
      rate: 0.20, // 20%
      calculationMethod: TaxCalculationMethod.EXCLUSIVE,
      categories: ['all'],
      exemptions: [],
      thresholds: [],
      active: true,
      metadata: { standard: true }
    });

    // UAE VAT
    this.createTaxRule({
      name: 'UAE VAT',
      description: 'United Arab Emirates VAT',
      country: 'AE',
      jurisdiction: TaxJurisdiction.FEDERAL,
      taxType: TaxType.VAT,
      rate: 0.05, // 5%
      calculationMethod: TaxCalculationMethod.EXCLUSIVE,
      categories: ['all'],
      exemptions: [
        {
          type: 'product',
          value: ['residential_property', 'education', 'healthcare'],
          description: 'VAT exempt items'
        }
      ],
      thresholds: [],
      active: true,
      metadata: { standard: true }
    });
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for transaction events to track tax calculations
    eventBus.subscribe('TRANSACTION_COMPLETED', (event) => {
      this.recordTaxTransaction(event.payload.transaction);
    });

    // Listen for business profile updates (for tax rule updates)
    eventBus.subscribe('BUSINESS_PROFILE_UPDATED', (event) => {
      this.updateTaxRulesForBusiness(event.payload.profile);
    });
  }

  /**
   * Create a new tax rule
   */
  async createTaxRule(rule: Omit<TaxRule, 'id'>): Promise<TaxRule> {
    const taxRule: TaxRule = {
      id: `tax_rule_${Date.now()}_${Math.random()}`,
      ...rule
    };

    this.taxRules.set(taxRule.id, taxRule);

    // Index by country
    if (!this.countryRules.has(taxRule.country)) {
      this.countryRules.set(taxRule.country, []);
    }
    this.countryRules.get(taxRule.country)!.push(taxRule);

    await eventBus.publish(createEvent('TAX_RULE_CREATED', {
      rule: taxRule
    }, {
      source: 'TaxEngine'
    }));

    return taxRule;
  }

  /**
   * Calculate taxes for a transaction item
   */
  async calculateTaxes(context: TaxCalculationContext): Promise<TaxCalculationResult> {
    const applicableRules = this.getApplicableTaxRules(context);
    const breakdown: TaxBreakdown[] = [];
    const exemptions: TaxExemptionResult[] = [];
    let totalTax = 0;
    let taxableAmount = context.amount;

    for (const rule of applicableRules) {
      if (!rule.active) continue;

      // Check date validity
      const now = context.timestamp;
      if (rule.startDate && now < rule.startDate) continue;
      if (rule.endDate && now > rule.endDate) continue;

      // Check category applicability
      if (!rule.categories.includes('all') && !rule.categories.includes(context.category)) continue;

      // Check exemptions
      const exemptionResult = this.checkExemptions(rule, context);
      if (exemptionResult) {
        exemptions.push(exemptionResult);
        continue;
      }

      // Apply thresholds
      const applicableRate = this.getApplicableRate(rule, context);

      // Calculate tax based on method
      let taxAmount = 0;
      let calculatedTaxableAmount = taxableAmount;

      switch (rule.calculationMethod) {
        case TaxCalculationMethod.EXCLUSIVE:
          taxAmount = calculatedTaxableAmount * applicableRate;
          break;

        case TaxCalculationMethod.INCLUSIVE:
          taxAmount = calculatedTaxableAmount - (calculatedTaxableAmount / (1 + applicableRate));
          calculatedTaxableAmount = calculatedTaxableAmount / (1 + applicableRate);
          break;

        case TaxCalculationMethod.COMPOUND:
          // Tax on tax - more complex calculation needed
          taxAmount = calculatedTaxableAmount * applicableRate;
          break;

        case TaxCalculationMethod.CASCADE:
          // Cascading rates - applied sequentially
          taxAmount = calculatedTaxableAmount * applicableRate;
          break;
      }

      // Add to breakdown
      breakdown.push({
        ruleId: rule.id,
        ruleName: rule.name,
        taxType: rule.taxType,
        jurisdiction: rule.jurisdiction,
        rate: applicableRate,
        taxableAmount: calculatedTaxableAmount,
        taxAmount,
        description: rule.description
      });

      totalTax += taxAmount;

      // For compound/cascade, update taxable amount for next rule
      if (rule.calculationMethod === TaxCalculationMethod.COMPOUND ||
          rule.calculationMethod === TaxCalculationMethod.CASCADE) {
        taxableAmount += taxAmount;
      }
    }

    return {
      totalTax,
      breakdown,
      exemptions,
      jurisdiction: context.location.country,
      metadata: {
        rulesApplied: breakdown.length,
        exemptionsApplied: exemptions.length,
        calculationTimestamp: Date.now()
      }
    };
  }

  /**
   * Get applicable tax rules for context
   */
  private getApplicableTaxRules(context: TaxCalculationContext): TaxRule[] {
    const countryRules = this.countryRules.get(context.location.country) || [];
    const applicableRules: TaxRule[] = [];

    for (const rule of countryRules) {
      // Check jurisdiction hierarchy
      let matches = false;

      switch (rule.jurisdiction) {
        case TaxJurisdiction.FEDERAL:
          matches = true; // Always applies
          break;

        case TaxJurisdiction.STATE:
        case TaxJurisdiction.PROVINCE:
          matches = rule.region === context.location.region;
          break;

        case TaxJurisdiction.COUNTY:
        case TaxJurisdiction.CITY:
          matches = rule.locality === context.location.locality;
          break;

        case TaxJurisdiction.SPECIAL:
          // Special rules would need custom logic
          matches = true;
          break;
      }

      if (matches) {
        applicableRules.push(rule);
      }
    }

    // Sort by priority (federal first, then state, etc.)
    return applicableRules.sort((a, b) => {
      const jurisdictionOrder = {
        [TaxJurisdiction.FEDERAL]: 1,
        [TaxJurisdiction.STATE]: 2,
        [TaxJurisdiction.PROVINCE]: 2,
        [TaxJurisdiction.COUNTY]: 3,
        [TaxJurisdiction.CITY]: 4,
        [TaxJurisdiction.SPECIAL]: 5
      };

      return jurisdictionOrder[a.jurisdiction] - jurisdictionOrder[b.jurisdiction];
    });
  }

  /**
   * Check if transaction is exempt from tax rule
   */
  private checkExemptions(rule: TaxRule, context: TaxCalculationContext): TaxExemptionResult | null {
    for (const exemption of rule.exemptions) {
      let isExempt = false;

      switch (exemption.type) {
        case 'product':
          isExempt = Array.isArray(exemption.value) && exemption.value.includes(context.category);
          break;

        case 'customer':
          isExempt = exemption.value === context.customerType;
          break;

        case 'location':
          isExempt = exemption.value === context.location.postalCode ||
                    exemption.value === context.location.locality;
          break;

        case 'amount':
          isExempt = context.amount < exemption.value;
          break;

        case 'custom':
          // Custom exemption logic would be implemented here
          isExempt = false;
          break;
      }

      if (isExempt) {
        return {
          exemption,
          amount: context.amount, // Full exemption
          description: exemption.description
        };
      }
    }

    return null;
  }

  /**
   * Get applicable tax rate considering thresholds
   */
  private getApplicableRate(rule: TaxRule, context: TaxCalculationContext): number {
    if (rule.thresholds.length === 0) {
      return rule.rate;
    }

    // Find applicable threshold
    for (const threshold of rule.thresholds) {
      let value = 0;

      switch (threshold.type) {
        case 'amount':
          value = context.amount;
          break;
        case 'quantity':
          value = context.quantity;
          break;
        case 'weight':
          value = context.weight || 0;
          break;
        case 'volume':
          value = context.volume || 0;
          break;
      }

      if ((threshold.min === undefined || value >= threshold.min) &&
          (threshold.max === undefined || value <= threshold.max)) {
        return threshold.rate;
      }
    }

    return rule.rate; // Default rate if no threshold matches
  }

  /**
   * Generate tax reporting data
   */
  async generateTaxReport(
    country: string,
    startDate: number,
    endDate: number,
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ): Promise<TaxReportingData> {
    // This would aggregate data from transaction logs
    // For now, return mock data

    const report: TaxReportingData = {
      period: {
        start: startDate,
        end: endDate,
        type: periodType
      },
      jurisdiction: country,
      totals: {
        taxableSales: 0,
        taxCollected: 0,
        exemptions: 0,
        refunds: 0
      },
      breakdown: [],
      compliance: {
        filingRequired: true,
        dueDate: endDate + (30 * 24 * 60 * 60 * 1000), // 30 days after period
        status: 'pending'
      },
      metadata: {
        generatedAt: Date.now(),
        version: '1.0'
      }
    };

    return report;
  }

  /**
   * Record tax transaction for reporting
   */
  private async recordTaxTransaction(transaction: any): Promise<void> {
    // Store tax calculation data for reporting
    // This would typically go to a database
    console.log('TaxEngine: Recorded tax transaction', transaction.id);
  }

  /**
   * Update tax rules for business
   */
  private async updateTaxRulesForBusiness(profile: any): Promise<void> {
    // Update tax rules based on business location
    console.log('TaxEngine: Updated tax rules for business', profile.id);
  }

  /**
   * Get all tax rules for a country
   */
  getTaxRulesForCountry(country: string): TaxRule[] {
    return this.countryRules.get(country) || [];
  }

  /**
   * Get tax rule by ID
   */
  getTaxRule(ruleId: string): TaxRule | null {
    return this.taxRules.get(ruleId) || null;
  }

  /**
   * Validate tax calculation
   */
  validateTaxCalculation(result: TaxCalculationResult): boolean {
    // Basic validation
    const calculatedTotal = result.breakdown.reduce((sum, item) => sum + item.taxAmount, 0);
    return Math.abs(calculatedTotal - result.totalTax) < 0.01; // Allow for rounding errors
  }

  /**
   * Initialize the engine
   */
  initialize(): void {
    this.isInitialized = true;
    console.log('TaxEngine: Initialized with', this.taxRules.size, 'tax rules');
  }

  /**
   * Shutdown the engine
   */
  shutdown(): void {
    this.isInitialized = false;
    console.log('TaxEngine: Shutdown');
  }
}

// Global tax engine instance
export const taxEngine = new TaxEngine();