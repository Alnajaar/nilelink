/**
 * Decentralized Data Types
 * Complete type definitions for blockchain + IPFS data structures
 * 
 * ARCHITECTURE:
 * - Firebase: ONLY authentication (uid, email, phone, basic profile)
 * - Smart Contracts: All business logic & transactional data
 * - IPFS: File storage, metadata, rich content
 * - The Graph: Query layer for blockchain data (subgraph)
 */

// ============================================
// FIREBASE AUTH TYPES (ONLY FOR AUTH)
// ============================================

export interface FirebaseAuthUser {
    uid: string;
    email?: string | null;
    phone?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    emailVerified: boolean;
    // NO business data here - only auth
}

// ============================================
// ON-CHAIN USER PROFILE (SMART CONTRACT)
// ============================================

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'CASHIER' | 'MANAGER' | 'DRIVER' | 'SUPPLIER';

export interface OnChainUser {
    walletAddress: string; // Primary identifier
    firebaseUid?: string; // Link to Firebase Auth (optional)
    role: UserRole;
    country: string; // ISO code
    isActive: boolean;
    registeredAt: number; // blockchain timestamp
    businessId?: string; // Contract address or tokenId
    metadataURI: string; // IPFS URI for additional data
}

// IPFS Metadata for User
export interface UserMetadata {
    firstName?: string;
    lastName?: string;
    avatar?: string; // IPFS hash
    email?: string; // stored in IPFS, not on-chain
    phone?: string;
    preferences?: {
        language: string;
        currency: string;
        notifications: boolean;
    };
}

// ============================================
// BUSINESS (SMART CONTRACT NFT)
// ============================================

export type BusinessType = 'RESTAURANT' | 'CAFE' | 'SUPERMARKET' | 'RETAIL';
export type PlanTier = 'STARTER' | 'BUSINESS' | 'PREMIUM' | 'ENTERPRISE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface OnChainBusiness {
    tokenId: string; // NFT ID
    owner: string; // Wallet address
    businessType: BusinessType;
    country: string;
    plan: PlanTier;
    planExpiry: number; // Timestamp
    paymentStatus: PaymentStatus;
    isActive: boolean;
    activationCode?: string; // Encrypted on-chain
    registeredAt: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Business
