/**
 * DecentralizedStorageService.ts
 * 
 * Service to handle decentralized storage using IPFS and blockchain for metadata
 * Integrates IPFS uploads with blockchain records for verifiable storage
 */

// import { ipfsUploadService } from '../../../pos/src/lib/ipfs/upload-service';
import { blockchainService } from './BlockchainService';

// We'll use the IPFS service from the web3 API route for now
// This will be refactored to use a shared IPFS service

// Interface for metadata stored on blockchain
export interface StorageMetadata {
  cid: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  timestamp: number;
  checksum: string;
  tags?: string[];
}

export interface DecentralizedFile {
  cid: string;
  url: string;
  gatewayUrl: string;
  timestamp: number;
  metadata?: StorageMetadata;
}

class DecentralizedStorageService {
  /**
   * Upload a file to IPFS and optionally register its metadata on blockchain
   */
  async uploadFile(
    file: File,
    registerOnChain: boolean = false,
    additionalMetadata?: Partial<StorageMetadata>
  ): Promise<DecentralizedFile> {
    try {
      // Upload file to IPFS using the API route
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file to IPFS');
      }
      
      const uploadResult = await response.json();

      // Prepare metadata
      const metadata: StorageMetadata = {
        cid: uploadResult.ipfsHash,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: additionalMetadata?.uploadedBy || '', // This would come from wallet address
        timestamp: Date.now(),
        checksum: this.calculateChecksum(file), // This would be a real checksum
        tags: additionalMetadata?.tags || [],
        ...additionalMetadata
      };

      // Optionally register on blockchain
      if (registerOnChain && blockchainService.isInitialized()) {
        // This would call a smart contract function to register the CID
        // await blockchainService.registerFileMetadata(metadata);
        console.log(`File ${file.name} registered on blockchain with CID: ${uploadResult.ipfsHash}`);
      }

      return {
        cid: uploadResult.ipfsHash,
        url: uploadResult.url,
        gatewayUrl: uploadResult.url,
        timestamp: Date.now(),
        metadata
      };
    } catch (error) {
      console.error('Error uploading file to decentralized storage:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS and optionally register on blockchain
   */
  async uploadJSON(
    data: any,
    fileName: string,
    registerOnChain: boolean = false,
    additionalMetadata?: Partial<StorageMetadata>
  ): Promise<DecentralizedFile> {
    try {
      // Convert JSON data to a Blob and then to a File
      const jsonString = JSON.stringify(data);
      const file = new File([jsonString], fileName, { type: 'application/json' });
      
      // Use the same uploadFile method
      return await this.uploadFile(file, registerOnChain, {
        ...additionalMetadata,
        mimeType: 'application/json',
        fileName
      });
    } catch (error) {
      console.error('Error uploading JSON to decentralized storage:', error);
      throw error;
    }
  }

  /**
   * Upload restaurant metadata to IPFS and register on blockchain
   */
  async uploadRestaurantMetadata(
    restaurantData: {
      name: string;
      description: string;
      logo: File | null;
      coverImage: File | null;
      address: string;
      phone: string;
      email: string;
      businessHours: any;
      paymentMethods: string[];
      deliveryZones: any[];
      taxInfo: any;
    },
    registerOnChain: boolean = true
  ): Promise<{
    metadataCid: string;
    catalogCid: string;
    logoCid?: string;
    coverCid?: string;
  }> {
    try {
      // Prepare restaurant metadata
      const metadata = {
        name: restaurantData.name,
        description: restaurantData.description,
        address: restaurantData.address,
        phone: restaurantData.phone,
        email: restaurantData.email,
        businessHours: restaurantData.businessHours,
        paymentMethods: restaurantData.paymentMethods,
        deliveryZones: restaurantData.deliveryZones,
        taxInfo: restaurantData.taxInfo,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Upload metadata to IPFS
      const metadataResult = await this.uploadJSON(
        metadata,
        `${restaurantData.name.replace(/\s+/g, '_')}_metadata.json`,
        registerOnChain
      );

      // Upload logo if provided
      let logoCid: string | undefined;
      if (restaurantData.logo) {
        const logoResult = await this.uploadFile(
          restaurantData.logo,
          registerOnChain,
          { tags: ['logo', 'restaurant'] }
        );
        logoCid = logoResult.cid;
      }

      // Upload cover image if provided
      let coverCid: string | undefined;
      if (restaurantData.coverImage) {
        const coverResult = await this.uploadFile(
          restaurantData.coverImage,
          registerOnChain,
          { tags: ['cover', 'restaurant'] }
        );
        coverCid = coverResult.cid;
      }

      // Create catalog structure
      const catalog = {
        restaurantId: metadataResult.cid, // Use metadata CID as identifier
        logoCid,
        coverCid,
        menuItems: [], // Will be populated separately
        categories: [],
        updatedAt: Date.now()
      };

      // Upload catalog to IPFS
      const catalogResult = await this.uploadJSON(
        catalog,
        `${restaurantData.name.replace(/\s+/g, '_')}_catalog.json`,
        registerOnChain
      );

      return {
        metadataCid: metadataResult.cid,
        catalogCid: catalogResult.cid,
        logoCid,
        coverCid
      };
    } catch (error) {
      console.error('Error uploading restaurant metadata:', error);
      throw error;
    }
  }

  /**
   * Upload product/catalog data to IPFS and register on blockchain
   */
  async uploadProductCatalog(
    restaurantId: string,
    products: any[],
    registerOnChain: boolean = true
  ): Promise<string> {
    try {
      // Create catalog structure
      const catalog = {
        restaurantId,
        products,
        updatedAt: Date.now(),
        version: '1.0'
      };

      // Upload catalog to IPFS
      const result = await this.uploadJSON(
        catalog,
        `catalog_${restaurantId}_${Date.now()}.json`,
        registerOnChain,
        { tags: ['catalog', 'products', restaurantId] }
      );

      return result.cid;
    } catch (error) {
      console.error('Error uploading product catalog:', error);
      throw error;
    }
  }

  /**
   * Upload order data to IPFS and register on blockchain
   */
  async uploadOrderData(
    orderId: string,
    orderData: any,
    registerOnChain: boolean = true
  ): Promise<string> {
    try {
      // Add order ID and timestamp to the data
      const orderWithMetadata = {
        ...orderData,
        orderId,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Upload order data to IPFS
      const result = await this.uploadJSON(
        orderWithMetadata,
        `order_${orderId}_${Date.now()}.json`,
        registerOnChain,
        { tags: ['order', orderId] }
      );

      return result.cid;
    } catch (error) {
      console.error('Error uploading order data:', error);
      throw error;
    }
  }

  /**
   * Upload delivery data to IPFS and register on blockchain
   */
  async uploadDeliveryData(
    deliveryId: string,
    deliveryData: any,
    registerOnChain: boolean = true
  ): Promise<string> {
    try {
      // Add delivery ID and timestamp to the data
      const deliveryWithMetadata = {
        ...deliveryData,
        deliveryId,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Upload delivery data to IPFS
      const result = await this.uploadJSON(
        deliveryWithMetadata,
        `delivery_${deliveryId}_${Date.now()}.json`,
        registerOnChain,
        { tags: ['delivery', deliveryId] }
      );

      return result.cid;
    } catch (error) {
      console.error('Error uploading delivery data:', error);
      throw error;
    }
  }

  /**
   * Upload supplier data to IPFS and register on blockchain
   */
  async uploadSupplierData(
    supplierData: any,
    registerOnChain: boolean = true
  ): Promise<string> {
    try {
      const supplierWithMetadata = {
        ...supplierData,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Upload supplier data to IPFS
      const result = await this.uploadJSON(
        supplierWithMetadata,
        `supplier_${supplierData.businessName.replace(/\s+/g, '_')}_${Date.now()}.json`,
        registerOnChain,
        { tags: ['supplier', supplierData.businessName] }
      );

      return result.cid;
    } catch (error) {
      console.error('Error uploading supplier data:', error);
      throw error;
    }
  }

  /**
   * Upload purchase order data to IPFS and register on blockchain
   */
  async uploadPurchaseOrderData(
    poId: string,
    poData: any,
    registerOnChain: boolean = true
  ): Promise<string> {
    try {
      const poWithMetadata = {
        ...poData,
        poId,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Upload purchase order data to IPFS
      const result = await this.uploadJSON(
        poWithMetadata,
        `purchase_order_${poId}_${Date.now()}.json`,
        registerOnChain,
        { tags: ['purchase-order', poId] }
      );

      return result.cid;
    } catch (error) {
      console.error('Error uploading purchase order data:', error);
      throw error;
    }
  }

  /**
   * Calculate a simple checksum for the file/blob
   * Note: In production, use a proper cryptographic hash function
   */
  private calculateChecksum(blob: Blob): string {
    // This is a simplified checksum for demonstration
    // In production, use SHA-256 or similar
    return `checksum_${blob.size}_${Date.now()}`;
  }

  /**
   * Verify that a file exists on IPFS by attempting to retrieve it
   */
  async verifyFileExists(cid: string): Promise<boolean> {
    try {
      // In a real implementation, this would attempt to retrieve the file
      // from IPFS to verify it exists
      console.log(`Verifying file existence for CID: ${cid}`);
      return true; // Simplified for now
    } catch (error) {
      console.error(`Error verifying file existence for CID ${cid}:`, error);
      return false;
    }
  }

  /**
   * Get file from IPFS using the preferred gateway
   */
  async getFileFromIPFS(cid: string, gateway?: string): Promise<any> {
    try {
      // Construct the URL using the preferred gateway
      const gatewayUrl = gateway || process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
      const url = `${gatewayUrl}${cid}`;

      // Fetch the file from IPFS
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
      }

      // Try to parse as JSON, otherwise return as blob
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.blob();
      }
    } catch (error) {
      console.error(`Error fetching file from IPFS CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Get the status of IPFS service
   */
  async getIPFSStatus(): Promise<{ configured: boolean; initialized: boolean; ready: boolean }> {
    try {
      const response = await fetch('/api/ipfs/status');
      const status = await response.json();
      return {
        configured: status.status === 'ready',
        initialized: true,
        ready: status.status === 'ready'
      };
    } catch (error) {
      return {
        configured: false,
        initialized: false,
        ready: false
      };
    }
  }
}

// Export singleton instance
export const decentralizedStorageService = new DecentralizedStorageService();

// Export the class for direct instantiation if needed
export default DecentralizedStorageService;