/**
 * The Graph Service
 * Query layer for blockchain data using The Graph Protocol subgraph
 * 
 * USE CASES:
 * - Query businesses by owner
 * - Get all products for a business
 * - Fetch order history
 * - Get employee list
 * - Query delivery status
 * - Fetch customer loyalty points
 */

import { SubgraphQueryResult, PaginationParams } from '../types/database';

// The Graph endpoint from environment
const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_GRAPH_AMOY_ENDPOINT ||
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/PASTE_YOUR_ID_HERE/nilelink-amoy/version/latest';

export class GraphService {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || SUBGRAPH_URL;

    if (!this.endpoint || this.endpoint.includes('YOUR_SUBGRAPH_ID')) {
      console.warn('[Graph Service] Warning: Subgraph URL not configured');
    }
  }

  /**
   * Execute GraphQL query
   */
  async query<T = any>(query: string, variables?: any): Promise<SubgraphQueryResult<T>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`Graph query failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('[Graph Service] Query errors:', result.errors);
      }

      return result as SubgraphQueryResult<T>;
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.warn('[Graph Service] Query aborted');
        // Return empty result to prevent crash
        return { data: null } as any;
      }
      console.error('[Graph Service] ❌ Query failed:', error);
      throw new Error(`Failed to query subgraph: ${error.message}`);
    }
  }

  // ============================================
  // USER QUERIES
  // ============================================

  async getUserByWallet(walletAddress: string) {
    const query = `
      query GetUser($walletAddress: String!) {
        user(id: $walletAddress) {
          id
          walletAddress
          role
          status
          createdAt
          displayName
          username
        }
      }
    `;

    const result = await this.query(query, { walletAddress: walletAddress.toLowerCase() });
    const user = result.data?.user;
    if (!user) return null;

    return {
      ...user,
      isActive: user.status === 'ACTIVE' || user.status === '1',
      registeredAt: user.createdAt,
      // Provide compatibility fields
      displayName: user.displayName || user.username || 'System User'
    };
  }

  async getUserProfile(walletAddress: string) {
    return this.getUserByWallet(walletAddress);
  }

  async getUsersByRole(role: string, pagination?: PaginationParams) {
    const query = `
      query GetUsersByRole($role: String!, $first: Int, $skip: Int) {
        users(where: { role: $role }, first: $first, skip: $skip) {
          id
          walletAddress
          role
          country
          isActive
          registeredAt
        }
      }
    `;

    const result = await this.query(query, {
      role,
      first: pagination?.first || 100,
      skip: pagination?.skip || 0,
    });

    return result.data?.users || [];
  }

  // ============================================
  // BUSINESS QUERIES
  // ============================================

  async getBusinessById(businessId: string) {
    const query = `
      query GetBusiness($businessId: String!) {
        business: restaurant(id: $businessId) {
          id
          owner { id }
          country
          status
          createdAt
          metadataCid
        }
      }
    `;

    const result = await this.query(query, { businessId });
    const business = result.data?.business;
    if (!business) return null;

    return {
      ...business,
      isActive: business.status === 1,
      metadataURI: business.metadataCid,
      // Provide compatibility fields
      businessType: business.businessType || 'Retail',
      plan: business.plan || 'STARTER'
    };
  }

  async getBusinessesByOwner(ownerAddress: string, pagination?: PaginationParams) {
    const query = `
      query GetBusinessesByOwner($owner: String!, $first: Int, $skip: Int) {
        businesses: restaurants(
          where: { owner: $owner }, 
          first: $first, 
          skip: $skip, 
          orderBy: createdAt, 
          orderDirection: desc
        ) {
          id
          status
          country
          createdAt
          metadataCid
          # businessType and plan are optional
        }
      }
    `;

    const result = await this.query(query, {
      owner: ownerAddress.toLowerCase(),
      first: pagination?.first || 10,
      skip: pagination?.skip || 0,
    });

    const items = result.data?.businesses || [];
    return items.map((b: any) => ({
      ...b,
      isActive: b.status === 1,
      metadataURI: b.metadataCid,
      businessType: b.businessType || 'Retail',
      plan: b.plan || 'STARTER'
    }));
  }

  async getAllBusinesses(filters?: {
    plan?: string;
    country?: string;
    status?: number;
  }, pagination?: PaginationParams) {
    const query = `
      query GetAllBusinesses($first: Int, $skip: Int) {
        businesses: restaurants(
          first: $first, 
          skip: $skip, 
          orderBy: createdAt, 
          orderDirection: desc
        ) {
          id
          owner {
            id
          }
          status
          country
          createdAt
          metadataCid
          # businessType and plan are optional/new, providing fallbacks in UI
          # tokenId
        }
      }
    `;

    const result = await this.query(query, {
      first: pagination?.first || 100,
      skip: pagination?.skip || 0,
    });

    // Post-query normalization for UI compatibility
    const items = result.data?.businesses || [];
    return items.map((b: any) => ({
      ...b,
      isActive: b.status === 1,
      metadataURI: b.metadataCid,
      // Fallbacks for missing schema fields
      businessType: b.businessType || 'Retail',
      plan: b.plan || 'STARTER'
    }));
  }

  // ============================================
  // PRODUCT QUERIES
  // ============================================

  async getProductsByBusiness(businessId: string, pagination?: PaginationParams) {
    const query = `
      query GetProducts($businessId: String!, $first: Int, $skip: Int) {
        products(where: { businessId: $businessId, isActive: true }, first: $first, skip: $skip) {
          id
          sku
          barcode
          price
          stock
          minStock
          isActive
          metadataURI
        }
      }
    `;

    const result = await this.query(query, {
      businessId,
      first: pagination?.first || 100,
      skip: pagination?.skip || 0,
    });

    return result.data?.products || [];
  }

  async getInventoryBySupplier(supplierId: string, pagination?: PaginationParams) {
    const query = `
      query GetSupplierInventory($supplierId: String!, $first: Int, $skip: Int) {
        inventoryItems(where: { supplier: $supplierId }, first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
          id
          name
          category
          tokenId
          metadataCid
          currentStock
          reorderPoint
          unitCostUsd6
          currency
          isActive
          createdAt
        }
      }
    `;

    const result = await this.query(query, {
      supplierId: supplierId.toLowerCase(),
      first: pagination?.first || 100,
      skip: pagination?.skip || 0,
    });

    return result.data?.inventoryItems || [];
  }

  async getProductById(productId: string) {
    const query = `
      query GetProduct($productId: String!) {
        product(id: $productId) {
          id
          businessId
          sku
          barcode
          price
          cost
          stock
          minStock
          supplierId
          isActive
          createdAt
          metadataURI
        }
      }
    `;

    const result = await this.query(query, { productId });
    return result.data?.product;
  }

  // ============================================
  // ORDER QUERIES
  // ============================================

  async getOrdersByBusiness(businessId: string, pagination?: PaginationParams) {
    const query = `
      query GetOrders($businessId: String!, $first: Int, $skip: Int) {
        orders(where: { restaurant: $businessId }, first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
          id
          customer { id }
          amountUsd6
          totalAmountUsd6
          status
          paymentStatus
          createdAt
        }
      }
    `;

    const result = await this.query(query, {
      businessId,
      first: pagination?.first || 50,
      skip: pagination?.skip || 0,
    });

    return result.data?.orders || [];
  }

  async getPurchaseOrdersBySupplier(supplierId: string, pagination?: PaginationParams) {
    const query = `
      query GetPurchaseOrders($supplierId: String!, $first: Int, $skip: Int) {
        purchaseOrders(where: { supplier: $supplierId }, first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
          id
          restaurant { id }
          status
          totalAmountUsd6
          createdAt
          fulfilledAt
          dueDate
          creditUsed
        }
      }
    `;

    const result = await this.query(query, {
      supplierId: supplierId.toLowerCase(),
      first: pagination?.first || 50,
      skip: pagination?.skip || 0,
    });

    return result.data?.purchaseOrders || [];
  }

  async getSupplier(id: string) {
    const query = `
      query GetSupplier($id: String!) {
        supplier(id: $id) {
          id
          totalVolumeUsd6
          activeOrders
          totalOrders
          pendingBalanceUsd6
          availableBalanceUsd6
          metadataURI
        }
      }
    `;

    const result = await this.query(query, { id: id.toLowerCase() });
    return result.data?.supplier;
  }

  async getOrdersByCustomer(customerId: string, pagination?: PaginationParams) {
    const query = `
      query GetCustomerOrders($customerId: String!, $first: Int, $skip: Int) {
        orders(where: { customerId: $customerId }, first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
          id
          businessId
          total
          status
          paymentMethod
          createdAt
          metadataURI
        }
      }
    `;

    const result = await this.query(query, {
      customerId: customerId.toLowerCase(),
      first: pagination?.first || 50,
      skip: pagination?.skip || 0,
    });

    return result.data?.orders || [];
  }

  // ============================================
  // EMPLOYEE QUERIES
  // ============================================

  async getEmployeesByBusiness(businessId: string) {
    const query = `
      query GetEmployees($businessId: String!) {
        employees(where: { businessId: $businessId, isActive: true }) {
          id
          walletAddress
          role
          salary
          salaryType
          isActive
          hiredAt
          metadataURI
        }
      }
    `;

    const result = await this.query(query, { businessId });
    return result.data?.employees || [];
  }

  // ============================================
  // DELIVERY QUERIES
  // ============================================

  async getDeliveriesByDriver(driverId: string, pagination?: PaginationParams) {
    const query = `
      query GetDriverDeliveries($driverId: String!, $first: Int, $skip: Int) {
        deliveries(where: { driverId: $driverId }, first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
          id
          orderId
          status
          driverEarnings
          customerRating
          createdAt
          metadataURI
        }
      }
    `;

    const result = await this.query(query, {
      driverId: driverId.toLowerCase(),
      first: pagination?.first || 50,
      skip: pagination?.skip || 0,
    });

    return result.data?.deliveries || [];
  }

  async getActiveDeliveries(driverId?: string) {
    const whereClause = driverId
      ? `where: { driverId: "${driverId.toLowerCase()}", status_in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] }`
      : `where: { status_in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] }`;

    const query = `
      query GetActiveDeliveries {
        deliveries(${whereClause}) {
          id
          orderId
          driverId
          customerId
          status
          estimatedTime
          metadataURI
        }
      }
    `;

    const result = await this.query(query);
    return result.data?.deliveries || [];
  }

  async getAvailableOrdersForPickup(country?: string) {
    const whereClause = country ? `where: { status: "READY", deliveryDriver: null, country: "${country}" }` : `where: { status: "READY", deliveryDriver: null }`;
    const query = `
      query GetAvailableOrders {
        orders(${whereClause}, orderBy: createdAt, orderDirection: desc) {
          id
          restaurant { id metadataURI }
          totalAmountUsd6
          deliveryAddress
          createdAt
          metadataURI
        }
      }
    `;
    const result = await this.query(query);
    return result.data?.orders || [];
  }

  async getDeliveryByOrderId(orderId: string) {
    const query = `
      query GetDeliveryByOrder($orderId: String!) {
        deliveries(where: { orderId: $orderId }, first: 1) {
          id
          orderId
          driverId
          customerId
          status
          driverEarnings
          metadataURI
        }
      }
    `;
    const result = await this.query(query, { orderId });
    return result.data?.deliveries?.[0];
  }

  // ============================================
  // CUSTOMER QUERIES
  // ============================================

  async getCustomerByWallet(walletAddress: string) {
    const query = `
      query GetCustomer($walletAddress: String!) {
        customer(id: $walletAddress) {
          walletAddress
          loyaltyPoints
          totalOrders
          totalSpent
          tier
          isActive
          joinedAt
          metadataURI
        }
      }
    `;

    const result = await this.query(query, { walletAddress: walletAddress.toLowerCase() });
    return result.data?.customer;
  }

  // ============================================
  // COMMISSIONS QUERIES
  // ============================================

  async getCommissions(pagination?: PaginationParams) {
    const query = `
      query GetCommissions($first: Int, $skip: Int) {
        commissions(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
          id
          affiliate {
            id
            walletAddress
            metadataURI
          }
          business {
            id
            businessType
          }
          amount
          rate
          status
          createdAt
        }
      }
    `;

    const result = await this.query(query, {
      first: pagination?.first || 50,
      skip: pagination?.skip || 0,
    });

    return result.data?.commissions || [];
  }

  // ============================================
  // ANALYTICS QUERIES
  // ============================================

  async getBusinessStats(businessId: string) {
    const query = `
      query GetBusinessStats($businessId: String!) {
        business: restaurant(id: $businessId) {
          id
          totalOrders: orders(first: 1000) {
            id
            total: totalAmountUsd6
          }
          totalRevenue: orders(first: 1000) {
            total: totalAmountUsd6
          }
        }
      }
    `;

    const result = await this.query(query, { businessId });
    return result.data?.business;
  }

  // ============================================
  // PROTOCOL-WIDE QUERIES
  // ============================================

  async getProtocolStats() {
    const query = `
      query GetProtocolStats {
        protocolStats(id: "global") {
          totalOrders
          totalBusinesses: totalRestaurants
          totalSuppliers
          totalDeliveries
          totalRevenue: totalVolumeUsd6
          # activeUsers missing in ProtocolStats, using totalSuppliers as proxy
          activeUsers: totalSuppliers
        }
      }
    `;

    const result = await this.query(query);
    return result.data;
  }

  async getGlobalAnalytics() {
    const query = `
      query GetGlobalAnalytics {
        businesses: restaurants(first: 1000) {
          id
          isActive: status
        }
        orders(first: 1000, orderBy: createdAt, orderDirection: desc) {
          id
          total: totalAmountUsd6
          status
          createdAt
        }
      }
    `;

    const result = await this.query(query);
    return result.data;
  }

  async getFraudStats() {
    const query = `
      query GetFraudStats {
        anomalies: fraudAlerts(first: 1000) {
          id
          severity
          anomalyType
        }
      }
    `;

    const result = await this.query(query);
    return result.data?.anomalies || [];
  }

  async getDriverMetrics(driverId: string) {
    const query = `
      query GetDriverMetrics($driverId: String!) {
        driver(id: $driverId) {
          id
          rating
          totalDeliveries
          completedDeliveries
          isActive
          isAvailable
        }
      }
    `;

    const result = await this.query(query, {
      driverId: driverId.toLowerCase()
    });

    return result.data?.driver || null;
  }
}

// Singleton instance
export const graphService = new GraphService();
export default graphService;

// Convenience functions
export async function querySubgraph<T = any>(query: string, variables?: any): Promise<T | null> {
  const result = await graphService.query<T>(query, variables);
  return result.data || null;
}