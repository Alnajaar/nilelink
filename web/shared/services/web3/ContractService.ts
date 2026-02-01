/**
 * ContractService.ts
 * Smart Contract Integration Service
 * 
 * Provides role verification, contract interaction, and caching
 * for blockchain-backed authorization across all apps
 */

import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';

// Role constants matching smart contract
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  VENDOR = 'VENDOR',
  SUPPLIER = 'SUPPLIER',
  PROTOCOL_ADMIN = 'PROTOCOL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  GOVERNANCE_ROLE = 'GOVERNANCE_ROLE'
}

// Contract ABIs
const RESTAURANT_REGISTRY_ABI = [
  'function getRestaurant(address owner) view returns (tuple(address owner, string name, string cuisine, bool active) restaurant)',
  'function isRestaurantOwner(address owner) view returns (bool)',
  'function getOwnerRestaurants(address owner) view returns (address[])',
];

const DELIVERY_COORDINATOR_ABI = [
  'function isDriver(address driver) view returns (bool)',
  'function getDriverInfo(address driver) view returns (tuple(address driver, bool active, uint256 deliveries) info)',
];

const SUPPLIER_REGISTRY_ABI = [
  'function isSupplier(address supplier) view returns (bool)',
  'function getSupplierInfo(address supplier) view returns (tuple(address supplier, string name, bool active) info)',
];

const PROTOCOL_ABI = [
  'function owner() view returns (address)',
  'function governance(address account) view returns (bool)',
  'function authorizedCallers(address caller) view returns (bool)',
];

interface CacheEntry {
  role: UserRole | null;
  timestamp: number;
  ttl: number;
}

interface RoleCache {
  [key: string]: CacheEntry;
}

class ContractService {
  private static instance: ContractService;
  private roleCache: RoleCache = {};
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;

  // Contract addresses (from environment or deployments)
  private restaurantRegistryAddress = process.env.NEXT_PUBLIC_RESTAURANT_REGISTRY_ADDRESS || '';
  private deliveryCoordinatorAddress = process.env.NEXT_PUBLIC_DELIVERY_COORDINATOR_ADDRESS || '';
  private supplierRegistryAddress = process.env.NEXT_PUBLIC_SUPPLIER_REGISTRY_ADDRESS || '';
  private protocolAddress = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS || '';

  private constructor() { }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  /**
   * Initialize provider and signer
   */
  async initialize(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    this.provider = new BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
  }

  /**
   * Get user role from smart contracts
   * Checks multiple contract sources and returns first matching role
   */
  async getRole(address: string): Promise<UserRole | null> {
    const cacheKey = `${address}:role`;

    // Check cache
    if (this.isCacheValid(cacheKey)) {
      return this.roleCache[cacheKey]?.role || null;
    }

    try {
      if (!this.provider) {
        await this.initialize();
      }

      // Check protocol ownership/governance
      const protocolRole = await this.checkProtocolRole(address);
      if (protocolRole) {
        this.setCacheEntry(cacheKey, protocolRole);
        return protocolRole;
      }

      // Check restaurant ownership and manager status
      if (this.restaurantRegistryAddress) {
        const isOwner = await this.checkRestaurantOwner(address);
        if (isOwner) {
          this.setCacheEntry(cacheKey, UserRole.OWNER);
          return UserRole.OWNER;
        }

        // Check if manager (requires contract support for getManagerStatus)
        const isManager = await this.checkRestaurantManager(address);
        if (isManager) {
          this.setCacheEntry(cacheKey, UserRole.MANAGER);
          return UserRole.MANAGER;
        }
      }

      // Check driver status
      if (this.deliveryCoordinatorAddress) {
        if (await this.checkDriver(address)) {
          this.setCacheEntry(cacheKey, UserRole.DRIVER);
          return UserRole.DRIVER;
        }
      }

      // Check supplier status
      if (this.supplierRegistryAddress) {
        if (await this.checkSupplier(address)) {
          this.setCacheEntry(cacheKey, UserRole.SUPPLIER);
          return UserRole.SUPPLIER;
        }
      }

      // Default to CUSTOMER if no other role found
      this.setCacheEntry(cacheKey, UserRole.CUSTOMER);
      return UserRole.CUSTOMER;
    } catch (error) {
      console.error(`Error getting role for ${address}:`, error);
      // Return null on error to prevent stale cache
      return null;
    }
  }

