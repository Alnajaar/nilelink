// Supplier Onboarding Engine
// Web3-based supplier verification with country-specific discovery

import { eventBus, createEvent } from '../core/EventBus';
import { complianceEngine } from '../core/ComplianceEngine';

export enum SupplierVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum SupplierType {
  FOOD_BEVERAGE = 'food_beverage',
  PACKAGING = 'packaging',
  EQUIPMENT = 'equipment',
  CLEANING = 'cleaning',
  PAPER_GOODS = 'paper_goods',
  BEVERAGES = 'beverages',
  DAIRY = 'dairy',
  PRODUCE = 'produce',
  MEAT = 'meat',
  BAKERY = 'bakery',
  FROZEN = 'frozen',
  GENERAL = 'general'
}

export interface SupplierProfile {
  id: string;
  walletAddress: string;
  businessName: string;
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  businessInfo: {
    type: SupplierType;
    description: string;
    foundedYear?: number;
    employeeCount?: number;
  };
  location: {
    country: string;
    region: string;
    city: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  certifications: string[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: number;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    currency: string;
  };
  compliance: {
    taxId?: string;
    businessLicense: string;
    foodSafetyCert?: string;
    insuranceRequired: boolean;
  };
  verificationStatus: SupplierVerificationStatus;
  verificationDocuments: SupplierDocument[];
  reputation: {
    rating: number;
    reviewCount: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
  capabilities: {
    deliveryRadius: number; // km
    minimumOrder: number;
    leadTime: number; // hours
    bulkDiscounts: boolean;
    customOrders: boolean;
  };
  createdAt: number;
  updatedAt: number;
  verifiedAt?: number;
}

export interface SupplierDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'insurance' | 'certification' | 'bank_statement' | 'id_verification';
  name: string;
  url: string; // IPFS hash
  uploadedAt: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
  expiryDate?: number;
}

export interface SupplierSearchCriteria {
  country?: string;
  region?: string;
  city?: string;
  supplierType?: SupplierType;
  productCategories?: string[];
  deliveryRadius?: number;
  minimumOrder?: number;
  certifications?: string[];
  verifiedOnly?: boolean;
  rating?: number;
  limit?: number;
  offset?: number;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  sku: string;
  barcode?: string;
  unit: string;
  unitPrice: number;
  currency: string;
  minimumOrderQuantity: number;
  leadTime: number; // hours
  availability: {
    inStock: boolean;
    stockQuantity: number;
    reorderPoint: number;
    lastUpdated: number;
  };
  specifications?: Record<string, any>;
  certifications?: string[];
  images: string[]; // IPFS hashes
  tags: string[];
  seasonal: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

class SupplierOnboardingEngine {
  private suppliers: Map<string, SupplierProfile> = new Map();
  private supplierProducts: Map<string, SupplierProduct[]> = new Map();
  private verificationQueue: SupplierProfile[] = [];
  private countryIndex: Map<string, string[]> = new Map(); // country -> supplierIds
  private typeIndex: Map<SupplierType, string[]> = new Map(); // type -> supplierIds
  private isInitialized = false;

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for supplier verification requests
    eventBus.subscribe('SUPPLIER_VERIFICATION_REQUESTED', (event) => {
      this.processVerificationRequest(event.payload.supplierId);
    });

    // Listen for supplier product updates
    eventBus.subscribe('SUPPLIER_PRODUCT_UPDATED', (event) => {
      this.updateSupplierProductIndex(event.payload.product);
    });
  }

