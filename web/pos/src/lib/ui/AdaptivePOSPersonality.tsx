// Adaptive POS Personality System
// Dynamically adapts the POS interface based on business type

import React, { useEffect, useState, createContext, useContext } from 'react';
import { BusinessType } from '../core/BusinessTypeResolver';
import { createPOSEngine, POSEngine } from '../core/POSEngine';
import { eventBus, EventTypes } from '../core/EventBus';

export enum POSMode {
  SALE = 'sale',
  RETURN = 'return',
  VOID = 'void',
  HOLD = 'hold',
  TRAINING = 'training'
}

export enum POSLayout {
  CLASSIC = 'classic',      // Traditional POS layout
  MODERN = 'modern',        // Clean, minimal interface
  TABLET = 'tablet',        // Touch-optimized for tablets
  SCAN_FIRST = 'scan_first', // Scanner-centric for retail
  SPEED = 'speed',          // Fast-food/quick service
  FULLSCREEN = 'fullscreen' // Immersive experience
}

export interface POSPersonality {
  businessType: BusinessType;
  layout: POSLayout;
  features: {
    quickKeys: boolean;
    favorites: boolean;
    categories: boolean;
    search: boolean;
    scanner: boolean;
    scale: boolean;
    tables: boolean;
    modifiers: boolean;
    customerDisplay: boolean;
    kitchenDisplay: boolean;
    loyalty: boolean;
    promotions: boolean;
    inventory: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  animations: {
    transitions: boolean;
    haptics: boolean;
    sounds: boolean;
  };
  shortcuts: {
    [key: string]: string; // keyboard shortcut -> action
  };
  components: {
    header: React.ComponentType<any>;
    productGrid: React.ComponentType<any>;
    cart: React.ComponentType<any>;
    payment: React.ComponentType<any>;
    receipt: React.ComponentType<any>;
  };
}

interface POSPersonalityContextType {
  personality: POSPersonality | null;
  posEngine: POSEngine | null;
  mode: POSMode;
  setMode: (mode: POSMode) => void;
  isLoading: boolean;
  error: string | null;
}

const POSPersonalityContext = createContext<POSPersonalityContextType>({
  personality: null,
  posEngine: null,
  mode: POSMode.SALE,
  setMode: () => {},
  isLoading: true,
  error: null
});

export const usePOSPersonality = () => useContext(POSPersonalityContext);

// Restaurant Personality - Table service, modifiers, kitchen integration
const RestaurantPersonality: POSPersonality = {
  businessType: BusinessType.RESTAURANT,
  layout: POSLayout.TABLET,
  features: {
    quickKeys: true,
    favorites: true,
    categories: true,
    search: true,
    scanner: false,
    scale: false,
    tables: true,
    modifiers: true,
    customerDisplay: true,
    kitchenDisplay: true,
    loyalty: true,
    promotions: true,
    inventory: true
  },
  colors: {
    primary: '#D97706',    // Orange
    secondary: '#374151',  // Gray
    accent: '#10B981',     // Green
    background: '#111827', // Dark blue
    surface: '#1F2937',    // Dark gray
    text: '#F9FAFB',       // Light gray
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  animations: {
    transitions: true,
    haptics: true,
    sounds: true
  },
  shortcuts: {
    'F1': 'dine_in',
    'F2': 'takeout',
    'F3': 'delivery',
    'F4': 'favorites',
    'F5': 'modifiers',
    'F6': 'tables',
    'F7': 'kitchen',
    'F8': 'payment',
    'F9': 'void',
    'F10': 'hold',
    'F11': 'customers',
    'F12': 'reports'
  },
  components: {
    header: React.lazy(() => import('../components/personalities/RestaurantHeader')),
    productGrid: React.lazy(() => import('../components/personalities/RestaurantProductGrid')),
    cart: React.lazy(() => import('../components/personalities/RestaurantCart')),
    payment: React.lazy(() => import('../components/personalities/RestaurantPayment')),
    receipt: React.lazy(() => import('../components/personalities/RestaurantReceipt'))
  }
};

// Retail Personality - Scanner focus, inventory management, quick checkout
const RetailPersonality: POSPersonality = {
  businessType: BusinessType.RETAIL,
  layout: POSLayout.SCAN_FIRST,
  features: {
    quickKeys: true,
    favorites: false,
    categories: true,
    search: true,
    scanner: true,
    scale: false,
    tables: false,
    modifiers: false,
    customerDisplay: true,
    kitchenDisplay: false,
    loyalty: true,
    promotions: true,
    inventory: true
  },
  colors: {
    primary: '#7C3AED',    // Purple
    secondary: '#6B7280',  // Gray
    accent: '#F59E0B',     // Yellow
    background: '#0F172A', // Dark blue
    surface: '#1E293B',    // Dark gray
    text: '#F1F5F9',       // Light gray
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  animations: {
    transitions: true,
    haptics: true,
    sounds: true
  },
  shortcuts: {
    'F1': 'scan',
    'F2': 'search',
    'F3': 'categories',
    'F4': 'favorites',
    'F5': 'customer',
    'F6': 'loyalty',
    'F7': 'discount',
    'F8': 'payment',
    'F9': 'void',
    'F10': 'hold',
    'F11': 'inventory',
    'F12': 'reports'
  },
  components: {
    header: React.lazy(() => import('../components/personalities/RetailHeader')),
    productGrid: React.lazy(() => import('../components/personalities/RetailProductGrid')),
    cart: React.lazy(() => import('../components/personalities/RetailCart')),
    payment: React.lazy(() => import('../components/personalities/RetailPayment')),
    receipt: React.lazy(() => import('../components/personalities/RetailReceipt'))
  }
};

// Supermarket Personality - Scale integration, bulk operations, security focus
const SupermarketPersonality: POSPersonality = {
  businessType: BusinessType.RETAIL, // Using retail as base, but with supermarket features
  layout: POSLayout.SPEED,
  features: {
    quickKeys: true,
    favorites: false,
    categories: true,
    search: true,
    scanner: true,
    scale: true,
    tables: false,
    modifiers: false,
    customerDisplay: true,
    kitchenDisplay: false,
    loyalty: true,
    promotions: true,
    inventory: true
  },
  colors: {
    primary: '#059669',    // Green
    secondary: '#374151',  // Gray
    accent: '#DC2626',     // Red
    background: '#0F172A', // Dark blue
    surface: '#1E293B',    // Dark gray
    text: '#F1F5F9',       // Light gray
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  animations: {
    transitions: true,
    haptics: true,
    sounds: true
  },
  shortcuts: {
    'F1': 'scan',
    'F2': 'weight',
    'F3': 'bulk',
    'F4': 'produce',
    'F5': 'customer',
    'F6': 'loyalty',
    'F7': 'security',
    'F8': 'payment',
    'F9': 'void',
    'F10': 'hold',
    'F11': 'manager',
    'F12': 'reports'
  },
  components: {
    header: React.lazy(() => import('../components/personalities/SupermarketHeader')),
    productGrid: React.lazy(() => import('../components/personalities/SupermarketProductGrid')),
    cart: React.lazy(() => import('../components/personalities/SupermarketCart')),
    payment: React.lazy(() => import('../components/personalities/SupermarketPayment')),
    receipt: React.lazy(() => import('../components/personalities/SupermarketReceipt'))
  }
};

class AdaptivePOSPersonalityProvider extends React.Component<
  { children: React.ReactNode },
  POSPersonalityContextType
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);

    this.state = {
      personality: null,
      posEngine: null,
      mode: POSMode.SALE,
      setMode: this.setMode.bind(this),
      isLoading: true,
      error: null
    };
  }

  async componentDidMount() {
    try {
      await this.initializePersonality();
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message
      });
    }
  }

  private async initializePersonality() {
    // Detect business type from business resolver
    const businessProfile = await this.detectBusinessProfile();

    if (!businessProfile) {
      throw new Error('No business profile found. Please complete onboarding first.');
    }

    // Get appropriate personality
    const personality = this.getPersonalityForBusinessType(businessProfile.type);

    // Initialize POS Engine with business config
    const posEngine = createPOSEngine({
      businessId: businessProfile.id,
      branchId: 'main', // TODO: Get from context
      userId: 'current_user', // TODO: Get from auth context
      sessionId: `session_${Date.now()}`,
      features: {
        hardwareEnabled: personality.features.scanner || personality.features.scale,
        inventoryEnabled: personality.features.inventory,
        multiLocation: true,
        onlineOrdering: personality.businessType === BusinessType.RESTAURANT,
        loyaltyProgram: personality.features.loyalty
      },
      performance: {
        maxConcurrentTransactions: 10,
        cacheEnabled: true,
        offlineMode: true
      }
    });

    this.setState({
      personality,
      posEngine,
      isLoading: false,
      error: null
    });

    // Setup event listeners
    this.setupEventListeners();
  }

  private async detectBusinessProfile() {
    // Detect from business resolver or local storage
    const stored = localStorage.getItem('nilelink_current_business');
    if (stored) {
      const biz = JSON.parse(stored);
      return {
        id: biz.id,
        type: biz.type || BusinessType.RETAIL,
        name: biz.name,
        size: biz.size || 'small',
        industry: biz.industry || 'retail'
      };
    }
    return null;
  }

  private getPersonalityForBusinessType(businessType: BusinessType): POSPersonality {
    switch (businessType) {
      case BusinessType.RESTAURANT:
        return RestaurantPersonality;
      case BusinessType.RETAIL:
        // Check if supermarket based on additional criteria
        return this.isSupermarket() ? SupermarketPersonality : RetailPersonality;
      default:
        return RetailPersonality; // Default fallback
    }
  }

  private isSupermarket(): boolean {
    // Logic to determine if this is a supermarket vs regular retail
    // Could be based on product categories, business size, or explicit setting
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('personality') === 'supermarket' ||
           localStorage.getItem('pos_personality') === 'supermarket';
  }

  private setMode(mode: POSMode) {
    this.setState({ mode });
  }

  private setupEventListeners() {
    // Listen for business type changes
    eventBus.subscribe('BUSINESS_PROFILE_UPDATED', async (event) => {
      const { profile } = event.payload;
      const personality = this.getPersonalityForBusinessType(profile.type);

      this.setState({ personality });
    });

    // Listen for hardware events
    eventBus.subscribe('HARDWARE_DATA_SCANNER', (event) => {
      this.handleHardwareEvent('scanner', event.payload);
    });

    eventBus.subscribe('HARDWARE_DATA_SCALE', (event) => {
      this.handleHardwareEvent('scale', event.payload);
    });
  }

  private handleHardwareEvent(type: string, data: any) {
    // Handle hardware events based on personality
    if (this.state.personality?.features.scanner && type === 'scanner') {
      // Process barcode scan
      console.log('Processing barcode scan:', data);
    }

    if (this.state.personality?.features.scale && type === 'scale') {
      // Process weight data
      console.log('Processing weight data:', data);
    }
  }

  render() {
    return (
      <POSPersonalityContext.Provider value={this.state}>
        {this.state.isLoading ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Initializing POS Personality...</p>
            </div>
          </div>
        ) : this.state.error ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-center text-red-400">
              <h2 className="text-2xl font-bold mb-4">POS Initialization Error</h2>
              <p>{this.state.error}</p>
            </div>
          </div>
        ) : (
          this.props.children
        )}
      </POSPersonalityContext.Provider>
    );
  }
}

export default AdaptivePOSPersonalityProvider;