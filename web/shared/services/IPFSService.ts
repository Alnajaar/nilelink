/**
 * IPFS Service (Pinata Integration)
 * Handles all decentralized file storage via Pinata
 * 
 * USE CASES:
 * - Upload product images
 * - Store business metadata
 * - Store order receipts
 * - Store compliance documents
 * - Store consent text
 */

import { IPFSUploadResponse, PinataMetadata } from '../types/database';

// Pinata API configuration from environment
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

export class IPFSService {
  private apiKey: string;
  private secretKey: string;
  private jwt: string;
  private gateway: string;

  constructor() {
    this.apiKey = PINATA_API_KEY;
    this.secretKey = PINATA_SECRET_KEY;
    this.jwt = PINATA_JWT;
    this.gateway = IPFS_GATEWAY;

    if (!this.jwt && (!this.apiKey || !this.secretKey)) {
      console.warn('[IPFS Service] Warning: Pinata credentials not configured');
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any, metadata?: PinataMetadata): Promise<IPFSUploadResponse> {
    try {
      const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

      const body = {
        pinataContent: data,
        pinataMetadata: metadata || {},
        pinataOptions: {
          cidVersion: 1,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.jwt}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('[IPFS Service] ✅ JSON uploaded:', result.IpfsHash);

      return result as IPFSUploadResponse;
    } catch (error: any) {
      console.error('[IPFS Service] ❌ Upload failed:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(file: File, metadata?: PinataMetadata): Promise<IPFSUploadResponse> {
    try {
      const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify(metadata));
      }

      formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS file upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('[IPFS Service] ✅ File uploaded:', result.IpfsHash);

      return result as IPFSUploadResponse;
    } catch (error: any) {
      console.error('[IPFS Service] ❌ File upload failed:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Fetch data from IPFS
   */
  async fetch<T = any>(ipfsHash: string): Promise<T> {
    try {
      const url = `${this.gateway}${ipfsHash}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      console.error('[IPFS Service] ❌ Fetch failed:', error);
      throw new Error(`Failed to fetch from IPFS: ${error.message}`);
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  getURL(ipfsHash: string): string {
    return `${this.gateway}${ipfsHash}`;
  }

  /**
   * Unpin content from Pinata (delete)
   */
  async unpin(ipfsHash: string): Promise<void> {
    try {
      const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error(`IPFS unpin failed: ${response.statusText}`);
      }

      console.log('[IPFS Service] ✅ Unpinned:', ipfsHash);
    } catch (error: any) {
      console.error('[IPFS Service] ❌ Unpin failed:', error);
      throw new Error(`Failed to unpin from IPFS: ${error.message}`);
    }
  }

  /**
   * List all pinned content
   */
  async listPinned(): Promise<any[]> {
    try {
      const url = 'https://api.pinata.cloud/data/pinList?status=pinned';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error(`IPFS list failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.rows || [];
    } catch (error: any) {
      console.error('[IPFS Service] ❌ List failed:', error);
      throw new Error(`Failed to list pinned content: ${error.message}`);
    }
  }

  /**
   * Upload product metadata to IPFS
   */
  async uploadProductMetadata(metadata: {
    name: string;
    nameAr?: string;
    description?: string;
    category: string;
    images: string[];
    [key: string]: any;
  }): Promise<string> {
    const result = await this.uploadJSON(metadata, {
      name: `product-${metadata.name}`,
      keyvalues: {
        type: 'product_metadata',
        category: metadata.category,
      },
    });

    return result.IpfsHash;
  }

  /**
   * Upload business metadata to IPFS
   */
  async uploadBusinessMetadata(metadata: {
    name: string;
    description?: string;
    logo?: string;
    address: any;
    [key: string]: any;
  }): Promise<string> {
    const result = await this.uploadJSON(metadata, {
      name: `business-${metadata.name}`,
      keyvalues: {
        type: 'business_metadata',
      },
    });

    return result.IpfsHash;
  }

  /**
   * Upload order metadata to IPFS
   */
  async uploadOrderMetadata(order: {
    items: any[];
    total: string;
    invoiceNumber: string;
    [key: string]: any;
  }): Promise<string> {
    const result = await this.uploadJSON(order, {
      name: `order-${order.invoiceNumber}`,
      keyvalues: {
        type: 'order_metadata',
        invoice: order.invoiceNumber,
      },
    });

    return result.IpfsHash;
  }

  /**
   * Upload employee metadata to IPFS
   */
  async uploadEmployeeMetadata(employee: {
    firstName: string;
    lastName: string;
    workSchedule: any;
    [key: string]: any;
  }): Promise<string> {
    const result = await this.uploadJSON(employee, {
      name: `employee-${employee.firstName}-${employee.lastName}`,
      keyvalues: {
        type: 'employee_metadata',
      },
    });

    return result.IpfsHash;
  }

  /**
   * Upload consent document to IPFS
   */
  async uploadConsentDocument(consent: {
    type: string;
    version: string;
    textEn: string;
    textAr: string;
  }): Promise<string> {
    const result = await this.uploadJSON(consent, {
      name: `consent-${consent.type}-v${consent.version}`,
      keyvalues: {
        type: 'consent_document',
        consentType: consent.type,
        version: consent.version,
      },
    });

    return result.IpfsHash;
  }
}

// Singleton instance
export const ipfsService = new IPFSService();

// Convenience functions
export async function uploadToIPFS(data: any, metadata?: PinataMetadata): Promise<string> {
  const result = await ipfsService.uploadJSON(data, metadata);
  return result.IpfsHash;
}

export async function uploadFileToIPFS(file: File, metadata?: PinataMetadata): Promise<string> {
  const result = await ipfsService.uploadFile(file, metadata);
  return result.IpfsHash;
}

export async function fetchFromIPFS<T = any>(ipfsHash: string): Promise<T> {
  return ipfsService.fetch<T>(ipfsHash);
}

export function getIPFSUrl(ipfsHash: string): string {
  return ipfsService.getURL(ipfsHash);
}