  /**
   * Register a new supplier
   */
  async registerSupplier(supplierData: Omit<SupplierProfile, 'id' | 'verificationStatus' | 'verificationDocuments' | 'reputation' | 'createdAt' | 'updatedAt'>): Promise<SupplierProfile> {
    const supplierId = `supplier_${Date.now()}_${Math.random()}`;

    const supplier: SupplierProfile = {
      id: supplierId,
      verificationStatus: SupplierVerificationStatus.UNVERIFIED,
      verificationDocuments: [],
      reputation: {
        rating: 0,
        reviewCount: 0,
        onTimeDelivery: 0,
        qualityScore: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...supplierData
    };

    this.suppliers.set(supplierId, supplier);

    // Add to indexes
    this.addToIndexes(supplier);

    // Queue for verification
    this.verificationQueue.push(supplier);

    await eventBus.publish(createEvent('SUPPLIER_REGISTERED', {
      supplier: { ...supplier }
    }, {
      source: 'SupplierOnboardingEngine'
    }));

    // Auto-start verification process
    await this.initiateVerification(supplierId);

    return supplier;
  }

  /**
   * Search suppliers with country-specific filtering
   */
  async searchSuppliers(criteria: SupplierSearchCriteria): Promise<SupplierProfile[]> {
    let candidateIds = new Set<string>();

    // Start with country-based filtering (local by default)
    if (criteria.country) {
      const countrySuppliers = this.countryIndex.get(criteria.country) || [];
      countrySuppliers.forEach(id => candidateIds.add(id));
    } else {
      // If no country specified, include all (worldwide)
      this.suppliers.forEach((_, id) => candidateIds.add(id));
    }

    // Filter by region/city
    if (criteria.region || criteria.city) {
      const filteredIds = new Set<string>();
      candidateIds.forEach(id => {
        const supplier = this.suppliers.get(id);
        if (supplier) {
          const matchesRegion = !criteria.region || supplier.location.region === criteria.region;
          const matchesCity = !criteria.city || supplier.location.city === criteria.city;

          if (matchesRegion && matchesCity) {
            filteredIds.add(id);
          }
        }
      });
      candidateIds = filteredIds;
    }

    // Filter by supplier type
    if (criteria.supplierType) {
      const typeSuppliers = this.typeIndex.get(criteria.supplierType) || [];
      candidateIds = new Set([...candidateIds].filter(id => typeSuppliers.includes(id)));
    }

    // Filter by verification status
    if (criteria.verifiedOnly) {
      const verifiedIds = new Set<string>();
      candidateIds.forEach(id => {
        const supplier = this.suppliers.get(id);
        if (supplier && supplier.verificationStatus === SupplierVerificationStatus.VERIFIED) {
          verifiedIds.add(id);
        }
      });
      candidateIds = verifiedIds;
    }

    // Filter by rating
    if (criteria.rating) {
      const ratedIds = new Set<string>();
      candidateIds.forEach(id => {
        const supplier = this.suppliers.get(id);
        if (supplier && supplier.reputation.rating >= criteria.rating!) {
          ratedIds.add(id);
        }
      });
      candidateIds = ratedIds;
    }

    // Convert to array and get supplier objects
    const suppliers = Array.from(candidateIds)
      .map(id => this.suppliers.get(id))
      .filter(Boolean) as SupplierProfile[];

    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 50;

    return suppliers.slice(offset, offset + limit);
  }

  /**
   * Add a product to supplier catalog
   */
  async addSupplierProduct(productData: Omit<SupplierProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierProduct> {
    const productId = `product_${Date.now()}_${Math.random()}`;

    const product: SupplierProduct = {
      id: productId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...productData
    };

    // Add to supplier's product list
    if (!this.supplierProducts.has(product.supplierId)) {
      this.supplierProducts.set(product.supplierId, []);
    }
    this.supplierProducts.get(product.supplierId)!.push(product);

    await eventBus.publish(createEvent('SUPPLIER_PRODUCT_ADDED', {
      product: { ...product }
    }, {
      source: 'SupplierOnboardingEngine'
    }));

    return product;
  }

  /**
   * Search supplier products
   */
  async searchSupplierProducts(searchCriteria: {
    supplierId?: string;
    country?: string; // Filter suppliers by country first, then their products
    query?: string;
    category?: string;
    inStock?: boolean;
    limit?: number;
  }): Promise<SupplierProduct[]> {
    let products: SupplierProduct[] = [];

    if (searchCriteria.supplierId) {
      // Search specific supplier's products
      products = this.supplierProducts.get(searchCriteria.supplierId) || [];
    } else {
      // Search across all suppliers (with country filter)
      const supplierCriteria: SupplierSearchCriteria = {
        country: searchCriteria.country,
        verifiedOnly: true
      };

      const suppliers = await this.searchSuppliers(supplierCriteria);

      suppliers.forEach(supplier => {
        const supplierProducts = this.supplierProducts.get(supplier.id) || [];
        products.push(...supplierProducts);
      });
    }

    // Filter by search query
    if (searchCriteria.query) {
      const query = searchCriteria.query.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (searchCriteria.category) {
      products = products.filter(p => p.category === searchCriteria.category);
    }

    // Filter by stock availability
    if (searchCriteria.inStock !== undefined) {
      products = products.filter(p => p.availability.inStock === searchCriteria.inStock);
    }

    // Apply limit
    const limit = searchCriteria.limit || 100;
    return products.slice(0, limit);
  }

  /**
   * Upload verification document
   */
  async uploadVerificationDocument(
    supplierId: string,
    documentType: SupplierDocument['type'],
    fileName: string,
    fileData: ArrayBuffer
  ): Promise<SupplierDocument> {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) {
      throw new Error(`Supplier ${supplierId} not found`);
    }

    // Upload to IPFS (mock implementation)
    const ipfsHash = await this.uploadToIPFS(fileData);

    const document: SupplierDocument = {
      id: `doc_${Date.now()}_${Math.random()}`,
      type: documentType,
      name: fileName,
      url: ipfsHash,
      uploadedAt: Date.now(),
      verified: false
    };

    supplier.verificationDocuments.push(document);
    supplier.updatedAt = Date.now();

    await eventBus.publish(createEvent('SUPPLIER_DOCUMENT_UPLOADED', {
      supplierId,
      document: { ...document }
    }, {
      source: 'SupplierOnboardingEngine'
    }));

    return document;
  }

  /**
   * Initiate supplier verification process
   */
  private async initiateVerification(supplierId: string): Promise<void> {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) return;

    supplier.verificationStatus = SupplierVerificationStatus.PENDING_VERIFICATION;

    // Automated verification checks
    const autoChecks = await this.performAutomatedVerification(supplier);

    if (autoChecks.allPassed) {
      // Auto-verify if all checks pass
      await this.verifySupplier(supplierId, 'Automated verification passed');
    } else {
      // Manual review required
      await eventBus.publish(createEvent('SUPPLIER_VERIFICATION_NEEDED', {
        supplierId,
        issues: autoChecks.issues
      }, {
        source: 'SupplierOnboardingEngine',
        priority: 'high'
      }));
    }
  }

  /**
   * Perform automated verification checks
   */
  private async performAutomatedVerification(supplier: SupplierProfile): Promise<{
    allPassed: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check required documents
    const requiredDocs = ['business_license', 'tax_certificate'];
    if (supplier.compliance.insuranceRequired) {
      requiredDocs.push('insurance');
    }

    for (const docType of requiredDocs) {
      const hasDoc = supplier.verificationDocuments.some(doc => doc.type === docType);
      if (!hasDoc) {
        issues.push(`Missing required document: ${docType}`);
      }
    }

    // Check business license validity
    const licenseDoc = supplier.verificationDocuments.find(doc => doc.type === 'business_license');
    if (licenseDoc && licenseDoc.expiryDate && licenseDoc.expiryDate < Date.now()) {
      issues.push('Business license is expired');
    }

    // Check compliance with local regulations
    const complianceCheck = await complianceEngine.checkOperationCompliance(
      'supplier_registration',
      {
        businessId: supplierId,
        country: supplier.location.country,
        region: supplier.location.region,
        dataTypes: ['supplier_data']
      }
    );

    if (!complianceCheck.compliant) {
      issues.push(...complianceCheck.blockingFindings.map(f => f.description));
    }

    // Check wallet address validity (basic check)
    if (!supplier.walletAddress || !supplier.walletAddress.startsWith('0x')) {
      issues.push('Invalid wallet address format');
    }

    return {
      allPassed: issues.length === 0,
      issues
    };
  }

  /**
   * Verify supplier (admin action)
   */
  async verifySupplier(supplierId: string, verifiedBy: string): Promise<void> {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) {
      throw new Error(`Supplier ${supplierId} not found`);
    }

    supplier.verificationStatus = SupplierVerificationStatus.VERIFIED;
    supplier.verifiedAt = Date.now();
    supplier.updatedAt = Date.now();

    // Mark documents as verified
    supplier.verificationDocuments.forEach(doc => {
      doc.verified = true;
      doc.verifiedBy = verifiedBy;
      doc.verifiedAt = Date.now();
    });

    await eventBus.publish(createEvent('SUPPLIER_VERIFIED', {
      supplierId,
      verifiedBy
    }, {
      source: 'SupplierOnboardingEngine',
      priority: 'high'
    }));
  }