export interface BusinessMetadata {
    name: string;
    nameAr?: string;
    description?: string;
    logo: string; // IPFS hash
    cover?: string; // IPFS hash
    taxNumber?: string;
    address: {
        street: string;
        city: string;
        state?: string;
        country: string;
        postalCode?: string;
        coordinates?: { lat: number; lng: number };
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    hours?: {
        [day: string]: { open: string; close: string } | null;
    };
    currency: string;
}

// ============================================
// EMPLOYEE (SMART CONTRACT)
// ============================================

export type EmployeeRole = 'CASHIER' | 'MANAGER' | 'KITCHEN' | 'WAITER';
export type SalaryType = 'FIXED' | 'HOURLY' | 'PER_ORDER';

export interface OnChainEmployee {
    id: string; // Contract-generated ID
    businessId: string; // Business contract address
    walletAddress: string; // Employee wallet
    firebaseUid?: string;
    role: EmployeeRole;
    salary: bigint; // In wei
    salaryType: SalaryType;
    isActive: boolean;
    hiredAt: number;
    terminatedAt?: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Employee
export interface EmployeeMetadata {
    firstName: string;
    lastName: string;
    photo?: string; // IPFS hash
    pinCodeHash: string; // Hash of PIN (never plaintext)
    workSchedule: {
        [day: string]: { start: string; end: string } | null;
    };
    performanceScore: number;
    ratings: number[];
    bonuses: Array<{
        amount: string;
        reason: string;
        date: number;
        approvedBy: string;
    }>;
    penalties: Array<{
        amount: string;
        reason: string;
        date: number;
        approvedBy: string;
    }>;
}

// ============================================
// PRODUCT (SMART CONTRACT + IPFS)
// ============================================

export interface OnChainProduct {
    id: string; // Contract-generated ID or tokenId
    businessId: string;
    sku: string;
    barcode?: string;
    price: bigint; // In wei
    cost: bigint; // In wei
    stock: number;
    minStock: number;
    supplierId?: string; // Supplier contract address
    isActive: boolean;
    createdAt: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Product
export interface ProductMetadata {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    category: string;
    categoryAr?: string;
    images: string[]; // IPFS hashes
    unit: string;
    recipe?: Array<{
        ingredientId: string;
        quantity: number;
        unit: string;
    }>;
    allergens?: string[];
    calories?: number;
    preparationTime?: number;
    tags?: string[];
}

// ============================================
// ORDER (SMART CONTRACT - IMMUTABLE)
// ============================================

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OnChainOrder {
    id: string; // Contract-generated ID
    businessId: string;
    employeeId: string; // Wallet address
    customerId?: string; // Wallet address
    subtotal: bigint;
    tax: bigint;
    discount: bigint;
    total: bigint;
    paymentMethod: string;
    status: OrderStatus;
    country: string;
    createdAt: number;
    completedAt?: number;
    metadataURI: string; // IPFS URI for items & details
}

// IPFS Metadata for Order
export interface OrderMetadata {
    invoiceNumber: string;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: string; // BigNumber string
        total: string;
        notes?: string;
    }>;
    tableNumber?: string;
    deliveryId?: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    deliveryAddress?: {
        street: string;
        city: string;
        country: string;
        coordinates?: { lat: number; lng: number };
    };
}

// ============================================
// SUPPLIER (SMART CONTRACT)
// ============================================

export interface OnChainSupplier {
    id: string; // Contract address or tokenId
    walletAddress: string;
    country: string;
    commissionRate: number; // Basis points (e.g., 500 = 5%)
    performanceScore: number;
    isActive: boolean;
    registeredAt: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Supplier
export interface SupplierMetadata {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    taxNumber?: string;
    address: string;
    productCategories: string[];
    bankDetails?: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        iban?: string;
    };
}

// ============================================
// DRIVER (SMART CONTRACT)
// ============================================

export type VehicleType = 'CAR' | 'MOTORBIKE' | 'BICYCLE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';

export interface OnChainDriver {
    id: string;
    walletAddress: string;
    vehicleType: VehicleType;
    employmentType: EmploymentType;
    baseSalary: bigint;
    perDeliveryRate: bigint;
    performanceScore: number;
    totalDeliveries: number;
    completedDeliveries: number;
    isActive: boolean;
    registeredAt: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Driver
export interface DriverMetadata {
    firstName: string;
    lastName: string;
    photo?: string; // IPFS hash
    phone: string;
    licenseNumber: string;
    licensePlate?: string;
    emergencyContact: string;
    emergencyPhone: string;
    ratings: number[];
    complaints: number;
    bonuses: Array<{
        amount: string;
        reason: string;
        date: number;
    }>;
    penalties: Array<{
        amount: string;
        reason: string;
        date: number;
    }>;
}

// ============================================
// DELIVERY (SMART CONTRACT)
// ============================================

export type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface OnChainDelivery {
    id: string;
    orderId: string;
    driverId: string; // Wallet address
    customerId: string; // Wallet address
    businessId: string;
    status: DeliveryStatus;
    estimatedTime?: number;
    actualPickupTime?: number;
    actualDeliveryTime?: number;
    driverEarnings: bigint;
    customerRating?: number;
    createdAt: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Delivery
export interface DeliveryMetadata {
    pickupAddress: {
        street: string;
        city: string;
        coordinates: { lat: number; lng: number };
    };
    deliveryAddress: {
        street: string;
        city: string;
        coordinates: { lat: number; lng: number };
    };
    distance?: number; // km
    notes?: string;
    customerFeedback?: string;
    proofOfDelivery?: string; // IPFS hash (photo)
}

// ============================================
// CUSTOMER LOYALTY (SMART CONTRACT)
// ============================================

export interface OnChainCustomer {
    walletAddress: string;
    firebaseUid?: string;
    loyaltyPoints: bigint;
    totalOrders: number;
    totalSpent: bigint;
    tier?: string;
    isActive: boolean;
    joinedAt: number;
    metadataURI: string; // IPFS URI
}

// IPFS Metadata for Customer
export interface CustomerMetadata {
    firstName?: string;
    lastName?: string;
    avatar?: string; // IPFS hash
    preferences: {
        favoriteBusinesses: string[];
        dietaryRestrictions: string[];
        allergies: string[];
    };
    addresses: Array<{
        label: string;
        street: string;
        city: string;
        country: string;
        coordinates?: { lat: number; lng: number };
        isDefault: boolean;
    }>;
}

// ============================================
// CONSENT (ON-CHAIN HASH + IPFS CONTENT)
// ============================================

export type ConsentType =
    | 'TERMS_OF_SERVICE'
    | 'DATA_PROCESSING'
    | 'AI_RECOMMENDATIONS'
    | 'PERFORMANCE_TRACKING'
    | 'MARKETING'
    | 'LOYALTY_PROGRAM';

export interface OnChainConsent {
    userId: string; // Wallet address
    consentType: ConsentType;
    version: string;
    contentHash: string; // IPFS hash of the consent text
    accepted: boolean;
    acceptedAt: number;
    withdrawnAt?: number;
    ipHash?: string; // Hash of IP (privacy)
}

// IPFS Consent Content
export interface ConsentContent {
    type: ConsentType;
    version: string;
    textEn: string;
    textAr: string;
    effectiveDate: string;
    expiryDate?: string;
}

// ============================================
// COUNTRY COMPLIANCE (ON-CHAIN CONFIG)
// ============================================

export interface OnChainCountryCompliance {
    countryCode: string; // ISO code
    vatRate: number; // Basis points
    minimumWage?: bigint; // In wei
    currency: string;
    dataRetentionDays: number;
    configURI: string; // IPFS URI for detailed rules
}

// IPFS Compliance Config
export interface ComplianceConfig {
    countryName: string;
    countryNameAr: string;
    taxExemptions: string[];
    laborRules: {
        maxHoursPerWeek: number;
        overtimeMultiplier: number;
        mandatoryBreaks: boolean;
        paidLeave: number;
    };
    legalRequirements: {
        taxInvoiceRequired: boolean;
        receiptFormat: string;
        businessRegistrationRequired: boolean;
    };
    updatedAt: string;
}

// ============================================
// PLAN FEATURES (ON-CHAIN CONFIG)
// ============================================

export interface OnChainPlanFeatures {
    plan: PlanTier;
    price: bigint; // In wei
    billingPeriod: 'MONTHLY' | 'YEARLY';
    maxEmployees: number;
    maxProducts: number;
    maxLocations: number;
    featuresHash: string; // IPFS hash of detailed features
}

// IPFS Plan Features
export interface PlanFeaturesDetail {
    plan: PlanTier;
    features: string[];
    aiRecommendations: boolean;
    deliveryEnabled: boolean;
    loyaltyEnabled: boolean;
    inventoryManagement: boolean;
    reportingAdvanced: boolean;
    apiAccess: boolean;
    description: string;
    descriptionAr: string;
}

// ============================================
// THE GRAPH QUERY TYPES
// ============================================

export interface SubgraphQueryResult<T> {
    data?: T;
    errors?: Array<{ message: string }>;
}

export interface PaginationParams {
    first: number;
    skip: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}

// ============================================
// IPFS UPLOAD TYPES
// ============================================

export interface IPFSUploadResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
    isDuplicate?: boolean;
}

export interface PinataMetadata {
    name?: string;
    keyvalues?: { [key: string]: string };
}

// ============================================
// SMART CONTRACT EVENT TYPES
// ============================================

export interface BusinessCreatedEvent {
    tokenId: string;
    owner: string;
    businessType: BusinessType;
    plan: PlanTier;
    timestamp: number;
}

export interface OrderCreatedEvent {
    orderId: string;
    businessId: string;
    employeeId: string;
    total: bigint;
    timestamp: number;
}

export interface PaymentProcessedEvent {
    orderId: string;
    paymentMethod: string;
    amount: bigint;
    timestamp: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    txHash?: string; // If blockchain transaction
    ipfsHash?: string; // If IPFS upload
}

export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidRole(role: string): role is UserRole {
    const VALID_ROLES: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN', 'CASHIER', 'MANAGER', 'DRIVER', 'SUPPLIER'];
    return VALID_ROLES.includes(role as UserRole);
}

export function isAdmin(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role: UserRole): boolean {
    return role === 'SUPER_ADMIN';
}

export function isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidIpfsHash(hash: string): boolean {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || /^bafy[a-z2-7]{55}$/.test(hash);
}
