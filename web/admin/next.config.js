const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export is enabled for production, but in dev it can sometimes cause chunking issues
  // output: 'export', 
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['ox', 'wagmi', 'viem', '@rainbow-me/rainbowkit', '@walletconnect/ethereum-provider', '@walletconnect/universal-provider'],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Standard aliases
    config.resolve.alias['wagmi'] = path.resolve(__dirname, 'node_modules/wagmi');
    config.resolve.alias['viem'] = path.resolve(__dirname, 'node_modules/viem');
    config.resolve.alias['@tanstack/react-query'] = path.resolve(__dirname, 'node_modules/@tanstack/react-query');

    // Handle pino-pretty for WalletConnect
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
      };
    }

    // Disable cache in development to solve Windows file lock/pack errors
    if (dev) {
      config.cache = false;
    }

    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };

    config.resolve.alias['@react-native-async-storage/async-storage'] = false;

    return config;
  },
};

module.exports = nextConfig;
