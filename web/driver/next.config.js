const path = require('path');

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'polygon',
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com',
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0',
  },
  webpack: (config) => {
    config.resolve.alias['@shared'] = path.resolve(__dirname, '../shared');
    return config;
  }
};

module.exports = nextConfig;