  /**
   * Verify user has required role
   */
  async verifyRole(address: string, requiredRole: UserRole | UserRole[]): Promise<boolean> {
    const userRole = await this.getRole(address);

    if (!userRole) {
      return false;
    }

    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return requiredRoles.includes(userRole);
  }

  /**
   * Get user's complete profile from contracts
   */
  async getUserProfile(address: string): Promise<{
    address: string;
    role: UserRole | null;
    isRestaurantOwner: boolean;
    isDriver: boolean;
    isSupplier: boolean;
    restaurantName?: string;
    driverDeliveries?: number;
    supplierName?: string;
  }> {
    if (!this.provider) {
      await this.initialize();
    }

    const role = await this.getRole(address);

    const profile: any = {
      address,
      role,
      isRestaurantOwner: false,
      isDriver: false,
      isSupplier: false,
    };

    try {
      // Get restaurant info if owner
      if (this.restaurantRegistryAddress && role === UserRole.OWNER) {
        const restaurant = await this.getRestaurantInfo(address);
        if (restaurant) {
          profile.isRestaurantOwner = true;
          profile.restaurantName = restaurant.name;
        }
      }

      // Get driver info
      if (this.deliveryCoordinatorAddress && role === UserRole.DRIVER) {
        const driverInfo = await this.getDriverInfo(address);
        if (driverInfo) {
          profile.isDriver = true;
          profile.driverDeliveries = driverInfo.deliveries;
        }
      }

      // Get supplier info
      if (this.supplierRegistryAddress && role === UserRole.SUPPLIER) {
        const supplierInfo = await this.getSupplierInfo(address);
        if (supplierInfo) {
          profile.isSupplier = true;
          profile.supplierName = supplierInfo.name;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile details:', error);
    }

    return profile;
  }

  /**
   * Clear role cache for specific address
   */
  clearCache(address?: string): void {
    if (address) {
      const cacheKey = `${address}:role`;
      delete this.roleCache[cacheKey];
    } else {
      this.roleCache = {};
    }
  }

  // Private methods

  private async checkProtocolRole(address: string): Promise<UserRole | null> {
    if (!this.protocolAddress) {
      return null;
    }

    try {
      const protocol = new Contract(
        this.protocolAddress,
        PROTOCOL_ABI,
        this.provider
      );

      // Check if owner
      const owner = await protocol.owner();
      if (owner.toLowerCase() === address.toLowerCase()) {
        return UserRole.SUPER_ADMIN;
      }

      // Check if governance
      const isGovernance = await protocol.governance(address);
      if (isGovernance) {
        return UserRole.GOVERNANCE_ROLE;
      }

      // Check if authorized caller (admin)
      const isAuthorized = await protocol.authorizedCallers(address);
      if (isAuthorized) {
        return UserRole.PROTOCOL_ADMIN;
      }
    } catch (error) {
      console.warn('Error checking protocol role:', error);
    }

    return null;
  }

  private async checkRestaurantOwner(address: string): Promise<boolean> {
    if (!this.restaurantRegistryAddress) {
      return false;
    }

    try {
      const registry = new Contract(
        this.restaurantRegistryAddress,
        RESTAURANT_REGISTRY_ABI,
        this.provider
      );

      return await registry.isRestaurantOwner(address);
    } catch (error) {
      console.warn('Error checking restaurant owner:', error);
      return false;
    }
  }

  private async checkRestaurantManager(address: string): Promise<boolean> {
    if (!this.restaurantRegistryAddress) {
      return false;
    }

    try {
      const registry = new Contract(
        this.restaurantRegistryAddress,
        RESTAURANT_REGISTRY_ABI,
        this.provider
      );

      // Try to call isManager if available, otherwise return false
      if (typeof (registry as any).isManager === 'function') {
        return await (registry as any).isManager(address);
      }
      return false;
    } catch (error) {
      // Method may not exist - that's okay
      return false;
    }
  }

  private async checkDriver(address: string): Promise<boolean> {
    if (!this.deliveryCoordinatorAddress) {
      return false;
    }

    try {
      const coordinator = new Contract(
        this.deliveryCoordinatorAddress,
        DELIVERY_COORDINATOR_ABI,
        this.provider
      );

      return await coordinator.isDriver(address);
    } catch (error) {
      console.warn('Error checking driver status:', error);
      return false;
    }
  }

  private async checkSupplier(address: string): Promise<boolean> {
    if (!this.supplierRegistryAddress) {
      return false;
    }

    try {
      const registry = new Contract(
        this.supplierRegistryAddress,
        SUPPLIER_REGISTRY_ABI,
        this.provider
      );

      return await registry.isSupplier(address);
    } catch (error) {
      console.warn('Error checking supplier status:', error);
      return false;
    }
  }

  private async getRestaurantInfo(address: string): Promise<{ name: string } | null> {
    if (!this.restaurantRegistryAddress) {
      return null;
    }

    try {
      const registry = new Contract(
        this.restaurantRegistryAddress,
        RESTAURANT_REGISTRY_ABI,
        this.provider
      );

      const restaurant = await registry.getRestaurant(address);
      return { name: restaurant.name };
    } catch (error) {
      console.warn('Error getting restaurant info:', error);
      return null;
    }
  }

  private async getDriverInfo(address: string): Promise<{ deliveries: number } | null> {
    if (!this.deliveryCoordinatorAddress) {
      return null;
    }

    try {
      const coordinator = new Contract(
        this.deliveryCoordinatorAddress,
        DELIVERY_COORDINATOR_ABI,
        this.provider
      );

      const info = await coordinator.getDriverInfo(address);
      return { deliveries: Number(info.deliveries) };
    } catch (error) {
      console.warn('Error getting driver info:', error);
      return null;
    }
  }

  private async getSupplierInfo(address: string): Promise<{ name: string } | null> {
    if (!this.supplierRegistryAddress) {
      return null;
    }

    try {
      const registry = new Contract(
        this.supplierRegistryAddress,
        SUPPLIER_REGISTRY_ABI,
        this.provider
      );

      const info = await registry.getSupplierInfo(address);
      return { name: info.name };
    } catch (error) {
      console.warn('Error getting supplier info:', error);
      return null;
    }
  }

  private isCacheValid(key: string): boolean {
    const entry = this.roleCache[key];
    if (!entry) {
      return false;
    }

    const age = Date.now() - entry.timestamp;
    return age < entry.ttl;
  }

  private setCacheEntry(key: string, role: UserRole | null): void {
    this.roleCache[key] = {
      role,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
    };
  }
  // ============================================
  // ADMIN ACTIONS
  // ============================================

  /**
   * Approve a business payment (Manual Admin Override)
   */
  async approveBusinessPayment(businessId: string): Promise<string> {
    if (!this.signer) await this.initialize();

    // Using Restaurant Registry as the main business contract for now
    const contract = new Contract(
      this.restaurantRegistryAddress,
      [...RESTAURANT_REGISTRY_ABI, 'function approvePayment(string memory businessId) external'],
      this.signer
    );

    const tx = await contract.approvePayment(businessId);
    await tx.wait();
    return tx.hash;
  }

  /**
   * Deactivate a business (Emergency Stop)
   */
  async deactivateBusiness(businessId: string): Promise<string> {
    if (!this.signer) await this.initialize();

    const contract = new Contract(
      this.restaurantRegistryAddress,
      [...RESTAURANT_REGISTRY_ABI, 'function setBusinessActive(string memory businessId, bool active) external'],
      this.signer
    );

    const tx = await contract.setBusinessActive(businessId, false);
    await tx.wait();
    return tx.hash;
  }

  /**
   * Generate an activation code on-chain
   */
  async generateActivationCode(businessId: string): Promise<string> {
    if (!this.signer) await this.initialize();

    const contract = new Contract(
      this.restaurantRegistryAddress,
      [...RESTAURANT_REGISTRY_ABI, 'function generateActivationCode(string memory businessId) external returns (string memory)'],
      this.signer
    );

    // This might be a view or a transaction depending on implementation
    // Assuming transaction for state change (emitting event)
    const tx = await contract.generateActivationCode(businessId);
    const receipt = await tx.wait();

    // In a real scenario, we'd parse logs to get the code, 
    // or if it's a view, we'd just return it. 
    // For "real" code structure, we return the transaction hash.
    return tx.hash;
  }
}

export const contractService = ContractService.getInstance();
export default contractService;
