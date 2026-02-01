// Business Type Resolver System
// Handles business type detection, feature flags, module loading, and onboarding

import { eventBus, EventTypes, createEvent, EventPriority } from './EventBus';

export enum BusinessType {
  RESTAURANT = 'restaurant',
  RETAIL = 'retail',
  HOSPITALITY = 'hospitality',
  HEALTHCARE = 'healthcare',
  SALON_SPA = 'salon_spa',
  FITNESS = 'fitness',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  SERVICE = 'service',
  WHOLESALE = 'wholesale',
  ECOMMERCE = 'ecommerce',
  CUSTOM = 'custom'
}

export enum BusinessSize {
  MICRO = 'micro',         // 1-10 employees
  SMALL = 'small',         // 11-50 employees
  MEDIUM = 'medium',       // 51-200 employees
  LARGE = 'large',         // 201-1000 employees
  ENTERPRISE = 'enterprise' // 1000+ employees
}

export enum OnboardingStep {
  BUSINESS_INFO = 'business_info',
  BUSINESS_TYPE = 'business_type',
  LOCATION_SETUP = 'location_setup',
  TEAM_SETUP = 'team_setup',
  PRODUCT_SETUP = 'product_setup',
  HARDWARE_SETUP = 'hardware_setup',
  INTEGRATION_SETUP = 'integration_setup',
  PAYMENT_SETUP = 'payment_setup',
  TAX_SETUP = 'tax_setup',
  COMPLETE = 'complete'
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: BusinessType;
  size: BusinessSize;
  industry: string;
  description?: string;
  logo?: string;
  website?: string;
  contactInfo: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  fiscalInfo: {
    taxId?: string;
    currency: string;
    timeZone: string;
    fiscalYearStart: number; // Month 0-11
  };
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  businessTypes: BusinessType[];
  businessSizes: BusinessSize[];
  dependencies: string[]; // Other feature IDs this depends on
  conflicts: string[];    // Feature IDs this conflicts with
  rollout: {
    percentage: number;    // 0-100 rollout percentage
    userIds?: string[];    // Specific users
    businessIds?: string[]; // Specific businesses
  };
  metadata: Record<string, any>;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'core' | 'optional' | 'premium' | 'custom';
  businessTypes: BusinessType[];
  businessSizes: BusinessSize[];
  dependencies: string[];
  entryPoint: string;
  config: Record<string, any>;
  enabled: boolean;
  loaded: boolean;
  metadata: Record<string, any>;
}

export interface OnboardingProgress {
  businessId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: Record<string, any>;
  startedAt: number;
  completedAt?: number;
  estimatedCompletionTime: number; // in minutes
}

export interface BusinessTypeConfig {
  type: BusinessType;
  displayName: string;
  description: string;
  icon: string;
  features: string[];
  modules: string[];
  workflows: string[];
  integrations: string[];
  recommendedHardware: string[];
  defaultSettings: Record<string, any>;
  onboardingFlow: OnboardingStep[];
}

class BusinessTypeResolver {
  private businessProfiles: Map<string, BusinessProfile> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private modules: Map<string, Module> = new Map();
  private businessTypeConfigs: Map<BusinessType, BusinessTypeConfig> = new Map();
  private onboardingProgress: Map<string, OnboardingProgress> = new Map();
  private loadedModules: Set<string> = new Set();
  private isInitialized = false;

  constructor() {
    this.initializeDefaultConfigs();
    this.initializeEventHandlers();
  }

