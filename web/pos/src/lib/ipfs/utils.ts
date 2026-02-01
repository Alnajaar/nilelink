// web/pos/src/lib/ipfs/utils.ts
import { IPFS_CONFIG, getIPFSGatewayURL } from './config';

export interface IPFSFileInfo {
  cid: string;
  name: string;
  size?: number;
  mimeType?: string;
  gatewayUrl: string;
  ipfsUrl: string;
}

export const validateFileSize = (file: File): boolean => {
  return file.size <= IPFS_CONFIG.UPLOAD.MAX_FILE_SIZE;
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [...IPFS_CONFIG.UPLOAD.ALLOWED_IMAGE_TYPES, ...IPFS_CONFIG.UPLOAD.ALLOWED_METADATA_TYPES];
  return allowedTypes.includes(file.type);
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const createIPFSFileInfo = (cid: string, name: string, options?: {
  size?: number;
  mimeType?: string;
}): IPFSFileInfo => {
  return {
    cid,
    name,
    size: options?.size,
    mimeType: options?.mimeType,
    gatewayUrl: getIPFSGatewayURL(cid),
    ipfsUrl: `ipfs://${cid}`
  };
};

export const isCID = (cid: string): boolean => {
  // Basic CID validation - checks if it looks like a valid IPFS CID
  const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/;
  return cidRegex.test(cid);
};

export const getOptimizedGatewayUrl = (cid: string): string => {
  // Return the fastest/most reliable gateway
  return getIPFSGatewayURL(cid, 'pinata');
};

export const getMultipleGatewayUrls = (cid: string): string[] => {
  return Object.values(IPFS_CONFIG.GATEWAYS).map(gateway => `${gateway}${cid}`);
};

export const prefetchIPFSContent = async (cid: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const urls = getMultipleGatewayUrls(cid);
    
    // Try to prefetch from multiple gateways for redundancy
    await Promise.allSettled(
      urls.map(url => 
        fetch(url, { 
          method: 'HEAD',
          mode: 'cors'
        }).catch(() => null)
      )
    );
  } catch (error) {
    console.warn('Failed to prefetch IPFS content:', error);
  }
};

export const estimateUploadCost = (fileSize: number): { 
  estimatedCost: string; 
  fileSizeFormatted: string 
} => {
  const fileSizeFormatted = formatBytes(fileSize);
  
  // Rough estimation - actual costs depend on Pinata pricing
  const estimatedCost = fileSize > 1024 * 1024 ? 
    '$0.01 - $0.05' : 
    '$0.001 - $0.01';
  
  return {
    estimatedCost,
    fileSizeFormatted
  };
};

// Cache for recently accessed IPFS content
class IPFSCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

export const ipfsCache = new IPFSCache();