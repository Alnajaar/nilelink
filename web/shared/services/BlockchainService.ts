/**
 * BlockchainService.ts
 * 
 * Main service to interact with the NileLink Protocol smart contracts
 * Provides a unified interface for all blockchain operations across the ecosystem
 */

import { ethers } from 'ethers';
import { 
  NileLinkProtocol__factory, 
  RestaurantRegistry__factory, 
  OrderSettlement__factory,
  DeliveryCoordinator__factory,
  SupplyChain__factory
} from '../../contracts/types'; // Assuming typechain-generated types

// Define contract addresses (these would come from deployment artifacts in production)
const CONTRACT_ADDRESSES = {
  nileLinkProtocol: process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS || '',
  restaurantRegistry: process.env.NEXT_PUBLIC_RESTAURANT_REGISTRY_ADDRESS || '',
  orderSettlement: process.env.NEXT_PUBLIC_ORDER_SETTLEMENT_ADDRESS || '',
  deliveryCoordinator: process.env.NEXT_PUBLIC_DELIVERY_COORDINATOR_ADDRESS || '',
  supplyChain: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_ADDRESS || '',
};

export interface OrderDetails {
  orderId: string;
  restaurant: string;
  customer: string;
  amountUsd6: string;
  method: number;
}

export interface DeliveryOrderDetails {
  orderId: string;
  restaurant: string;
  customer: string;
  zoneId: number;
  priority: number;
}

export interface PurchaseOrderDetails {
  orderId: string;
  restaurant: string;
  supplier: string;
  totalAmount: string;
  currency: string;
}

