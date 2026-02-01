// web/pos/src/lib/ipfs/config.ts
export const IPFS_CONFIG = {
  // Pinata API configuration
  PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
  PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || '',
  PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  
  // IPFS Gateway URLs
  GATEWAYS: {
    pinata: 'https://gateway.pinata.cloud/ipfs/',
    cloudflare: 'https://cloudflare-ipfs.com/ipfs/',
    ipfs: 'https://ipfs.io/ipfs/',
    dweb: 'https://dweb.link/ipfs/'
  },
  
  // Upload settings
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_METADATA_TYPES: ['application/json']
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000
  }
};

export const isIPFSConfigured = (): boolean => {
  return !!(
    IPFS_CONFIG.PINATA_API_KEY && 
    IPFS_CONFIG.PINATA_SECRET_API_KEY
  );
};

export const getDefaultGateway = (): string => {
  return IPFS_CONFIG.GATEWAYS.pinata;
};

export const getIPFSGatewayURL = (cid: string, gateway: keyof typeof IPFS_CONFIG.GATEWAYS = 'pinata'): string => {
  return `${IPFS_CONFIG.GATEWAYS[gateway]}${cid}`;
};