/**
 * Products API Service
 * Handles all product and inventory-related API calls for POS and marketplace
 */

import apiService, { ApiResponse } from './api';
import web3Service from './Web3Service'; // Added for anchoring

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  images?: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListing {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  type: 'PHYSICAL' | 'SERVICE';
  category?: string;
  images?: string[];
  seller: {
    id: string;
    name: string;
    rating?: number;
  };
  isAvailable: boolean;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  reference?: string;
  relatedOrderId?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface StockLevel {
  productId: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastRestocked?: string;
}

// ============================================================================
// PRODUCTS API SERVICE
// ============================================================================

class ProductsService {
  private baseEndpoint = '/products';
  private inventoryEndpoint = '/inventory';
  private marketplaceEndpoint = '/marketplace/listings';

  // ========== DECENTRALIZED METHODS ==========

  /**
   * Fetch catalog from local static file (pinned with the app on IPFS)
   */
  async getDecentralizedCatalog(): Promise<any> {
    try {
      const response = await fetch('/catalog.json');
      if (!response.ok) throw new Error('Failed to fetch decentralized catalog');
      return await response.json();
    } catch (error) {
      console.warn('⚠️ Decentralized catalog fetch failed, falling back to mock data', error);
      return null;
    }
  }

  // ========== PRODUCTS (POS/INVENTORY) ==========

  /**
   * Get all products with filters
   */
  async getProducts(filters?: {
    category?: string;
    search?: string;
    inStock?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{
    products: Product[];
    total: number;
    page?: number;
    pageSize?: number;
  }>> {
    if (process.env.NEXT_PUBLIC_DECENTRALIZED === 'true') {
      const catalog = await this.getDecentralizedCatalog();
      if (catalog) {
        let products = catalog.products as Product[];
        if (filters?.category) {
          products = products.filter(p => p.category === filters.category);
        }
        if (filters?.search) {
          const search = filters.search.toLowerCase();
          products = products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.sku.toLowerCase().includes(search)
          );
        }
        return {
          success: true,
          data: {
            products,
            total: products.length,
            page: 1,
            pageSize: products.length
          }
        };
      }
    }
    return apiService.get(this.baseEndpoint, { params: filters });
  }

  /**
   * Get a specific product by ID or SKU
   */
  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`${this.baseEndpoint}/${productId}`);
  }

  /**
   * Search products by barcode or SKU
   */
  async searchProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`${this.baseEndpoint}/search/barcode/${barcode}`);
  }

  /**
   * Create a new product (POS admin)
   */
  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await apiService.post<Product>(this.baseEndpoint, data);

    // Anchor on-chain if API call was successful
    if (response.success && response.data) {
      try {
        await web3Service.addInventoryItemOnChain(
          response.data.id,
          (response.data as any).supplierId || '0x0000000000000000000000000000000000000000',
          response.data.name,
          response.data.category,
          response.data.minStock || 0,
          response.data.price
        );
      } catch (e) {
        console.warn('[DECENTRALIZED] On-chain anchor failed but ID persists:', e);
      }
    }

    return response;
  }

  /**
   * Update a product
   */
  async updateProduct(productId: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiService.put<Product>(`${this.baseEndpoint}/${productId}`, data);
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`${this.baseEndpoint}/${productId}`);
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(updates: Array<{
    productId: string;
    data: Partial<Product>;
  }>): Promise<ApiResponse<Product[]>> {
    return apiService.post<Product[]>(`${this.baseEndpoint}/bulk-update`, { updates });
  }

  // ========== INVENTORY MANAGEMENT ==========

  /**
   * Get inventory transactions for a product
   */
  async getInventoryTransactions(productId: string, filters?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<InventoryTransaction[]>> {
    return apiService.get<InventoryTransaction[]>(
      `${this.inventoryEndpoint}/${productId}/transactions`,
      { params: filters }
    );
  }

  /**
   * Record a stock movement (POS checkout, receiving, adjustment)
   */
  async recordStockMovement(productId: string, data: {
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    reference?: string;
    notes?: string;
  }): Promise<ApiResponse<InventoryTransaction>> {
    return apiService.post<InventoryTransaction>(
      `${this.inventoryEndpoint}/${productId}/move`,
      data
    );
  }

  /**
   * Update product stock level
   */
  async updateStock(productId: string, quantity: number): Promise<ApiResponse<StockLevel>> {
    return apiService.patch<StockLevel>(
      `${this.inventoryEndpoint}/${productId}/level`,
      { quantity }
    );
  }

  /**
   * Get current stock level
   */
  async getStockLevel(productId: string): Promise<ApiResponse<StockLevel>> {
    return apiService.get<StockLevel>(`${this.inventoryEndpoint}/${productId}/level`);
  }

  /**
   * Get all stock levels
   */
  async getAllStockLevels(): Promise<ApiResponse<StockLevel[]>> {
    return apiService.get<StockLevel[]>(`${this.inventoryEndpoint}/levels`);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    return apiService.get<Product[]>(`${this.inventoryEndpoint}/low-stock`);
  }

  /**
   * Get inventory value report
   */
  async getInventoryValue(): Promise<ApiResponse<{
    totalValue: number;
    currency: string;
    totalItems: number;
    byCategory: Array<{
      category: string;
      value: number;
      quantity: number;
    }>;
  }>> {
    return apiService.get(`${this.inventoryEndpoint}/value`);
  }

  // ========== MARKETPLACE LISTINGS ==========

  /**
   * Get marketplace listings with filters
   */
  async getListings(filters?: {
    category?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{
    listings: ProductListing[];
    total: number;
  }>> {
    return apiService.get(this.marketplaceEndpoint, { params: filters });
  }

  /**
   * Get a specific listing
   */
  async getListing(listingId: string): Promise<ApiResponse<ProductListing>> {
    return apiService.get<ProductListing>(`${this.marketplaceEndpoint}/${listingId}`);
  }

  /**
   * Create a marketplace listing
   */
  async createListing(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    type: 'PHYSICAL' | 'SERVICE';
    category?: string;
    images?: string[];
  }): Promise<ApiResponse<ProductListing>> {
    return apiService.post<ProductListing>(this.marketplaceEndpoint, data);
  }

  /**
   * Update a listing
   */
  async updateListing(listingId: string, data: Partial<ProductListing>): Promise<ApiResponse<ProductListing>> {
    return apiService.patch<ProductListing>(`${this.marketplaceEndpoint}/${listingId}`, data);
  }

  /**
   * Delete a listing
   */
  async deleteListing(listingId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`${this.marketplaceEndpoint}/${listingId}`);
  }

  // ========== CATEGORIES ==========

  /**
   * Get all product categories
   */
  async getCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    icon?: string;
  }>>> {
    return apiService.get(`${this.baseEndpoint}/categories`);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
    return apiService.get<Product[]>(`${this.baseEndpoint}/category/${categoryId}`);
  }
}

// Create singleton instance
export const productsService = new ProductsService();

export default productsService;