  /**
   * Add supplier to search indexes
   */
  private addToIndexes(supplier: SupplierProfile): void {
    // Country index
    if (!this.countryIndex.has(supplier.location.country)) {
      this.countryIndex.set(supplier.location.country, []);
    }
    this.countryIndex.get(supplier.location.country)!.push(supplier.id);

    // Type index
    if (!this.typeIndex.has(supplier.businessInfo.type)) {
      this.typeIndex.set(supplier.businessInfo.type, []);
    }
    this.typeIndex.get(supplier.businessInfo.type)!.push(supplier.id);
  }

  /**
   * Update supplier product index
   */
  private updateSupplierProductIndex(product: SupplierProduct): void {
    // Update any search indexes if needed
    console.log('SupplierOnboardingEngine: Product index updated', product.id);
  }

  /**
   * Mock IPFS upload (replace with real IPFS implementation)
   */
  private async uploadToIPFS(fileData: ArrayBuffer): Promise<string> {
    // Simulate IPFS upload delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock IPFS hash
    const hash = `Qm${Math.random().toString(36).substr(2, 44)}`;
    return `ipfs://${hash}`;
  }

  /**
   * Get supplier by ID
   */
  getSupplier(supplierId: string): SupplierProfile | null {
    return this.suppliers.get(supplierId) || null;
  }