  /**
   * Initialize default business type configurations
   */
  private initializeDefaultConfigs(): void {
    const configs: BusinessTypeConfig[] = [
      {
        type: BusinessType.RESTAURANT,
        displayName: 'Restaurant',
        description: 'Full-service or quick-service restaurant management',
        icon: '🍽️',
        features: [
          'table_management',
          'kitchen_display',
          'menu_management',
          'order_routing',
          'customer_loyalty',
          'online_ordering',
          'reservation_system'
        ],
        modules: [
          'pos_core',
          'restaurant_module',
          'kitchen_module',
          'table_management',
          'reservation_system'
        ],
        workflows: [
          'dine_in_order',
          'takeout_order',
          'delivery_order',
          'table_reservation'
        ],
        integrations: [
          'uber_eats',
          'doordash',
          'grubhub',
          'opentable',
          'toast',
          'square'
        ],
        recommendedHardware: [
          'thermal_printer',
          'kitchen_display',
          'cash_drawer',
          'card_reader',
          'barcode_scanner',
          'scale'
        ],
        defaultSettings: {
          currency: 'USD',
          taxInclusive: false,
          tableManagement: true,
          kitchenDisplay: true,
          onlineOrdering: true
        },
        onboardingFlow: [
          OnboardingStep.BUSINESS_INFO,
          OnboardingStep.BUSINESS_TYPE,
          OnboardingStep.LOCATION_SETUP,
          OnboardingStep.TEAM_SETUP,
          OnboardingStep.PRODUCT_SETUP,
          OnboardingStep.HARDWARE_SETUP,
          OnboardingStep.INTEGRATION_SETUP,
          OnboardingStep.COMPLETE
        ]
      },
      {
        type: BusinessType.RETAIL,
        displayName: 'Retail Store',
        description: 'Brick-and-mortar or online retail business',
        icon: '🛍️',
        features: [
          'inventory_management',
          'barcode_scanning',
          'customer_loyalty',
          'gift_cards',
          'promotions',
          'multi_location',
          'online_store'
        ],
        modules: [
          'pos_core',
          'retail_module',
          'inventory_module',
          'customer_module',
          'ecommerce_module'
        ],
        workflows: [
          'in_store_sale',
          'online_order',
          'inventory_count',
          'customer_service'
        ],
        integrations: [
          'shopify',
          'woocommerce',
          'square',
          'stripe',
          'mailchimp',
          'quickbooks'
        ],
        recommendedHardware: [
          'barcode_scanner',
          'thermal_printer',
          'cash_drawer',
          'card_reader',
          'scale',
          'rfid_reader'
        ],
        defaultSettings: {
          currency: 'USD',
          taxInclusive: false,
          inventoryTracking: 'batch',
          customerLoyalty: true,
          multiLocation: false
        },
        onboardingFlow: [
          OnboardingStep.BUSINESS_INFO,
          OnboardingStep.BUSINESS_TYPE,
          OnboardingStep.LOCATION_SETUP,
          OnboardingStep.TEAM_SETUP,
          OnboardingStep.PRODUCT_SETUP,
          OnboardingStep.HARDWARE_SETUP,
          OnboardingStep.INTEGRATION_SETUP,
          OnboardingStep.COMPLETE
        ]
      },
      {
        type: BusinessType.HOSPITALITY,
        displayName: 'Hospitality',
        description: 'Hotels, resorts, and hospitality services',
        icon: '🏨',
        features: [
          'room_management',
          'booking_system',
          'guest_services',
          'housekeeping',
          'pos_integration',
          'multi_property'
        ],
        modules: [
          'pos_core',
          'hospitality_module',
          'booking_module',
          'housekeeping_module',
          'guest_services'
        ],
        workflows: [
          'room_booking',
          'check_in',
          'check_out',
          'housekeeping',
          'guest_services'
        ],
        integrations: [
          'pms_systems',
          'booking_com',
          'airbnb',
          'expedia',
          'opera'
        ],
        recommendedHardware: [
          'thermal_printer',
          'card_reader',
          'key_card_encoder',
          'guest_display'
        ],
        defaultSettings: {
          currency: 'USD',
          taxInclusive: false,
          roomManagement: true,
          bookingSystem: true
        },
        onboardingFlow: [
          OnboardingStep.BUSINESS_INFO,
          OnboardingStep.BUSINESS_TYPE,
          OnboardingStep.LOCATION_SETUP,
          OnboardingStep.TEAM_SETUP,
          OnboardingStep.PRODUCT_SETUP,
          OnboardingStep.INTEGRATION_SETUP,
          OnboardingStep.COMPLETE
        ]
      }
    ];

    configs.forEach(config => {
      this.businessTypeConfigs.set(config.type, config);
    });
  }

  /**
   * Initialize event handlers
   */
  private initializeEventHandlers(): void {
    // Handle system startup
    eventBus.subscribe(EventTypes.SYSTEM_STARTUP, async (event) => {
      await this.loadBusinessProfile();
      await this.loadModules();
    });
  }

