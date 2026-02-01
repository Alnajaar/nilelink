// web/pos/src/lib/ipfs/upload-service.ts
'use client';

import { PinataSDK } from 'pinata-web3';
import { IPFS_CONFIG, isIPFSConfigured } from './config';

interface UploadResult {
  cid: string;
  url: string;
  gatewayUrl: string;
  timestamp: number;
}

interface FileMetadata {
  name: string;
  description?: string;
  mimeType: string;
  size: number;
  uploadedBy?: string;
  tags?: string[];
}

class IPFSUploadService {
  private pinata: PinataSDK | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    if (isIPFSConfigured()) {
      try {
        this.pinata = new PinataSDK({
          pinataJwt: IPFS_CONFIG.PINATA_JWT,
          pinataGateway: IPFS_CONFIG.GATEWAYS.pinata
        });
        this.initialized = true;
        console.log('IPFS Upload Service initialized');
      } catch (error) {
        console.error('Failed to initialize IPFS service:', error);
      }
    } else {
      console.warn('IPFS not configured - set PINATA_API_KEY and PINATA_SECRET_API_KEY');
    }
  }

  private async retry<T>(fn: () => Promise<T>, maxAttempts = IPFS_CONFIG.RETRY.MAX_ATTEMPTS): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`IPFS upload attempt ${attempt} failed:`, error);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, IPFS_CONFIG.RETRY.DELAY_MS * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  async uploadFile(file: File, metadata?: Partial<FileMetadata>): Promise<UploadResult> {
    if (!this.initialized || !this.pinata) {
      throw new Error('IPFS service not initialized');
    }

    // Validate file size
    if (file.size > IPFS_CONFIG.UPLOAD.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${IPFS_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Validate file type for images
    if (IPFS_CONFIG.UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      // Image validation passed
    } else if (file.type === 'application/json') {
      // JSON metadata validation
    } else {
      throw new Error(`File type ${file.type} not allowed`);
    }

    const fileMetadata: FileMetadata = {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      ...metadata
    };

    try {
      const result = await this.retry(async () => {
        const upload = await this.pinata!.upload.file(file);
        
        return {
          cid: upload.IpfsHash,
          url: `ipfs://${upload.IpfsHash}`,
          gatewayUrl: `${IPFS_CONFIG.GATEWAYS.pinata}${upload.IpfsHash}`,
          timestamp: Date.now()
        };
      });

      // Add metadata to Pinata
      if (this.pinata) {
        try {
          await this.pinata.upload.json({
            ...fileMetadata,
            cid: result.cid,
            uploadTimestamp: result.timestamp
          }).addMetadata({
            name: `${fileMetadata.name}_metadata`,
            keyvalues: {
              ...fileMetadata,
              cid: result.cid,
              uploadTimestamp: result.timestamp.toString()
            }
          });
        } catch (metadataError) {
          console.warn('Failed to upload metadata to Pinata:', metadataError);
        }
      }

      return result;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error(`Failed to upload file to IPFS: ${(error as Error).message}`);
    }
  }

  async uploadJSON(data: Record<string, any>, name: string): Promise<UploadResult> {
    if (!this.initialized || !this.pinata) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const result = await this.retry(async () => {
        const upload = await this.pinata!.upload.json(data);
        
        return {
          cid: upload.IpfsHash,
          url: `ipfs://${upload.IpfsHash}`,
          gatewayUrl: `${IPFS_CONFIG.GATEWAYS.pinata}${upload.IpfsHash}`,
          timestamp: Date.now()
        };
      });

      // Add name metadata
      if (this.pinata) {
        try {
          await this.pinata.upload.json({
            ...data,
            cid: result.cid,
            name,
            uploadTimestamp: result.timestamp
          }).addMetadata({
            name: name,
            keyvalues: {
              name,
              cid: result.cid,
              uploadTimestamp: result.timestamp.toString()
            }
          });
        } catch (metadataError) {
          console.warn('Failed to upload JSON metadata to Pinata:', metadataError);
        }
      }

      return result;
    } catch (error) {
      console.error('IPFS JSON upload failed:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${(error as Error).message}`);
    }
  }

  async uploadProductImage(file: File, productId: string, productName: string): Promise<UploadResult> {
    const metadata: Partial<FileMetadata> = {
      name: `${productName}_image`,
      description: `Product image for ${productName} (${productId})`,
      tags: ['product-image', 'nilelink-pos', productId]
    };

    return await this.uploadFile(file, metadata);
  }

  async uploadProductMetadata(productData: Record<string, any>, productId: string): Promise<UploadResult> {
    const metadata = {
      ...productData,
      productId,
      timestamp: Date.now(),
      source: 'nilelink-pos'
    };

    return await this.uploadJSON(metadata, `product_${productId}_metadata`);
  }

  isReady(): boolean {
    return this.initialized && !!this.pinata;
  }

  getConfigStatus(): { configured: boolean; initialized: boolean; ready: boolean } {
    return {
      configured: isIPFSConfigured(),
      initialized: this.initialized,
      ready: this.isReady()
    };
  }
}

// Singleton instance
export const ipfsUploadService = new IPFSUploadService();

// Hook for React components
export const useIPFSUpload = () => {
  return {
    uploadFile: ipfsUploadService.uploadFile.bind(ipfsUploadService),
    uploadJSON: ipfsUploadService.uploadJSON.bind(ipfsUploadService),
    uploadProductImage: ipfsUploadService.uploadProductImage.bind(ipfsUploadService),
    uploadProductMetadata: ipfsUploadService.uploadProductMetadata.bind(ipfsUploadService),
    isReady: ipfsUploadService.isReady.bind(ipfsUploadService),
    getConfigStatus: ipfsUploadService.getConfigStatus.bind(ipfsUploadService)
  };
};