  /**
   * Get supplier statistics
   */
  getSupplierStatistics(): {
    totalSuppliers: number;
    verifiedSuppliers: number;
    pendingVerification: number;
    countryBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
  } {
    const suppliers = Array.from(this.suppliers.values());
    const countryBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {};

    suppliers.forEach(supplier => {
      // Country breakdown
      countryBreakdown[supplier.location.country] =
        (countryBreakdown[supplier.location.country] || 0) + 1;

      // Type breakdown
      typeBreakdown[supplier.businessInfo.type] =
        (typeBreakdown[supplier.businessInfo.type] || 0) + 1;
    });

    return {
      totalSuppliers: suppliers.length,
      verifiedSuppliers: suppliers.filter(s => s.verificationStatus === SupplierVerificationStatus.VERIFIED).length,
      pendingVerification: suppliers.filter(s => s.verificationStatus === SupplierVerificationStatus.PENDING_VERIFICATION).length,
      countryBreakdown,
      typeBreakdown
    };
  }

  /**
   * Initialize the engine
   */
  initialize(): void {
    this.isInitialized = true;
    console.log('SupplierOnboardingEngine: Initialized');
  }

  /**
   * Shutdown the engine
   */
  shutdown(): void {
    this.isInitialized = false;
    console.log('SupplierOnboardingEngine: Shutdown');
  }
}

// Global supplier onboarding engine instance
export const supplierOnboardingEngine = new SupplierOnboardingEngine();