  /**
   * Create business profile
   */
  async createBusinessProfile(profileData: Omit<BusinessProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessProfile> {
    const profile: BusinessProfile = {
      id: `biz_${Date.now()}_${Math.random()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...profileData
    };

    this.businessProfiles.set(profile.id, profile);

    // Initialize onboarding progress
    await this.initializeOnboarding(profile.id);

    // Publish event
    await eventBus.publish(createEvent('BUSINESS_PROFILE_CREATED', {
      profile: { ...profile }
    }, {
      source: 'BusinessTypeResolver',
      businessId: profile.id
    }));

    return profile;
  }

  /**
   * Get business profile
   */
  getBusinessProfile(businessId: string): BusinessProfile | null {
    return this.businessProfiles.get(businessId) || null;
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(businessId: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const profile = this.businessProfiles.get(businessId);
    if (!profile) {
      throw new Error(`Business profile ${businessId} not found`);
    }

    const updatedProfile: BusinessProfile = {
      ...profile,
      ...updates,
      updatedAt: Date.now()
    };

    this.businessProfiles.set(businessId, updatedProfile);

    // Publish event
    await eventBus.publish(createEvent('BUSINESS_PROFILE_UPDATED', {
      profile: { ...updatedProfile },
      changes: updates
    }, {
      source: 'BusinessTypeResolver',
      businessId: businessId
    }));

    return updatedProfile;
  }

  /**
   * Get business type configuration
   */
  getBusinessTypeConfig(type: BusinessType): BusinessTypeConfig | null {
    return this.businessTypeConfigs.get(type) || null;
  }

  /**
   * Check if feature is enabled for business
   */
  isFeatureEnabled(featureName: string, businessId: string): boolean {
    const profile = this.businessProfiles.get(businessId);
    if (!profile) return false;

    const featureFlag = this.featureFlags.get(featureName);
    if (featureFlag) {
      // Check if feature is enabled for this business type and size
      if (!featureFlag.businessTypes.includes(profile.type)) return false;
      if (!featureFlag.businessSizes.includes(profile.size)) return false;

      // Check rollout percentage
      if (featureFlag.rollout.percentage < 100) {
        const hash = this.simpleHash(businessId);
        if ((hash % 100) >= featureFlag.rollout.percentage) return false;
      }

      // Check specific user/business overrides
      if (featureFlag.rollout.businessIds &&
          !featureFlag.rollout.businessIds.includes(businessId)) {
        return false;
      }

      return featureFlag.enabled;
    }

    // If no feature flag exists, check business type config
    const config = this.businessTypeConfigs.get(profile.type);
    return config ? config.features.includes(featureName) : false;
  }

  /**
   * Load and enable modules for business
   */
  async loadModulesForBusiness(businessId: string): Promise<void> {
    const profile = this.businessProfiles.get(businessId);
    if (!profile) return;

    const config = this.businessTypeConfigs.get(profile.type);
    if (!config) return;

    // Load required modules
    for (const moduleId of config.modules) {
      await this.loadModule(moduleId, businessId);
    }
  }

  /**
   * Load a specific module
   */
  private async loadModule(moduleId: string, businessId: string): Promise<void> {
    if (this.loadedModules.has(moduleId)) return;

    const moduleInfo = this.modules.get(moduleId);
    if (!moduleInfo) {
      console.warn(`Module ${moduleId} not found`);
      return;
    }

    try {
      // Check dependencies
      for (const dep of moduleInfo.dependencies) {
        if (!this.loadedModules.has(dep)) {
          await this.loadModule(dep, businessId);
        }
      }

      // Load module (in a real implementation, this would dynamically import)
      console.log(`Loading module: ${moduleInfo.name} v${moduleInfo.version}`);

      // Mark as loaded
      moduleInfo.loaded = true;
      this.loadedModules.add(moduleId);

      // Publish event
      await eventBus.publish(createEvent('MODULE_LOADED', {
        moduleId,
        module: { ...moduleInfo },
        businessId
      }, {
        source: 'BusinessTypeResolver',
        businessId
      }));

    } catch (error: any) {
      console.error(`Failed to load module ${moduleId}:`, error);

      await eventBus.publish(createEvent('MODULE_LOAD_FAILED', {
        moduleId,
        error: error.message,
        businessId
      }, {
        source: 'BusinessTypeResolver',
        businessId,
        priority: EventPriority.HIGH
      }));
    }
  }

  /**
   * Initialize onboarding for business
   */
  private async initializeOnboarding(businessId: string): Promise<void> {
    const profile = this.businessProfiles.get(businessId);
    if (!profile) return;

    const config = this.businessTypeConfigs.get(profile.type);
    if (!config) return;

    const onboarding: OnboardingProgress = {
      businessId,
      currentStep: config.onboardingFlow[0],
      completedSteps: [],
      data: {},
      startedAt: Date.now(),
      estimatedCompletionTime: config.onboardingFlow.length * 15 // 15 minutes per step
    };

    this.onboardingProgress.set(businessId, onboarding);

    await eventBus.publish(createEvent('ONBOARDING_STARTED', {
      businessId,
      onboarding: { ...onboarding }
    }, {
      source: 'BusinessTypeResolver',
      businessId
    }));
  }

  /**
   * Update onboarding progress
   */
  async updateOnboardingProgress(businessId: string, step: OnboardingStep, data: any = {}): Promise<void> {
    const onboarding = this.onboardingProgress.get(businessId);
    if (!onboarding) {
      throw new Error(`Onboarding progress not found for business ${businessId}`);
    }

    onboarding.completedSteps.push(onboarding.currentStep);

    // Move to next step
    const profile = this.businessProfiles.get(businessId);
    const config = profile ? this.businessTypeConfigs.get(profile.type) : null;
    const currentIndex = config ? config.onboardingFlow.indexOf(step) : -1;

    if (config && currentIndex < config.onboardingFlow.length - 1) {
      onboarding.currentStep = config.onboardingFlow[currentIndex + 1];
    } else {
      onboarding.currentStep = OnboardingStep.COMPLETE;
      onboarding.completedAt = Date.now();
    }

    // Store step data
    onboarding.data[step] = data;

    this.onboardingProgress.set(businessId, onboarding);

    await eventBus.publish(createEvent('ONBOARDING_PROGRESS_UPDATED', {
      businessId,
      onboarding: { ...onboarding },
      completedStep: step
    }, {
      source: 'BusinessTypeResolver',
      businessId
    }));

    // Auto-complete onboarding if all steps done
    if (onboarding.currentStep === OnboardingStep.COMPLETE) {
      await this.completeOnboarding(businessId);
    }
  }

  /**
   * Complete onboarding
   */
  private async completeOnboarding(businessId: string): Promise<void> {
    // Load modules for the business
    await this.loadModulesForBusiness(businessId);

    await eventBus.publish(createEvent('ONBOARDING_COMPLETED', {
      businessId
    }, {
      source: 'BusinessTypeResolver',
      businessId
    }));
  }

  /**
   * Get onboarding progress
   */
  getOnboardingProgress(businessId: string): OnboardingProgress | null {
    return this.onboardingProgress.get(businessId) || null;
  }

  /**
   * Get available business types
   */
  getAvailableBusinessTypes(): BusinessTypeConfig[] {
    return Array.from(this.businessTypeConfigs.values());
  }

  /**
   * Register a custom module
   */
  registerModule(module: Module): void {
    this.modules.set(module.id, module);
    console.log(`BusinessTypeResolver: Registered module ${module.name} v${module.version}`);
  }

  /**
   * Register a feature flag
   */
  registerFeatureFlag(flag: FeatureFlag): void {
    this.featureFlags.set(flag.id, flag);
    console.log(`BusinessTypeResolver: Registered feature flag ${flag.name}`);
  }

  /**
   * Simple hash function for rollout percentage
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Load business profile (from storage/API)
   */
  private async loadBusinessProfile(): Promise<void> {
    // In a real implementation, this would load from database/API
    // For now, we'll initialize with defaults if needed
  }

  /**
   * Load available modules
   */
  private async loadModules(): Promise<void> {
    // Register core modules
    this.registerModule({
      id: 'pos_core',
      name: 'POS Core',
      description: 'Core POS functionality',
      version: '1.0.0',
      type: 'core',
      businessTypes: Object.values(BusinessType),
      businessSizes: Object.values(BusinessSize),
      dependencies: [],
      entryPoint: './core/pos',
      config: {},
      enabled: true,
      loaded: false,
      metadata: {}
    });

    this.registerModule({
      id: 'restaurant_module',
      name: 'Restaurant Module',
      description: 'Restaurant-specific features',
      version: '1.0.0',
      type: 'optional',
      businessTypes: [BusinessType.RESTAURANT],
      businessSizes: Object.values(BusinessSize),
      dependencies: ['pos_core'],
      entryPoint: './modules/restaurant',
      config: {},
      enabled: true,
      loaded: false,
      metadata: {}
    });

    this.registerModule({
      id: 'retail_module',
      name: 'Retail Module',
      description: 'Retail-specific features',
      version: '1.0.0',
      type: 'optional',
      businessTypes: [BusinessType.RETAIL],
      businessSizes: Object.values(BusinessSize),
      dependencies: ['pos_core'],
      entryPoint: './modules/retail',
      config: {},
      enabled: true,
      loaded: false,
      metadata: {}
    });
  }

  /**
   * Initialize the resolver
   */
  initialize(): void {
    this.isInitialized = true;
    console.log('BusinessTypeResolver: Initialized');
  }

  /**
   * Shutdown the resolver
   */
  shutdown(): void {
    this.isInitialized = false;
    // Unload modules, cleanup resources
    console.log('BusinessTypeResolver: Shutdown');
  }
}

// Global instance
export const businessTypeResolver = new BusinessTypeResolver();