class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  
  // Contract instances
  private nileLinkProtocol: any = null;
  private restaurantRegistry: any = null;
  private orderSettlement: any = null;
  private deliveryCoordinator: any = null;
  private supplyChain: any = null;

  /**
   * Initialize the blockchain service with a provider/signer
   */
  async initialize(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || (provider as any).getSigner ? await (provider as any).getSigner() : null;
    
    // Initialize contract instances
    await this.initContracts();
  }

  /**
   * Initialize all contract instances
   */
  private async initContracts() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    // Initialize main protocol contract
    if (CONTRACT_ADDRESSES.nileLinkProtocol) {
      this.nileLinkProtocol = NileLinkProtocol__factory.connect(
        CONTRACT_ADDRESSES.nileLinkProtocol,
        this.signer || this.provider
      );
    }

    // Initialize restaurant registry
    if (CONTRACT_ADDRESSES.restaurantRegistry) {
      this.restaurantRegistry = RestaurantRegistry__factory.connect(
        CONTRACT_ADDRESSES.restaurantRegistry,
        this.signer || this.provider
      );
    }

    // Initialize order settlement
    if (CONTRACT_ADDRESSES.orderSettlement) {
      this.orderSettlement = OrderSettlement__factory.connect(
        CONTRACT_ADDRESSES.orderSettlement,
        this.signer || this.provider
      );
    }

    // Initialize delivery coordinator
    if (CONTRACT_ADDRESSES.deliveryCoordinator) {
      this.deliveryCoordinator = DeliveryCoordinator__factory.connect(
        CONTRACT_ADDRESSES.deliveryCoordinator,
        this.signer || this.provider
      );
    }

    // Initialize supply chain
    if (CONTRACT_ADDRESSES.supplyChain) {
      this.supplyChain = SupplyChain__factory.connect(
        CONTRACT_ADDRESSES.supplyChain,
        this.signer || this.provider
      );
    }
  }

  /**
   * Check if the service is properly initialized
   */
  isInitialized(): boolean {
    return !!this.provider && !!this.nileLinkProtocol;
  }

  /**
   * Get protocol statistics from blockchain
   */
  async getProtocolStats() {
    if (!this.nileLinkProtocol) {
      throw new Error('NileLinkProtocol contract not initialized');
    }
    
    try {
      const stats = await this.nileLinkProtocol.getProtocolStats();
      return {
        totalRestaurants: stats.totalRestaurants.toString(),
        totalOrders: stats.totalOrders.toString(),
        totalVolumeUsd6: stats.totalVolumeUsd6.toString(),
        activeDisputes: stats.activeDisputes.toString(),
        totalInvestmentsUsd6: stats.totalInvestmentsUsd6.toString(),
        protocolFeesCollectedUsd6: stats.protocolFeesCollectedUsd6.toString(),
      };
    } catch (error) {
      console.error('Error getting protocol stats:', error);
      throw error;
    }
  }

  /**
   * Register a restaurant on-chain
   */
  async registerRestaurant(
    metadataCid: string,
    catalogCid: string,
    country: string,
    localCurrency: string,
    dailyRateLimitUsd6: string,
    businessType: string,
    plan: string
  ) {
    if (!this.restaurantRegistry) {
      throw new Error('RestaurantRegistry contract not initialized');
    }

    try {
      // Convert string values to appropriate types
      const limit = ethers.parseUnits(dailyRateLimitUsd6, 6); // 6 decimals for USD
    
      const tx = await this.restaurantRegistry.registerRestaurant(
        ethers.hexlify(ethers.toUtf8Bytes(country)).padEnd(66, '0'),
        ethers.hexlify(ethers.toUtf8Bytes(localCurrency)).padEnd(66, '0'),
        limit,
        businessType,
        plan,
        metadataCid,
        catalogCid
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error registering restaurant:', error);
      throw error;
    }
  }

  /**
   * Create and pay an order on-chain
   */
  async createAndPayOrder(orderDetails: OrderDetails) {
    if (!this.nileLinkProtocol) {
      throw new Error('NileLinkProtocol contract not initialized');
    }

    try {
      const tx = await this.nileLinkProtocol.createAndPayOrder(
        orderDetails.orderId, // bytes16
        orderDetails.restaurant,
        orderDetails.customer,
        BigInt(orderDetails.amountUsd6),
        orderDetails.method
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error creating and paying order:', error);
      throw error;
    }
  }

  /**
   * Create a delivery order on-chain
   */
  async createDeliveryOrder(deliveryDetails: DeliveryOrderDetails) {
    if (!this.deliveryCoordinator) {
      throw new Error('DeliveryCoordinator contract not initialized');
    }

    try {
      const tx = await this.deliveryCoordinator.createDeliveryOrder(
        deliveryDetails.orderId, // bytes16
        deliveryDetails.restaurant,
        deliveryDetails.customer,
        deliveryDetails.zoneId,
        deliveryDetails.priority
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error creating delivery order:', error);
      throw error;
    }
  }

  /**
   * Create a purchase order on-chain (for B2B operations)
   */
  async createPurchaseOrder(purchaseOrderDetails: PurchaseOrderDetails) {
    if (!this.supplyChain) {
      throw new Error('SupplyChain contract not initialized');
    }

    try {
      // Convert currency string to bytes3
      const currencyBytes = ethers.hexlify(ethers.toUtf8Bytes(purchaseOrderDetails.currency)).padEnd(8, '0');
      
      const tx = await this.supplyChain.createPurchaseOrder(
        purchaseOrderDetails.orderId, // bytes16
        purchaseOrderDetails.restaurant,
        purchaseOrderDetails.supplier,
        BigInt(purchaseOrderDetails.totalAmount),
        currencyBytes
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  /**
   * Get restaurant details from blockchain
   */
  async getRestaurantDetails(restaurantAddress: string) {
    if (!this.restaurantRegistry) {
      throw new Error('RestaurantRegistry contract not initialized');
    }

    try {
      const restaurant = await this.restaurantRegistry.getRestaurant(restaurantAddress);
      return {
        address: restaurantAddress,
        metadataCid: restaurant.metadataCid,
        catalogCid: restaurant.catalogCid,
        country: ethers.toUtf8String(restaurant.country),
        localCurrency: ethers.toUtf8String(restaurant.localCurrency),
        dailyRateLimitUsd6: restaurant.dailyRateLimitUsd6.toString(),
        status: restaurant.status,
        owner: restaurant.owner,
        commissionRate: parseFloat(restaurant.commissionRate.toString()) / 100, // Assuming it's in basis points
        settlementWallet: restaurant.settlementWallet,
        tokenId: restaurant.tokenId.toString(),
        businessType: restaurant.businessType,
        plan: restaurant.plan,
      };
    } catch (error) {
      console.error('Error getting restaurant details:', error);
      throw error;
    }
  }

  /**
   * Get order details from blockchain
   */
  async getOrderDetails(orderId: string) {
    if (!this.orderSettlement) {
      throw new Error('OrderSettlement contract not initialized');
    }

    try {
      const order = await this.orderSettlement.getOrder(orderId);
      return {
        orderId: orderId,
        restaurant: order.restaurant,
        customer: order.customer,
        amount: order.amount.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toString(),
        completedAt: order.completedAt.toString(),
      };
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }

  /**
   * Get delivery details from blockchain
   */
  async getDeliveryDetails(orderId: string) {
    if (!this.deliveryCoordinator) {
      throw new Error('DeliveryCoordinator contract not initialized');
    }

    try {
      const delivery = await this.deliveryCoordinator.getDeliveryOrder(orderId);
      return {
        orderId: orderId,
        restaurant: delivery.restaurant,
        customer: delivery.customer,
        assignedDriver: delivery.assignedDriver,
        status: delivery.status,
        zoneId: delivery.zoneId,
        priority: delivery.priority,
        createdAt: delivery.createdAt.toString(),
        assignedAt: delivery.assignedAt.toString(),
        deliveredAt: delivery.deliveredAt.toString(),
      };
    } catch (error) {
      console.error('Error getting delivery details:', error);
      throw error;
    }
  }

  /**
   * Get purchase order details from blockchain
   */
  async getPurchaseOrderDetails(orderId: string) {
    if (!this.supplyChain) {
      throw new Error('SupplyChain contract not initialized');
    }

    try {
      const po = await this.supplyChain.getPurchaseOrder(orderId);
      return {
        orderId: orderId,
        restaurant: po.restaurant,
        supplier: po.supplier,
        status: po.status,
        totalAmount: po.totalAmount.toString(),
        currency: ethers.toUtf8String(po.currency),
        createdAt: po.createdAt.toString(),
        approvedAt: po.approvedAt.toString(),
        fulfilledAt: po.fulfilledAt.toString(),
        dueDate: po.dueDate.toString(),
        creditUsed: po.creditUsed.toString(),
      };
    } catch (error) {
      console.error('Error getting purchase order details:', error);
      throw error;
    }
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  /**
   * Check if an address has governance rights
   */
  async isGovernance(address: string): Promise<boolean> {
    if (!this.nileLinkProtocol) {
      throw new Error('NileLinkProtocol contract not initialized');
    }

    try {
      return await this.nileLinkProtocol.governance(address);
    } catch (error) {
      console.error('Error checking governance status:', error);
      return false;
    }
  }

  /**
   * Update protocol fee (governance only)
   */
  async updateProtocolFee(newFeeBps: number) {
    if (!this.nileLinkProtocol) {
      throw new Error('NileLinkProtocol contract not initialized');
    }

    try {
      const tx = await this.nileLinkProtocol.updateProtocolFee(newFeeBps);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error updating protocol fee:', error);
      throw error;
    }
  }

  /**
   * Emergency pause all protocol components (governance only)
   */
  async emergencyPause() {
    if (!this.nileLinkProtocol) {
      throw new Error('NileLinkProtocol contract not initialized');
    }

    try {
      const tx = await this.nileLinkProtocol.emergencyPause();
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error pausing protocol:', error);
      throw error;
    }
  }

  /**
   * Emergency unpause all protocol components (owner only)
   */
  async emergencyUnpause() {
    if (!this.nileLinkProtocol) {
      throw new Error('NileLinkProtocol contract not initialized');
    }

    try {
      const tx = await this.nileLinkProtocol.emergencyUnpause();
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash, receipt };
    } catch (error) {
      console.error('Error unpausing protocol:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export the class for direct instantiation if needed
export default BlockchainService;